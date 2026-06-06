import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import {
  CloneTeamDto,
  CreateTeamDto,
  FindTeamsQueryDto,
  UpdateTeamDto,
} from './dto';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { newId } from '../../common/utils/hash';
import { paginationFromQuery } from '../../common/utils/paginated';

const ADMIN_TEAM_NAME = 'Admin';
const GENERAL_TEAM_NAME = 'General';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: OrgAuditService,
  ) {}

  async create(
    organizationId: string,
    locationId: string,
    dto: CreateTeamDto,
    actor: { id: string; ip: string; ua: string },
  ): Promise<unknown> {
    const location = await this.db.location.findFirst({
      where: { id: locationId, organization_id: organizationId },
      select: { id: true },
    });
    if (!location) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Location ${locationId} not found.`,
        },
      });
    }
    if (dto.name === ADMIN_TEAM_NAME) {
      throw new ConflictException({
        error: { code: 'CONFLICT', message: 'Admin is a reserved team name.' },
      });
    }

    let created: { id: string; name: string };
    try {
      created = await this.db.team.create({
        data: {
          id: newId('team'),
          organization_id: organizationId,
          location_id: locationId,
          name: dto.name,
          description: dto.description,
          kind: 'custom',
          is_public_joinable: dto.is_public_joinable ?? false,
          allow_member_pin: dto.allow_member_pin ?? false,
        },
        select: { id: true, name: true },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException({
          error: {
            code: 'CONFLICT',
            message: `A team named "${dto.name}" already exists in this location.`,
          },
        });
      }
      throw err;
    }

    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId,
      entity: 'team',
      entityId: created.id,
      action: 'team.create',
      diff: { name: created.name },
      ip: actor.ip,
      ua: actor.ua,
    });

    return this.getById(organizationId, created.id);
  }

  async list(
    organizationId: string,
    locationId: string,
    query: FindTeamsQueryDto,
  ): Promise<unknown[]> {
    const where: Prisma.TeamWhereInput = {
      organization_id: organizationId,
      location_id: locationId,
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
      ...(query.team_id ? { id: query.team_id } : {}),
      ...(query.kind ? { kind: query.kind } : {}),
    };
    const teams = await this.db.team.findMany({
      where,
      select: this.teamSelect(),
      orderBy: [{ is_system: 'desc' }, { createdAt: 'asc' }],
    });
    return teams.map((t) => this.decorate(t));
  }

  async getById(organizationId: string, teamId: string): Promise<unknown> {
    const team = await this.db.team.findFirst({
      where: { id: teamId, organization_id: organizationId },
      select: this.teamSelect(),
    });
    if (!team) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Team ${teamId} not found.` },
      });
    }
    return this.decorate(team);
  }

  async getDetail(
    organizationId: string,
    locationId: string,
    teamId: string,
    page: number,
    perPage: number,
    q: string | undefined,
  ): Promise<unknown> {
    const team = await this.db.team.findFirst({
      where: {
        id: teamId,
        organization_id: organizationId,
        location_id: locationId,
      },
      select: this.teamSelect(),
    });
    if (!team) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Team ${teamId} not found.` },
      });
    }
    const { offset, limit } = paginationFromQuery(page, perPage, {
      maxPerPage: 100,
    });

    const memberships = await this.db.teamMembership.findMany({
      where: { team_id: teamId },
      orderBy: { joined_at: 'asc' },
      select: {
        is_team_admin: true,
        user_id: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            status: true,
            invites_count: true,
            createdAt: true,
          },
        },
      },
    });
    const allUserIds = memberships.map((m) => m.user.id);
    const userIdsForSearch = q
      ? memberships
          .filter(
            (m) =>
              m.user.name.toLowerCase().includes(q.toLowerCase()) ||
              m.user.phone.toLowerCase().includes(q.toLowerCase()),
          )
          .map((m) => m.user.id)
      : allUserIds;
    const userIds = userIdsForSearch.slice(offset, offset + limit);

    const filteredMemberships = memberships.filter((m) =>
      userIds.includes(m.user.id),
    );
    const memberUserIds = filteredMemberships.map((m) => m.user_id);
    const adminRows =
      memberUserIds.length > 0
        ? await this.db.teamMembership.findMany({
            where: { user_id: { in: memberUserIds }, is_team_admin: true },
            select: { user_id: true, team: { select: { name: true } } },
          })
        : [];
    const adminsByUser = new Map<string, string[]>();
    for (const r of adminRows) {
      const arr = adminsByUser.get(r.user_id) ?? [];
      arr.push(r.team.name);
      adminsByUser.set(r.user_id, arr);
    }
    const members = filteredMemberships.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      phone: m.user.phone,
      email: m.user.email ?? undefined,
      status: m.user.status as 'active' | 'inactive' | 'suspended',
      roles: [],
      team_admins: adminsByUser.get(m.user.id) ?? [],
      invites_count: m.user.invites_count,
      is_team_admin: m.is_team_admin,
      created_at: m.user.createdAt.toISOString(),
    }));

    const [forms, total] = await Promise.all([
      this.db.form.findMany({
        where: { team_id: teamId, organization_id: organizationId },
        select: {
          id: true,
          public_id: true,
          title: true,
          status: true,
          fields: true,
          analytics_scans: true,
          analytics_submissions: true,
          updated_at: true,
        },
        orderBy: { updated_at: 'desc' },
      }),
      Promise.resolve(userIdsForSearch.length),
    ]);
    const formList = forms.map((f) => ({
      id: f.id,
      public_id: f.public_id,
      title: f.title,
      status: f.status,
      field_count: Array.isArray(f.fields) ? f.fields.length : 0,
      scans: f.analytics_scans,
      submissions: f.analytics_submissions,
      updated_at: f.updated_at.toISOString(),
    }));

    return {
      team: this.decorate(team),
      members,
      forms: formList,
      meta: { page, per_page: perPage, total },
    };
  }

  async update(
    organizationId: string,
    teamId: string,
    dto: UpdateTeamDto,
    actor: { id: string; ip: string; ua: string },
  ): Promise<unknown> {
    const existing = await this.db.team.findFirst({
      where: { id: teamId, organization_id: organizationId },
      select: { id: true, is_system: true, name: true },
    });
    if (!existing) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Team ${teamId} not found.` },
      });
    }
    if (existing.is_system && existing.name === ADMIN_TEAM_NAME) {
      throw new ForbiddenException({
        error: { code: 'FORBIDDEN', message: 'The Admin team is read-only.' },
      });
    }
    if (
      dto.name &&
      dto.name === ADMIN_TEAM_NAME &&
      existing.name !== ADMIN_TEAM_NAME
    ) {
      throw new ConflictException({
        error: { code: 'CONFLICT', message: 'Admin is a reserved team name.' },
      });
    }

    try {
      await this.db.team.update({
        where: { id: teamId },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(dto.is_public_joinable !== undefined
            ? { is_public_joinable: dto.is_public_joinable }
            : {}),
          ...(dto.allow_member_pin !== undefined
            ? { allow_member_pin: dto.allow_member_pin }
            : {}),
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException({
          error: {
            code: 'CONFLICT',
            message: `A team named "${dto.name}" already exists in this location.`,
          },
        });
      }
      throw err;
    }

    await this.audit.log({
      actorId: actor.id,
      organizationId,
      entity: 'team',
      entityId: teamId,
      action: 'team.update',
      diff: dto as unknown as Record<string, unknown>,
      ip: actor.ip,
      ua: actor.ua,
    });

    return this.getById(organizationId, teamId);
  }

  async delete(
    organizationId: string,
    teamId: string,
    actor: { id: string; ip: string; ua: string },
  ): Promise<void> {
    const team = await this.db.team.findFirst({
      where: { id: teamId, organization_id: organizationId },
      select: { id: true, is_system: true, name: true, location_id: true },
    });
    if (!team) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Team ${teamId} not found.` },
      });
    }
    if (team.is_system && team.name === ADMIN_TEAM_NAME) {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message: 'The Admin team cannot be deleted.',
        },
      });
    }

    const general = await this.ensureGeneralTeam(
      organizationId,
      team.location_id,
    );

    await this.db.$transaction(async (tx) => {
      const forms = await tx.form.findMany({
        where: { team_id: teamId },
        select: { id: true },
      });
      if (forms.length > 0) {
        await tx.form.updateMany({
          where: { id: { in: forms.map((f) => f.id) } },
          data: { team_id: general.id },
        });
      }
      await tx.teamMembership.deleteMany({ where: { team_id: teamId } });
      await tx.team.delete({ where: { id: teamId } });
    });

    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId: team.location_id,
      entity: 'team',
      entityId: teamId,
      action: 'team.delete',
      diff: { name: team.name, detached_forms_to: general.id },
      ip: actor.ip,
      ua: actor.ua,
    });
  }

  async cloneFrom(
    organizationId: string,
    targetLocationId: string,
    targetTeamId: string | null,
    dto: CloneTeamDto,
    actor: { id: string; ip: string; ua: string },
  ): Promise<{
    team: unknown;
    imported_members: number;
    imported_forms: number;
  }> {
    const target = await this.db.location.findFirst({
      where: { id: targetLocationId, organization_id: organizationId },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Location ${targetLocationId} not found.`,
        },
      });
    }
    const source = await this.db.location.findFirst({
      where: { id: dto.source_location_id, organization_id: organizationId },
      select: { id: true },
    });
    if (!source) {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message: 'Source location must belong to your organization.',
        },
      });
    }
    const sourceTeam = await this.db.team.findFirst({
      where: {
        location_id: dto.source_location_id,
        name: dto.source_team_name,
      },
      select: {
        id: true,
        kind: true,
        description: true,
        allow_member_pin: true,
        is_public_joinable: true,
      },
    });
    if (!sourceTeam) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Source team "${dto.source_team_name}" not found.`,
        },
      });
    }

    const existing = await this.db.team.findFirst({
      where: { location_id: targetLocationId, name: dto.source_team_name },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException({
        error: {
          code: 'CONFLICT',
          message: `A team named "${dto.source_team_name}" already exists at the target location.`,
        },
      });
    }

    const newTeamId = newId('team');
    const result = await this.db.$transaction(async (tx) => {
      const t = await tx.team.create({
        data: {
          id: newTeamId,
          organization_id: organizationId,
          location_id: targetLocationId,
          name: dto.source_team_name,
          description: sourceTeam.description,
          kind: sourceTeam.kind as
            | 'admin'
            | 'operational'
            | 'outreach'
            | 'custom',
          is_public_joinable: sourceTeam.is_public_joinable,
          allow_member_pin: sourceTeam.allow_member_pin,
        },
      });

      let importedMembers = 0;
      let importedForms = 0;
      if (dto.import_members) {
        const memberships = await tx.teamMembership.findMany({
          where: { team_id: sourceTeam.id },
          select: { user_id: true, is_team_admin: true },
        });
        if (memberships.length > 0) {
          await tx.teamMembership.createMany({
            data: memberships.map((m) => ({
              id: newId('tm'),
              team_id: t.id,
              user_id: m.user_id,
              is_team_admin: m.is_team_admin,
              joined_at: new Date(),
            })),
          });
          importedMembers = memberships.length;
        }
      }
      if (dto.import_forms) {
        const forms = await tx.form.findMany({
          where: {
            team_id: sourceTeam.id,
            status: { in: ['draft', 'published', 'archived'] },
          },
          select: {
            id: true,
            title: true,
            description: true,
            fields: true,
            distribution: true,
          },
        });
        for (const f of forms) {
          await tx.form.create({
            data: {
              id: newId('form'),
              public_id: this.regeneratePublicIdSafe(),
              organization_id: organizationId,
              location_id: targetLocationId,
              team_id: t.id,
              title: f.title,
              description: f.description,
              status: 'draft',
              fields: f.fields as Prisma.InputJsonValue,
              distribution: f.distribution as Prisma.InputJsonValue,
              schema_version: 1,
              created_by: actor.id,
            },
          });
          importedForms += 1;
        }
      }
      return { team: t, importedMembers, importedForms };
    });

    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId: targetLocationId,
      entity: 'team',
      entityId: result.team.id,
      action: 'team.clone',
      diff: {
        source_location_id: dto.source_location_id,
        source_team_name: dto.source_team_name,
        import_members: dto.import_members,
        import_forms: dto.import_forms,
      },
      ip: actor.ip,
      ua: actor.ua,
    });

    return {
      team: await this.getById(organizationId, result.team.id),
      imported_members: result.importedMembers,
      imported_forms: result.importedForms,
    };
  }

  private async ensureGeneralTeam(
    organizationId: string,
    locationId: string,
  ): Promise<{ id: string }> {
    const existing = await this.db.team.findFirst({
      where: { location_id: locationId, name: GENERAL_TEAM_NAME },
      select: { id: true },
    });
    if (existing) return existing;
    return this.db.team.create({
      data: {
        id: newId('team'),
        organization_id: organizationId,
        location_id: locationId,
        name: GENERAL_TEAM_NAME,
        kind: 'operational',
        is_system: true,
      },
      select: { id: true },
    });
  }

  private regeneratePublicIdSafe(): string {
    return (Math.random().toString(36).slice(2, 11) + 'XXXXXXXXX')
      .slice(0, 9)
      .toUpperCase();
  }

  private teamSelect(): Prisma.TeamSelect {
    return {
      id: true,
      organization_id: true,
      location_id: true,
      name: true,
      description: true,
      kind: true,
      is_public_joinable: true,
      allow_member_pin: true,
      sms_otp_required: true,
      is_system: true,
      createdAt: true,
      updated_at: true,
      _count: { select: { memberships: true, forms: true } },
    };
  }

  private decorate(row: Record<string, unknown>): Record<string, unknown> {
    const _count = row._count as { memberships: number; forms: number };
    return {
      id: row.id,
      organization_id: row.organization_id,
      location_id: row.location_id,
      name: row.name,
      description: row.description ?? undefined,
      kind: row.kind,
      is_public_joinable: row.is_public_joinable,
      allow_member_pin: row.allow_member_pin,
      sms_otp_required: row.sms_otp_required,
      member_count: _count?.memberships ?? 0,
      form_count: _count?.forms ?? 0,
      created_at: (row.createdAt as Date).toISOString(),
      updated_at: (row.updated_at as Date).toISOString(),
    };
  }
}
