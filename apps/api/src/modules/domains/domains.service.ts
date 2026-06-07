import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { CreateCustomDomainDto, UpdateCustomDomainDto } from './dto/domain.dto';
import { newId } from '../../common/utils/hash';
import * as crypto from 'crypto';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: OrgAuditService,
  ) {}

  async list(authUser: AuthUser) {
    return this.prisma.customDomain.findMany({
      where: { organization_id: authUser.organization_id! },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(authUser: AuthUser, id: string) {
    const d = await this.prisma.customDomain.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!d) throw new NotFoundException('Custom domain not found');
    return d;
  }

  async create(
    authUser: AuthUser,
    dto: CreateCustomDomainDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    this.assertOrgAdmin(authUser.role);
    const exists = await this.prisma.customDomain.findUnique({
      where: { domain: dto.domain.toLowerCase() },
    });
    if (exists) {
      throw new ConflictException(
        'This domain is already registered by another organization',
      );
    }
    const token = `vangly-verify-${crypto.randomBytes(8).toString('hex')}`;
    const created = await this.prisma.customDomain.create({
      data: {
        id: newId('dom'),
        organization_id: authUser.organization_id!,
        domain: dto.domain.toLowerCase(),
        status: 'pending',
        verification_token: token,
        ssl_status: 'none',
        dns_instructions: {
          type: 'TXT',
          host: `_vangly-challenge.${dto.domain.toLowerCase()}`,
          value: token,
          note: 'Add the TXT record above to verify ownership. SSL is provisioned automatically after verification.',
        },
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      entity: 'CustomDomain',
      entityId: created.id,
      action: 'create',
      diff: { after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return created;
  }

  async update(
    authUser: AuthUser,
    id: string,
    dto: UpdateCustomDomainDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    this.assertOrgAdmin(authUser.role);
    const current = await this.prisma.customDomain.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!current) throw new NotFoundException('Custom domain not found');

    const updated = await this.prisma.customDomain.update({
      where: { id },
      data: {
        ssl_status: dto.ssl_status ?? undefined,
        dns_instructions: dto.note
          ? {
              ...((current.dns_instructions as Record<string, unknown>) ?? {}),
              note: dto.note,
            }
          : undefined,
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      entity: 'CustomDomain',
      entityId: id,
      action: 'update',
      diff: { before: { ssl_status: current.ssl_status }, after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return updated;
  }

  async verify(
    authUser: AuthUser,
    id: string,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    this.assertOrgAdmin(authUser.role);
    const d = await this.prisma.customDomain.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!d) throw new NotFoundException('Custom domain not found');
    if (d.status === 'active') return d;

    const verifiedAt = new Date();
    const updated = await this.prisma.customDomain.update({
      where: { id },
      data: {
        status: 'active',
        ssl_status: 'active',
        verified_at: verifiedAt,
        updated_at: verifiedAt,
      },
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      entity: 'CustomDomain',
      entityId: id,
      action: 'verify',
      diff: { after: { status: 'active' } },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    this.logger.log(
      `[domain:mock] verified ${d.domain} for org ${authUser.organization_id}`,
    );
    return updated;
  }

  async remove(
    authUser: AuthUser,
    id: string,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    this.assertOrgAdmin(authUser.role);
    const d = await this.prisma.customDomain.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!d) throw new NotFoundException('Custom domain not found');
    await this.prisma.customDomain.delete({ where: { id } });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      entity: 'CustomDomain',
      entityId: id,
      action: 'delete',
      diff: { before: d },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return { id, deleted: true };
  }

  private assertOrgAdmin(role: string | null) {
    const normalized = role === 'branch_admin' ? 'location_admin' : role;
    if (normalized !== 'organization_admin' && normalized !== 'super_admin') {
      throw new ForbiddenException(
        'Only organization admins can manage domains',
      );
    }
  }
}
