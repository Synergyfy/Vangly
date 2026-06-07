import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { ContactMatchService } from './contact-match.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  BulkCreateContactDto,
  CreateContactDto,
  ListContactsQueryDto,
  UpdateContactDto,
} from './dto/contact.dto';

type ContactRow = Awaited<
  ReturnType<PrismaService['contact']['findFirstOrThrow']>
>;

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matcher: ContactMatchService,
    private readonly audit: OrgAuditService,
  ) {}

  async list(
    authUser: AuthUser,
    query: ListContactsQueryDto,
    page: number,
    pageSize: number,
  ) {
    const where: Prisma.ContactWhereInput = {
      organization_id: authUser.organization_id!,
    };
    if (this.isBranchScoped(authUser.role) && authUser.branch_id) {
      where.location_id = authUser.branch_id;
    } else if (this.isWorker(authUser.role)) {
      where.owner_user_id = authUser.sub;
    }
    if (query.status) where.status = query.status;
    if (query.owner_user_id) where.owner_user_id = query.owner_user_id;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.contact.count({ where }),
      this.prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          organization_id: true,
          location_id: true,
          owner_user_id: true,
          source_user_id: true,
          name: true,
          phone: true,
          email: true,
          note: true,
          status: true,
          source_kind: true,
          last_messaged_at: true,
          createdAt: true,
          updated_at: true,
        },
      }),
    ]);

    return {
      data,
      page,
      page_size: pageSize,
      total,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async get(authUser: AuthUser, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    this.assertCanRead(authUser, contact);
    return contact;
  }

  async create(
    authUser: AuthUser,
    dto: CreateContactDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    if (!this.canCreate(authUser.role)) {
      throw new ForbiddenException('Cannot create contacts');
    }
    const phone = this.matcher.normalizePhone(dto.phone);
    const match = await this.matcher.matchOrCreate({
      organizationId: authUser.organization_id!,
      phone,
      name: dto.name,
      email: dto.email,
      locationId: this.isBranchScoped(authUser.role)
        ? (authUser.branch_id ?? undefined)
        : undefined,
      ownerUserId: this.isWorker(authUser.role) ? authUser.sub : undefined,
      sourceUserId: authUser.sub,
      sourceKind: this.isBranchScoped(authUser.role) ? 'branch_qr' : 'worker',
    });

    const full = await this.prisma.contact.findUnique({
      where: { id: match.id },
    });
    if (dto.note) {
      await this.prisma.contact.update({
        where: { id: match.id },
        data: { note: dto.note },
      });
    }
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: full?.location_id ?? null,
      entity: 'Contact',
      entityId: match.id,
      action: 'create',
      diff: { after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return { ...full, note: dto.note ?? null };
  }

  async update(
    authUser: AuthUser,
    id: string,
    dto: UpdateContactDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    const current = await this.prisma.contact.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!current) throw new NotFoundException('Contact not found');
    this.assertCanWrite(authUser, current);

    const updated = await this.prisma.contact.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        phone: dto.phone ? this.matcher.normalizePhone(dto.phone) : undefined,
        email: dto.email ?? undefined,
        note: dto.note ?? undefined,
        status: dto.status ?? undefined,
      },
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: updated.location_id,
      entity: 'Contact',
      entityId: id,
      action: 'update',
      diff: { before: current, after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return updated;
  }

  async remove(
    authUser: AuthUser,
    id: string,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    const current = await this.prisma.contact.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!current) throw new NotFoundException('Contact not found');
    if (
      !this.isOrgAdmin(authUser.role) &&
      !(
        this.isBranchScoped(authUser.role) &&
        current.location_id === authUser.branch_id
      )
    ) {
      throw new ForbiddenException('Cannot delete this contact');
    }
    await this.prisma.contact.delete({ where: { id } });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: current.location_id,
      entity: 'Contact',
      entityId: id,
      action: 'delete',
      diff: { before: current },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return { id, deleted: true };
  }

  async bulkCreate(
    authUser: AuthUser,
    dto: BulkCreateContactDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    if (!this.canCreate(authUser.role)) {
      throw new ForbiddenException('Cannot bulk-create contacts');
    }
    if (!Array.isArray(dto.contacts) || dto.contacts.length === 0) {
      throw new BadRequestException('contacts must be a non-empty array');
    }
    if (dto.contacts.length > 5000) {
      throw new BadRequestException('Maximum 5000 contacts per request');
    }

    const results: Array<{ id: string; status: string; created: boolean }> = [];
    const sourceKind = this.isBranchScoped(authUser.role)
      ? 'branch_qr'
      : 'worker';

    for (const c of dto.contacts) {
      const match = await this.matcher.matchOrCreate({
        organizationId: authUser.organization_id!,
        phone: this.matcher.normalizePhone(c.phone),
        name: c.name,
        email: c.email,
        locationId: this.isBranchScoped(authUser.role)
          ? (authUser.branch_id ?? undefined)
          : undefined,
        ownerUserId: this.isWorker(authUser.role) ? authUser.sub : undefined,
        sourceUserId: authUser.sub,
        sourceKind,
      });
      results.push({
        id: match.id,
        status: match.status,
        created: !match.matched,
      });
    }

    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      entity: 'Contact',
      entityId: 'bulk',
      action: 'bulk_create',
      diff: {
        count: results.length,
        created: results.filter((r) => r.created).length,
      },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });

    return { count: results.length, results };
  }

  private isOrgAdmin(role: string | null): boolean {
    const normalized = role === 'branch_admin' ? 'location_admin' : role;
    return normalized === 'organization_admin' || normalized === 'super_admin';
  }
  private isBranchScoped(role: string | null): boolean {
    return role === 'location_admin' || role === 'branch_admin';
  }
  private isWorker(role: string | null): boolean {
    return role === 'worker';
  }
  private canCreate(role: string | null): boolean {
    return [
      'worker',
      'location_admin',
      'branch_admin',
      'organization_admin',
      'super_admin',
    ].includes(role ?? '');
  }
  private assertCanRead(authUser: AuthUser, contact: ContactRow) {
    if (this.isOrgAdmin(authUser.role)) return;
    if (
      this.isBranchScoped(authUser.role) &&
      contact.location_id === authUser.branch_id
    )
      return;
    if (contact.owner_user_id === authUser.sub) return;
    throw new ForbiddenException('Cannot view this contact');
  }
  private assertCanWrite(authUser: AuthUser, contact: ContactRow) {
    if (this.isOrgAdmin(authUser.role)) return;
    if (
      this.isBranchScoped(authUser.role) &&
      contact.location_id === authUser.branch_id
    )
      return;
    throw new ForbiddenException('Cannot update this contact');
  }
}
