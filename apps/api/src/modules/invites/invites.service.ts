import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { SmsService } from '../../infra/sms/sms.service';
import { newId } from '../../common/utils/hash';
import { newPublicId } from '../../common/utils/nanoid';
import { FormsService } from '../forms/forms.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  CreateInviteLinkDto,
  ShareInviteLinkDto,
  UpdateInviteLinkDto,
} from './dto/invite.dto';

type InviteLinkRow = Awaited<
  ReturnType<PrismaService['inviteLink']['findFirstOrThrow']>
>;

@Injectable()
export class InvitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: OrgAuditService,
    private readonly forms: FormsService,
    private readonly sms: SmsService,
  ) {}

  async getOrCreatePersonalLink(authUser: AuthUser) {
    const existing = await this.prisma.inviteLink.findFirst({
      where: {
        organization_id: authUser.organization_id!,
        owner_user_id: authUser.sub,
        status: 'active',
        team_id: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return this.decorate(existing);

    let form: { id: string; public_id: string; public_url: string };
    try {
      form = await this.forms.ensureFirstTimerForm({
        organizationId: authUser.organization_id!,
        ownerUserId: authUser.sub,
        name: (await this.getUserName(authUser.sub)) ?? 'Worker',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'unknown';
      throw new BadRequestException(
        `Could not provision personal form: ${message}`,
      );
    }

    const code = await this.uniqueCode();
    const created = await this.prisma.inviteLink.create({
      data: {
        id: newId('inv'),
        organization_id: authUser.organization_id!,
        location_id: authUser.branch_id ?? null,
        owner_user_id: authUser.sub,
        form_id: form.id,
        code,
        status: 'active',
        max_uses: 0,
        uses: 0,
        updated_at: new Date(),
      },
    });
    return this.decorate(created);
  }

  async list(authUser: AuthUser, page: number, pageSize: number) {
    const where: Prisma.InviteLinkWhereInput = {
      organization_id: authUser.organization_id ?? undefined,
    };
    if (authUser.role === 'worker') {
      where.owner_user_id = authUser.sub;
    } else if (
      authUser.role === 'location_admin' ||
      authUser.role === 'branch_admin'
    ) {
      where.OR = [
        { location_id: authUser.branch_id },
        { owner_user_id: authUser.sub },
      ];
    }
    const [total, data] = await this.prisma.$transaction([
      this.prisma.inviteLink.count({ where }),
      this.prisma.inviteLink.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      data: data.map((d) => this.decorate(d)),
      total,
      page,
      page_size: pageSize,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async get(authUser: AuthUser, id: string) {
    const link = await this.prisma.inviteLink.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!link) throw new NotFoundException('Invite link not found');
    this.assertCanRead(authUser, link);
    return this.decorate(link);
  }

  async create(
    authUser: AuthUser,
    dto: CreateInviteLinkDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    const code = await this.uniqueCode();
    const created = await this.prisma.inviteLink.create({
      data: {
        id: newId('inv'),
        organization_id: authUser.organization_id!,
        location_id: authUser.branch_id ?? null,
        team_id: dto.team_id ?? null,
        owner_user_id: authUser.sub,
        form_id: dto.form_id ?? null,
        code,
        expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
        max_uses: dto.max_uses ?? 0,
        uses: 0,
        status: 'active',
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: authUser.branch_id,
      entity: 'InviteLink',
      entityId: created.id,
      action: 'create',
      diff: { after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return this.decorate(created);
  }

  async update(
    authUser: AuthUser,
    id: string,
    dto: UpdateInviteLinkDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    const current = await this.prisma.inviteLink.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!current) throw new NotFoundException('Invite link not found');
    this.assertCanWrite(authUser, current);

    const updated = await this.prisma.inviteLink.update({
      where: { id },
      data: {
        status: dto.status ?? undefined,
        max_uses: dto.max_uses ?? undefined,
        expires_at: dto.expires_at ? new Date(dto.expires_at) : undefined,
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: updated.location_id,
      entity: 'InviteLink',
      entityId: id,
      action: 'update',
      diff: { before: current, after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return this.decorate(updated);
  }

  async remove(
    authUser: AuthUser,
    id: string,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    const current = await this.prisma.inviteLink.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!current) throw new NotFoundException('Invite link not found');
    this.assertCanWrite(authUser, current);
    await this.prisma.inviteLink.delete({ where: { id } });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: current.location_id,
      entity: 'InviteLink',
      entityId: id,
      action: 'delete',
      diff: { before: current },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return { id, deleted: true };
  }

  async share(
    authUser: AuthUser,
    id: string,
    dto: ShareInviteLinkDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    const link = await this.get(authUser, id);
    if (dto.channel === 'sms') {
      const body = `You're invited! ${link.url}`;
      try {
        await this.sms.send({
          organizationId: authUser.organization_id!,
          locationId: link.location_id ?? null,
          actorUserId: authUser.sub,
          to: dto.recipient,
          body,
          template: 'invite_share',
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'unknown';
        throw new BadRequestException(`Failed to share via SMS: ${message}`);
      }
    }
    await this.prisma.inviteLink.update({
      where: { id },
      data: { uses: { increment: 1 } },
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: link.location_id,
      entity: 'InviteLink',
      entityId: id,
      action: 'share',
      diff: { channel: dto.channel, recipient: dto.recipient },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return { ok: true, channel: dto.channel, code: link.code };
  }

  async trackUse(code: string) {
    const link = await this.prisma.inviteLink.findUnique({ where: { code } });
    if (!link) return null;
    if (link.status !== 'active') return null;
    if (link.expires_at && link.expires_at.getTime() < Date.now()) return null;
    if (link.max_uses > 0 && link.uses >= link.max_uses) return null;
    await this.prisma.inviteLink.update({
      where: { id: link.id },
      data: { uses: { increment: 1 } },
    });
    return this.decorate({ ...link, uses: link.uses + 1 });
  }

  private decorate(row: InviteLinkRow) {
    const url = `https://vangly.app/i/${row.code}`;
    return {
      id: row.id,
      organization_id: row.organization_id,
      location_id: row.location_id,
      team_id: row.team_id,
      owner_user_id: row.owner_user_id,
      form_id: row.form_id,
      code: row.code,
      expires_at: row.expires_at?.toISOString() ?? null,
      max_uses: row.max_uses,
      uses: row.uses,
      status: row.status,
      url,
      qr_payload: url,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updated_at.toISOString(),
    };
  }

  private async uniqueCode(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const candidate = newPublicId();
      const exists = await this.prisma.inviteLink.findUnique({
        where: { code: candidate },
      });
      if (!exists) return candidate;
    }
    throw new ConflictException('Could not allocate a unique invite code');
  }

  private async getUserName(userId: string): Promise<string | null> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    return u?.name ?? null;
  }

  private isOrgAdmin(role: string | null): boolean {
    const normalized = role === 'branch_admin' ? 'location_admin' : role;
    return normalized === 'organization_admin' || normalized === 'super_admin';
  }
  private isBranchScoped(role: string | null): boolean {
    return role === 'location_admin' || role === 'branch_admin';
  }
  private assertCanRead(authUser: AuthUser, link: InviteLinkRow) {
    if (this.isOrgAdmin(authUser.role)) return;
    if (
      this.isBranchScoped(authUser.role) &&
      link.location_id === authUser.branch_id
    )
      return;
    if (link.owner_user_id === authUser.sub) return;
    throw new ForbiddenException('Cannot view this invite link');
  }
  private assertCanWrite(authUser: AuthUser, link: InviteLinkRow) {
    if (this.isOrgAdmin(authUser.role)) return;
    if (
      this.isBranchScoped(authUser.role) &&
      link.location_id === authUser.branch_id
    )
      return;
    if (link.owner_user_id === authUser.sub) return;
    throw new ForbiddenException('Cannot update this invite link');
  }
}
