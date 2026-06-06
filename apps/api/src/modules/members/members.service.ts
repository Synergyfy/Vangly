import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import {
  BulkImportDto,
  CreateMemberDto,
  FindMembersQueryDto,
  TransferMemberDto,
  UpdateMemberDto,
} from './dto';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { SmsService } from '../../infra/sms/sms.service';
import { JobsService } from '../../infra/jobs/jobs.service';
import { hashSecret, newId } from '../../common/utils/hash';
import { validatePinPolicy } from '../../common/utils/pin-policy';
import {
  paginationFromQuery,
  buildPaginatedResponse,
} from '../../common/utils/paginated';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);
  private readonly resetOtps = new Map<
    string,
    { otp: string; expiresAt: Date }
  >();

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: OrgAuditService,
    private readonly sms: SmsService,
    private readonly jobs: JobsService,
  ) {
    this.registerJobHandlers();
  }

  async list(
    organizationId: string,
    locationId: string | null,
    query: FindMembersQueryDto,
  ): Promise<{
    data: unknown[];
    meta: { page: number; per_page: number; total: number };
  }> {
    const { page, perPage, offset, limit } = paginationFromQuery(
      query.page,
      query.per_page,
      { maxPerPage: 100 },
    );

    const where: Prisma.UserWhereInput = {
      organization_id: organizationId,
      ...(locationId ? { branch_id: locationId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.team_id
        ? { teamMemberships: { some: { team_id: query.team_id } } }
        : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { phone: { contains: query.q, mode: 'insensitive' } },
              { email: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.db.user.findMany({
        where,
        select: this.userSelect(),
        orderBy: [{ createdAt: 'asc' }],
        skip: offset,
        take: limit,
      }),
      this.db.user.count({ where }),
    ]);

    const data = rows.map((u) => this.decorate(u));
    return buildPaginatedResponse(data, total, page, perPage);
  }

  async getById(organizationId: string, memberId: string): Promise<unknown> {
    const user = await this.db.user.findFirst({
      where: { id: memberId, organization_id: organizationId },
      select: this.userSelect(),
    });
    if (!user) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Member ${memberId} not found.` },
      });
    }
    return this.decorate(user);
  }

  async create(
    organizationId: string,
    locationId: string,
    dto: CreateMemberDto,
    actor: { id: string; ip: string; ua: string },
  ): Promise<unknown> {
    const location = await this.db.location.findFirst({
      where: { id: locationId, organization_id: organizationId },
      select: { id: true, name: true },
    });
    if (!location) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Location ${locationId} not found.`,
        },
      });
    }
    const teams = await this.db.team.findMany({
      where: {
        id: { in: dto.team_ids },
        location_id: locationId,
        organization_id: organizationId,
      },
      select: { id: true, name: true, allow_member_pin: true },
    });
    if (teams.length !== dto.team_ids.length) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'One or more team_ids do not belong to this location.',
        },
      });
    }
    if (dto.is_team_admin) {
      const invalid = dto.is_team_admin.filter(
        (id) => !dto.team_ids.includes(id),
      );
      if (invalid.length > 0) {
        throw new BadRequestException({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'is_team_admin must be a subset of team_ids.',
          },
        });
      }
    }
    const pinRequired = teams.some((t) => t.allow_member_pin);
    if (pinRequired && !dto.pin) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message:
            'pin is required for at least one team that allows PIN login.',
        },
      });
    }

    const existing = await this.db.user.findUnique({
      where: { phone: dto.phone },
      select: {
        id: true,
        organization_id: true,
        branch_id: true,
        pin_hash: true,
        pin_history: true,
        status: true,
      },
    });
    if (
      existing &&
      existing.organization_id &&
      existing.organization_id !== organizationId
    ) {
      throw new ConflictException({
        error: {
          code: 'CONFLICT',
          message: 'Phone is already registered to a different organization.',
        },
      });
    }
    if (
      existing &&
      existing.organization_id === organizationId &&
      existing.branch_id &&
      existing.branch_id !== locationId
    ) {
      throw new ConflictException({
        error: {
          code: 'CONFLICT',
          message:
            'Phone is already registered at another location in this organization.',
        },
      });
    }

    let pinHash: string | undefined;
    let pinHistory: string[] = [];
    if (dto.pin) {
      const result = validatePinPolicy(
        {
          pin_hash: existing?.pin_hash ?? '',
          pin_history: existing?.pin_history ?? [],
        },
        dto.pin,
      );
      pinHash = result.pinHash;
      pinHistory = result.newHistory;
    }

    const userId = existing?.id ?? newId('usr');

    const result = await this.db.$transaction(async (tx) => {
      let user: { id: string };
      if (existing) {
        const data: Prisma.UserUpdateInput = {};
        if (dto.name) data.name = dto.name;
        if (dto.email !== undefined) data.email = dto.email;
        if (dto.status) data.status = dto.status;
        if (pinHash) {
          data.pin_hash = pinHash;
          data.pin_history = pinHistory;
          data.failed_attempts = 0;
          data.locked_until = null;
        }
        user = await tx.user.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        });
      } else {
        user = await tx.user.create({
          data: {
            id: userId,
            name: dto.name,
            phone: dto.phone,
            email: dto.email,
            pin_hash: pinHash ?? hashSecret(cryptoRandomDigits()),
            pin_history: pinHash ? pinHistory : [],
            role: 'worker',
            organization_id: organizationId,
            branch_id: locationId,
            credits: 0,
          },
          select: { id: true },
        });
      }
      const adminSet = new Set(dto.is_team_admin ?? []);
      await tx.teamMembership.createMany({
        data: dto.team_ids.map((teamId) => ({
          id: newId('tm'),
          team_id: teamId,
          user_id: user.id,
          is_team_admin: adminSet.has(teamId),
        })),
      });
      return user;
    });

    if (dto.assign_forms && dto.assign_forms.length > 0) {
      await this.db.user.update({
        where: { id: result.id },
        data: {},
      });
    }

    try {
      await this.sms.send({
        to: dto.phone,
        template: 'member_added',
        vars: {
          name: dto.name,
          location: location.name,
          teams: teams.map((t) => t.name).join(', '),
        },
        organizationId,
        locationId,
        body: `Welcome to ${location.name}, ${dto.name}! You've been added to ${teams.length} team(s).`,
      });
    } catch (err) {
      this.logger.warn(
        `SMS send failed for member ${result.id}: ${(err as Error).message}`,
      );
    }

    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId,
      entity: 'member',
      entityId: result.id,
      action: 'member.create',
      diff: { name: dto.name, phone: dto.phone, team_ids: dto.team_ids },
      ip: actor.ip,
      ua: actor.ua,
    });

    return this.getById(organizationId, result.id);
  }

  async update(
    organizationId: string,
    memberId: string,
    dto: UpdateMemberDto,
    actor: { id: string; ip: string; ua: string },
  ): Promise<unknown> {
    const user = await this.db.user.findFirst({
      where: { id: memberId, organization_id: organizationId },
      select: { id: true, pin_hash: true, pin_history: true },
    });
    if (!user) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Member ${memberId} not found.` },
      });
    }

    const data: Prisma.UserUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    };
    if (dto.pin) {
      const { pinHash, newHistory } = validatePinPolicy(
        { pin_hash: user.pin_hash, pin_history: user.pin_history },
        dto.pin,
      );
      data.pin_hash = pinHash;
      data.pin_history = newHistory;
      data.failed_attempts = 0;
      data.locked_until = null;
    }
    await this.db.user.update({ where: { id: memberId }, data });

    if (dto.is_team_admin) {
      const memberships = await this.db.teamMembership.findMany({
        where: { user_id: memberId },
        select: { team_id: true },
      });
      const adminSet = new Set(dto.is_team_admin);
      const toUpdate = memberships.filter((m) =>
        dto.is_team_admin?.includes(m.team_id),
      );
      for (const m of toUpdate) {
        await this.db.teamMembership.update({
          where: { team_id_user_id: { team_id: m.team_id, user_id: memberId } },
          data: { is_team_admin: adminSet.has(m.team_id) },
        });
      }
    }

    await this.audit.log({
      actorId: actor.id,
      organizationId,
      entity: 'member',
      entityId: memberId,
      action: dto.pin ? 'member.pin_reset' : 'member.update',
      diff: dto as unknown as Record<string, unknown>,
      ip: actor.ip,
      ua: actor.ua,
    });

    return this.getById(organizationId, memberId);
  }

  async delete(
    organizationId: string,
    locationId: string,
    memberId: string,
    actor: { id: string; ip: string; ua: string },
  ): Promise<void> {
    const user = await this.db.user.findFirst({
      where: {
        id: memberId,
        organization_id: organizationId,
        branch_id: locationId,
      },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Member ${memberId} not found at this location.`,
        },
      });
    }
    await this.db.$transaction(async (tx) => {
      await tx.teamMembership.deleteMany({
        where: { user_id: memberId, team: { location_id: locationId } },
      });
      const remaining = await tx.teamMembership.count({
        where: { user_id: memberId },
      });
      if (remaining === 0) {
        await tx.user.update({
          where: { id: memberId },
          data: { status: 'inactive' },
        });
      }
    });
    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId,
      entity: 'member',
      entityId: memberId,
      action: 'member.remove_from_location',
      diff: {},
      ip: actor.ip,
      ua: actor.ua,
    });
  }

  async transfer(
    organizationId: string,
    memberId: string,
    dto: TransferMemberDto,
    actor: { id: string; ip: string; ua: string },
  ): Promise<unknown> {
    const user = await this.db.user.findFirst({
      where: { id: memberId, organization_id: organizationId },
      select: { id: true, branch_id: true },
    });
    if (!user) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Member ${memberId} not found.` },
      });
    }
    const targetLocation = await this.db.location.findFirst({
      where: { id: dto.to_location_id, organization_id: organizationId },
      select: { id: true, name: true },
    });
    if (!targetLocation) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'to_location_id must belong to your organization.',
        },
      });
    }
    const teams = await this.db.team.findMany({
      where: {
        id: { in: dto.to_team_ids },
        location_id: targetLocation.id,
        organization_id: organizationId,
      },
      select: { id: true },
    });
    if (teams.length !== dto.to_team_ids.length) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message:
            'One or more to_team_ids do not belong to the target location.',
        },
      });
    }
    const adminSet = new Set(dto.is_team_admin ?? []);
    await this.db.$transaction(async (tx) => {
      await tx.teamMembership.deleteMany({ where: { user_id: memberId } });
      await tx.user.update({
        where: { id: memberId },
        data: { branch_id: targetLocation.id },
      });
      await tx.teamMembership.createMany({
        data: dto.to_team_ids.map((teamId) => ({
          id: newId('tm'),
          team_id: teamId,
          user_id: memberId,
          is_team_admin: adminSet.has(teamId),
        })),
      });
    });
    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId: targetLocation.id,
      entity: 'member',
      entityId: memberId,
      action: 'member.transfer',
      diff: {
        from: user.branch_id,
        to: targetLocation.id,
        team_ids: dto.to_team_ids,
      },
      ip: actor.ip,
      ua: actor.ua,
    });
    return this.getById(organizationId, memberId);
  }

  async bulkImport(
    organizationId: string,
    locationId: string,
    dto: BulkImportDto,
    actor: { id: string; ip: string; ua: string },
  ): Promise<{ job_id: string; queued: number }> {
    const team = await this.db.team.findFirst({
      where: {
        id: dto.team_id,
        location_id: locationId,
        organization_id: organizationId,
      },
      select: { id: true, name: true, allow_member_pin: true },
    });
    if (!team) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Team ${dto.team_id} not found in this location.`,
        },
      });
    }
    const { jobId } = await this.jobs.enqueue(
      'members_bulk_import',
      organizationId,
      locationId,
      {
        rows: dto.rows,
        team_id: dto.team_id,
        default_status: dto.default_status ?? 'active',
        allow_member_pin: team.allow_member_pin,
        actor_id: actor.id,
      },
    );
    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId,
      entity: 'member',
      entityId: dto.team_id,
      action: 'member.bulk_import',
      diff: { team_id: dto.team_id, queued: dto.rows.length, job_id: jobId },
      ip: actor.ip,
      ua: actor.ua,
    });
    return { job_id: jobId, queued: dto.rows.length };
  }

  async resetPin(
    organizationId: string,
    memberId: string,
    actor: { id: string; ip: string; ua: string },
  ): Promise<{ otp_expires_in: number }> {
    const user = await this.db.user.findFirst({
      where: { id: memberId, organization_id: organizationId },
      select: { id: true, phone: true, branch_id: true, organization_id: true },
    });
    if (!user) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Member ${memberId} not found.` },
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    this.resetOtps.set(memberId, { otp, expiresAt });

    try {
      await this.sms.send({
        to: user.phone,
        template: 'admin_pin_reset',
        vars: {},
        organizationId,
        locationId: user.branch_id,
        body: `Your Vangly PIN was reset by an admin. Use OTP ${otp} to set a new PIN.`,
      });
    } catch (err) {
      this.logger.warn(`SMS for pin reset failed: ${(err as Error).message}`);
    }

    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId: user.branch_id,
      entity: 'member',
      entityId: memberId,
      action: 'member.pin_reset_init',
      diff: {},
      ip: actor.ip,
      ua: actor.ua,
    });
    return { otp_expires_in: 600 };
  }

  async verifyResetPin(
    organizationId: string,
    memberId: string,
    otp: string,
    newPin: string,
    actor: { id: string; ip: string; ua: string },
  ): Promise<{ ok: true }> {
    const user = await this.db.user.findFirst({
      where: { id: memberId, organization_id: organizationId },
      select: { id: true, pin_hash: true, pin_history: true, branch_id: true },
    });
    if (!user) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Member ${memberId} not found.` },
      });
    }
    const record = this.resetOtps.get(memberId);
    if (!record || record.otp !== otp || record.expiresAt < new Date()) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid or expired OTP.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const { pinHash, newHistory } = validatePinPolicy(
      { pin_hash: user.pin_hash, pin_history: user.pin_history },
      newPin,
    );
    await this.db.user.update({
      where: { id: memberId },
      data: {
        pin_hash: pinHash,
        pin_history: newHistory,
        failed_attempts: 0,
        locked_until: null,
      },
    });
    this.resetOtps.delete(memberId);
    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId: user.branch_id,
      entity: 'member',
      entityId: memberId,
      action: 'member.pin_reset_verify',
      diff: {},
      ip: actor.ip,
      ua: actor.ua,
    });
    return { ok: true };
  }

  async exportCsv(organizationId: string, locationId: string): Promise<string> {
    const members = await this.list(organizationId, locationId, {
      page: 1,
      per_page: 100,
    });
    const lines = ['Name,Role,Phone,Email'];
    for (const m of members.data as Array<Record<string, unknown>>) {
      const roles =
        (Array.isArray(m.roles) ? (m.roles as string[]) : []).join(';') ||
        'Member';
      const name = typeof m.name === 'string' ? m.name : '';
      const phone = typeof m.phone === 'string' ? m.phone : '';
      const email = typeof m.email === 'string' ? m.email : '';
      const clean = (s: string) => s.replace(/[",\n\r]/g, ' ');
      lines.push(
        `"${clean(name)}","${clean(roles)}","${clean(phone)}","${clean(email)}"`,
      );
    }
    return lines.join('\n');
  }

  private userSelect(): Prisma.UserSelect {
    return {
      id: true,
      name: true,
      phone: true,
      email: true,
      status: true,
      invites_count: true,
      createdAt: true,
      teamMemberships: {
        select: {
          team_id: true,
          is_team_admin: true,
          team: { select: { name: true } },
        },
      },
    };
  }

  private decorate(row: Record<string, unknown>): Record<string, unknown> {
    const memberships =
      (row.teamMemberships as Array<{
        team_id: string;
        is_team_admin: boolean;
        team: { name: string };
      }>) ?? [];
    const roles = memberships.map((m) => m.team.name);
    const teamAdmins = memberships
      .filter((m) => m.is_team_admin)
      .map((m) => m.team.name);
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email ?? undefined,
      status: row.status,
      roles,
      team_admins: teamAdmins,
      invites_count: row.invites_count,
      created_at: (row.createdAt as Date).toISOString(),
    };
  }

  private registerJobHandlers(): void {
    this.jobs.registerHandler(
      'members_bulk_import',
      async (jobId, payload, db) => {
        const rows =
          (payload.rows as Array<{
            name: string;
            phone: string;
            email?: string;
          }>) ?? [];
        const teamId = payload.team_id as string;
        const defaultStatus = (payload.default_status as string) ?? 'active';
        const errors: Array<{ row: number; message: string }> = [];
        let succeeded = 0;
        let failed = 0;
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          try {
            const existing = await db.user.findUnique({
              where: { phone: r.phone },
            });
            let userId: string;
            if (existing) {
              userId = existing.id;
              await db.user.update({
                where: { id: existing.id },
                data: {
                  status: defaultStatus,
                  branch_id: (
                    await db.team.findUnique({
                      where: { id: teamId },
                      select: { location_id: true },
                    })
                  )?.location_id,
                },
              });
            } else {
              userId = newId('usr');
              const team = await db.team.findUnique({
                where: { id: teamId },
                select: { location_id: true, organization_id: true },
              });
              if (!team) throw new Error(`team ${teamId} not found`);
              await db.user.create({
                data: {
                  id: userId,
                  name: r.name,
                  phone: r.phone,
                  email: r.email,
                  pin_hash: hashSecret(cryptoRandomDigits()),
                  pin_history: [],
                  role: 'worker',
                  organization_id: team.organization_id,
                  branch_id: team.location_id,
                  status: defaultStatus,
                },
              });
            }
            await db.teamMembership.upsert({
              where: { team_id_user_id: { team_id: teamId, user_id: userId } },
              update: {},
              create: {
                id: newId('tm'),
                team_id: teamId,
                user_id: userId,
                is_team_admin: false,
              },
            });
            succeeded += 1;
          } catch (err) {
            failed += 1;
            errors.push({
              row: i + 1,
              message: err instanceof Error ? err.message : String(err),
            });
          }
          if ((i + 1) % 25 === 0) {
            await db.job.update({
              where: { id: jobId },
              data: { processed: i + 1, succeeded, failed },
            });
          }
        }
        return { total: rows.length, succeeded, failed, errors };
      },
    );
  }
}

function cryptoRandomDigits(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
