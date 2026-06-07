import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService as PrismaService } from '../../database/database.service';
import {
  UpdateOrganizationBrandDto,
  UpdateOrganizationDto,
  UpdateOrganizationSettingsDto,
} from './dto/organization.dto';
import { OrgAuditService } from '../../infra/audit/org-audit.service';

const ORG_ADMIN_ROLES = new Set(['organization_admin', 'super_admin']);

const SENSITIVE_SETTING_KEYS = new Set([
  'password',
  'api_key',
  'apiKey',
  'token',
  'secret',
]);

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: OrgAuditService,
  ) {}

  async getMyOrganization(authUser: {
    sub: string;
    organization_id: string;
    role: string;
  }) {
    if (!authUser.organization_id) {
      throw new NotFoundException('No organization assigned to this user');
    }
    const org = await this.prisma.organization.findUnique({
      where: { id: authUser.organization_id },
      select: {
        id: true,
        name: true,
        subdomain: true,
        primary_color: true,
        logo_url: true,
        settings: true,
        brand: true,
        createdAt: true,
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return { ...org, created_at: org.createdAt.toISOString() };
  }

  async updateMyOrganization(
    authUser: { sub: string; organization_id: string; role: string },
    dto: UpdateOrganizationDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    if (!authUser.organization_id) {
      throw new NotFoundException('No organization assigned to this user');
    }
    this.assertOrgAdmin(authUser.role);
    const current = await this.prisma.organization.findUnique({
      where: { id: authUser.organization_id },
      select: { name: true, primary_color: true, logo_url: true },
    });
    if (!current) throw new NotFoundException('Organization not found');

    if (dto.name && dto.name !== current.name) {
      const dup = await this.prisma.organization.findFirst({
        where: {
          subdomain: {
            contains: dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          },
          id: { not: authUser.organization_id },
        },
        select: { id: true },
      });
      if (dup) {
        throw new ConflictException(
          'Another organization already uses a similar name',
        );
      }
    }

    const updated = await this.prisma.organization.update({
      where: { id: authUser.organization_id },
      data: {
        name: dto.name,
        primary_color: dto.primary_color,
        logo_url: dto.logo_url,
      },
      select: {
        id: true,
        name: true,
        subdomain: true,
        primary_color: true,
        logo_url: true,
        settings: true,
        brand: true,
        createdAt: true,
      },
    });
    const decorated = {
      ...updated,
      created_at: updated.createdAt.toISOString(),
    };

    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id,
      entity: 'Organization',
      entityId: updated.id,
      action: 'update',
      diff: { before: current, after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? null,
    });

    return decorated;
  }

  async getMySettings(authUser: { sub: string; organization_id: string }) {
    if (!authUser.organization_id) {
      throw new NotFoundException('No organization assigned to this user');
    }
    const org = await this.prisma.organization.findUnique({
      where: { id: authUser.organization_id },
      select: { settings: true },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return { settings: (org.settings as Record<string, unknown> | null) ?? {} };
  }

  async updateMySettings(
    authUser: { sub: string; organization_id: string; role: string },
    dto: UpdateOrganizationSettingsDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    if (!authUser.organization_id) {
      throw new NotFoundException('No organization assigned to this user');
    }
    this.assertOrgAdmin(authUser.role);
    const org = await this.prisma.organization.findUnique({
      where: { id: authUser.organization_id },
      select: { id: true, settings: true },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const sanitized = this.sanitizeSettings(dto.settings ?? {});

    const updated = await this.prisma.organization.update({
      where: { id: org.id },
      data: { settings: sanitized as Prisma.InputJsonValue },
      select: { settings: true },
    });

    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id,
      entity: 'Organization.settings',
      entityId: org.id,
      action: 'update',
      diff: { after: sanitized },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? null,
    });

    return { settings: (updated.settings as Record<string, unknown>) ?? {} };
  }

  async getMyBrand(authUser: { sub: string; organization_id: string }) {
    if (!authUser.organization_id) {
      throw new NotFoundException('No organization assigned to this user');
    }
    const org = await this.prisma.organization.findUnique({
      where: { id: authUser.organization_id },
      select: { brand: true },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return { brand: (org.brand as Record<string, unknown> | null) ?? {} };
  }

  async updateMyBrand(
    authUser: { sub: string; organization_id: string; role: string },
    dto: UpdateOrganizationBrandDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    if (!authUser.organization_id) {
      throw new NotFoundException('No organization assigned to this user');
    }
    this.assertOrgAdmin(authUser.role);
    const org = await this.prisma.organization.findUnique({
      where: { id: authUser.organization_id },
      select: { id: true, brand: true },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const updated = await this.prisma.organization.update({
      where: { id: org.id },
      data: { brand: (dto.brand ?? {}) as Prisma.InputJsonValue },
      select: { brand: true },
    });

    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id,
      entity: 'Organization.brand',
      entityId: org.id,
      action: 'update',
      diff: { after: dto.brand ?? {} },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? null,
    });

    return { brand: (updated.brand as Record<string, unknown>) ?? {} };
  }

  private assertOrgAdmin(role: string) {
    const normalized = role === 'branch_admin' ? 'location_admin' : role;
    if (!ORG_ADMIN_ROLES.has(normalized)) {
      throw new ForbiddenException(
        'Only organization admins can perform this action',
      );
    }
  }

  private sanitizeSettings(
    raw: Record<string, unknown>,
  ): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw ?? {})) {
      if (SENSITIVE_SETTING_KEYS.has(k)) continue;
      out[k] = v;
    }
    return out;
  }
}
