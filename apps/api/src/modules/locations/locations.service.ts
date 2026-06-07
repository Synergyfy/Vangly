import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/write-location.dto';
import { FindLocationsQueryDto } from './dto/find-locations-query.dto';
import { LocationDashboardQueryDto } from './dto/location-dashboard-query.dto';
import { UpdateLocationBrandDto } from './dto/location-brand.dto';
import {
  LocationDashboardEntity,
  DashboardStatEntity,
  AttendanceBucketEntity,
  MilestoneEntity,
} from './entities/location-dashboard.entity';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { StorageService } from '../../infra/storage/storage.service';
import { newId } from '../../common/utils/hash';
import {
  paginationFromQuery,
  buildPaginatedResponse,
} from '../../common/utils/paginated';

const TIMEFRAME_DAYS: Record<'week' | 'month' | 'year', number> = {
  week: 7,
  month: 30,
  year: 365,
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: OrgAuditService,
    private readonly storage: StorageService,
  ) {}

  async list(
    organizationId: string,
    userRole: string,
    userBranchId: string | null,
    query: FindLocationsQueryDto,
  ): Promise<{
    data: unknown[];
    meta: { page: number; per_page: number; total: number };
  }> {
    const { page, perPage, offset, limit } = paginationFromQuery(
      query.page,
      query.per_page,
    );

    const where: Prisma.LocationWhereInput = {
      organization_id: organizationId,
      ...(userRole === 'location_admin' && userBranchId
        ? { id: userBranchId }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { city: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.db.location.findMany({
        where,
        select: this.locationListSelect(),
        orderBy: [{ is_hq: 'desc' }, { createdAt: 'asc' }],
        skip: offset,
        take: limit,
      }),
      this.db.location.count({ where }),
    ]);

    const data = await Promise.all(
      rows.map(async (row) => this.decorateWithStats(row)),
    );

    return buildPaginatedResponse(data, total, page, perPage);
  }

  async create(
    organizationId: string,
    dto: CreateLocationDto,
    actor: { id: string; ip: string; ua: string },
  ): Promise<unknown> {
    if (dto.photo_url) {
      this.storage.resolvePhotoUrl({ photo_url: dto.photo_url });
    }

    const existing = await this.db.location.count({
      where: { organization_id: organizationId },
    });
    const isHq = existing === 0;

    let created: { id: string };
    try {
      created = await this.db.location.create({
        data: {
          id: newId('loc'),
          organization_id: organizationId,
          name: dto.name,
          address: dto.address ?? '',
          city: dto.city,
          state: dto.state ?? '',
          country: dto.country,
          description: dto.description,
          photo_url: dto.photo_url,
          is_hq: isHq,
          status: 'active',
        },
        select: { id: true },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException({
          error: {
            code: 'CONFLICT',
            message: `A location named "${dto.name}" already exists in this organization.`,
          },
        });
      }
      throw err;
    }

    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId: created.id,
      entity: 'location',
      entityId: created.id,
      action: 'location.create',
      diff: { name: dto.name, city: dto.city, is_hq: isHq },
      ip: actor.ip,
      ua: actor.ua,
    });

    return this.getById(organizationId, created.id, 'super_admin');
  }

  async getById(
    organizationId: string,
    locationId: string,
    userRole: string,
    userBranchId?: string | null,
  ): Promise<unknown> {
    if (
      userRole === 'location_admin' &&
      userBranchId &&
      userBranchId !== locationId
    ) {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own location.',
        },
      });
    }
    const row = await this.db.location.findFirst({
      where: { id: locationId, organization_id: organizationId },
      select: this.locationListSelect(),
    });
    if (!row) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Location ${locationId} not found.`,
        },
      });
    }
    return this.decorateWithStats(row);
  }

  async update(
    organizationId: string,
    locationId: string,
    dto: UpdateLocationDto,
    actor: { id: string; ip: string; ua: string },
  ): Promise<unknown> {
    const existing = await this.db.location.findFirst({
      where: { id: locationId, organization_id: organizationId },
      select: { id: true, is_hq: true, name: true, city: true, status: true },
    });
    if (!existing) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Location ${locationId} not found.`,
        },
      });
    }

    if (dto.photo_url) {
      this.storage.resolvePhotoUrl({ photo_url: dto.photo_url });
    }

    const data: Prisma.LocationUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.city !== undefined ? { city: dto.city } : {}),
      ...(dto.state !== undefined ? { state: dto.state } : {}),
      ...(dto.country !== undefined ? { country: dto.country } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(dto.photo_url !== undefined ? { photo_url: dto.photo_url } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    };

    try {
      await this.db.location.update({ where: { id: locationId }, data });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException({
          error: {
            code: 'CONFLICT',
            message: `A location named "${dto.name}" already exists in this organization.`,
          },
        });
      }
      throw err;
    }

    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId,
      entity: 'location',
      entityId: locationId,
      action: 'location.update',
      diff: dto as unknown as Record<string, unknown>,
      ip: actor.ip,
      ua: actor.ua,
    });

    return this.getById(organizationId, locationId, 'super_admin');
  }

  async softDelete(
    organizationId: string,
    locationId: string,
    actor: { id: string; ip: string; ua: string },
  ): Promise<void> {
    const existing = await this.db.location.findFirst({
      where: { id: locationId, organization_id: organizationId },
      select: { id: true, is_hq: true },
    });
    if (!existing) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Location ${locationId} not found.`,
        },
      });
    }
    if (existing.is_hq) {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message: 'The HQ location cannot be archived.',
        },
      });
    }
    await this.db.location.update({
      where: { id: locationId },
      data: { status: 'archived' },
    });
    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId,
      entity: 'location',
      entityId: locationId,
      action: 'location.archive',
      diff: {},
      ip: actor.ip,
      ua: actor.ua,
    });
  }

  async setPhoto(
    organizationId: string,
    locationId: string,
    photoUrl: string,
    actor: { id: string; ip: string; ua: string },
  ): Promise<{ photo_url: string }> {
    const resolved = this.storage.resolvePhotoUrl({ photo_url: photoUrl });
    if (!resolved) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'photo_url is required.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const existing = await this.db.location.findFirst({
      where: { id: locationId, organization_id: organizationId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Location ${locationId} not found.`,
        },
      });
    }
    await this.db.location.update({
      where: { id: locationId },
      data: { photo_url: resolved.photo_url },
    });
    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId,
      entity: 'location',
      entityId: locationId,
      action: 'location.photo_update',
      diff: { photo_url: resolved.photo_url },
      ip: actor.ip,
      ua: actor.ua,
    });
    return { photo_url: resolved.photo_url };
  }

  async getDashboard(
    organizationId: string,
    locationId: string,
    query: LocationDashboardQueryDto,
    userRole: string,
    userBranchId: string | null,
  ): Promise<LocationDashboardEntity> {
    if (
      userRole === 'location_admin' &&
      userBranchId &&
      userBranchId !== locationId
    ) {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own location.',
        },
      });
    }
    const loc = await this.db.location.findFirst({
      where: { id: locationId, organization_id: organizationId },
      select: { id: true, status: true, createdAt: true },
    });
    if (!loc) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Location ${locationId} not found.`,
        },
      });
    }

    switch (query.tab) {
      case 'performance':
        return {
          tab: 'performance',
          data: await this.performanceTab(
            locationId,
            query.timeframe ?? 'week',
          ),
        };
      case 'teams':
        return { tab: 'teams', data: await this.teamsTab(locationId) };
      case 'settings':
        return {
          tab: 'settings',
          data: await this.settingsTab(locationId, loc.status, loc.createdAt),
        };
      default:
        return {
          tab: 'performance',
          data: await this.performanceTab(locationId, 'week'),
        };
    }
  }

  private async performanceTab(
    locationId: string,
    timeframe: 'week' | 'month' | 'year',
  ): Promise<{
    stats: DashboardStatEntity[];
    attendance: {
      timeframe: 'week' | 'month' | 'year';
      buckets: AttendanceBucketEntity[];
    };
    milestones: MilestoneEntity[];
  }> {
    const since = new Date();
    since.setDate(since.getDate() - TIMEFRAME_DAYS[timeframe]);

    const [
      totalSubmissions,
      totalInvites,
      topTeamAgg,
      topInviter,
      prevSubmissions,
      prevInvites,
    ] = await Promise.all([
      this.db.formResponse.count({
        where: { location_id: locationId, submitted_at: { gte: since } },
      }),
      this.db.user.aggregate({
        where: { branch_id: locationId },
        _sum: { invites_count: true },
      }),
      this.db.form.groupBy({
        by: ['team_id'],
        where: { location_id: locationId },
        _count: { _all: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
      }),
      this.db.user.findFirst({
        where: { branch_id: locationId },
        orderBy: { invites_count: 'desc' },
        select: { id: true, name: true, invites_count: true },
      }),
      this.db.formResponse.count({
        where: {
          location_id: locationId,
          submitted_at: {
            gte: new Date(
              since.getTime() - TIMEFRAME_DAYS[timeframe] * 24 * 3600 * 1000,
            ),
            lt: since,
          },
        },
      }),
      Promise.resolve(0),
    ]);

    const invites = totalInvites._sum.invites_count ?? 0;
    const conversion =
      totalInvites._sum.invites_count && totalInvites._sum.invites_count > 0
        ? Math.round(
            (totalSubmissions / Math.max(totalInvites._sum.invites_count, 1)) *
              1000,
          ) / 10
        : 0;
    const prevConversion =
      prevInvites > 0
        ? Math.round((prevSubmissions / prevInvites) * 1000) / 10
        : 0;
    const conversionChange = +(conversion - prevConversion).toFixed(1);

    const topTeam = topTeamAgg[0];
    const topTeamName = topTeam
      ? ((
          await this.db.team.findUnique({
            where: { id: topTeam.team_id },
            select: { name: true },
          })
        )?.name ?? '—')
      : '—';

    const stats: DashboardStatEntity[] = [
      {
        label: 'Total Invites',
        value: invites,
        change_pct: 0,
        is_up: true,
      },
      {
        label: 'Conversion Rate',
        value: conversion,
        change_pct: conversionChange,
        is_up: conversionChange >= 0,
      },
      {
        label: 'Top Team',
        value: topTeamName,
        meta: `${topTeam?._count._all ?? 0} forms`,
        is_up: true,
      },
      {
        label: 'Top Inviter',
        value: topInviter?.name ?? '—',
        meta: `${topInviter?.invites_count ?? 0} invites`,
        is_up: true,
      },
    ];

    const buckets = await this.attendanceBuckets(locationId, timeframe);

    const milestones: MilestoneEntity[] = [
      {
        label: 'Highest Attendance',
        value: `${Math.max(...buckets.map((b) => b.value), 0)} people`,
        date: 'Last Sunday',
        icon: 'calendar',
      },
      {
        label: 'Most Invites Sent',
        value: `${invites} invites`,
        date:
          timeframe === 'week'
            ? 'this week'
            : timeframe === 'month'
              ? 'this month'
              : 'this year',
        icon: 'users',
      },
      {
        label: 'Record Conversion',
        value: `${conversion}%`,
        date:
          timeframe === 'week'
            ? 'this week'
            : timeframe === 'month'
              ? 'this month'
              : 'this year',
        icon: 'target',
      },
    ];

    return { stats, attendance: { timeframe, buckets }, milestones };
  }

  private async attendanceBuckets(
    locationId: string,
    timeframe: 'week' | 'month' | 'year',
  ): Promise<AttendanceBucketEntity[]> {
    if (timeframe === 'week') {
      const since = new Date();
      since.setDate(since.getDate() - 6);
      since.setHours(0, 0, 0, 0);
      const rows = await this.db.$queryRaw<
        Array<{ day: number; value: bigint }>
      >(Prisma.sql`
        SELECT EXTRACT(DOW FROM "submitted_at")::int AS day, COUNT(*)::bigint AS value
        FROM "FormResponse"
        WHERE "location_id" = ${locationId} AND "submitted_at" >= ${since}
        GROUP BY day
        ORDER BY day ASC
      `);
      const map = new Map<number, number>();
      for (const r of rows) map.set(Number(r.day), Number(r.value));
      return WEEKDAY_LABELS.map((label, idx) => ({
        label,
        value: map.get(idx) ?? 0,
      }));
    }
    if (timeframe === 'month') {
      const since = new Date();
      since.setDate(since.getDate() - 29);
      since.setHours(0, 0, 0, 0);
      const rows = await this.db.$queryRaw<
        Array<{ d: number; value: bigint }>
      >(Prisma.sql`
        SELECT EXTRACT(DAY FROM "submitted_at")::int AS d, COUNT(*)::bigint AS value
        FROM "FormResponse"
        WHERE "location_id" = ${locationId} AND "submitted_at" >= ${since}
        GROUP BY d
        ORDER BY d ASC
      `);
      const map = new Map<number, number>();
      for (const r of rows) map.set(Number(r.d), Number(r.value));
      return Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        return { label: String(day), value: map.get(day) ?? 0 };
      });
    }
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);
    const rows = await this.db.$queryRaw<
      Array<{ m: number; value: bigint }>
    >(Prisma.sql`
      SELECT EXTRACT(MONTH FROM "submitted_at")::int AS m, COUNT(*)::bigint AS value
      FROM "FormResponse"
      WHERE "location_id" = ${locationId} AND "submitted_at" >= ${since}
      GROUP BY m
      ORDER BY m ASC
    `);
    const map = new Map<number, number>();
    for (const r of rows) map.set(Number(r.m), Number(r.value));
    return MONTH_LABELS.map((label, idx) => ({
      label,
      value: map.get(idx + 1) ?? 0,
    }));
  }

  private async teamsTab(locationId: string): Promise<{
    teams: Array<{
      id: string;
      name: string;
      description?: string;
      kind: 'admin' | 'operational' | 'outreach' | 'custom';
      is_public_joinable: boolean;
      allow_member_pin: boolean;
      sms_otp_required: boolean;
      member_count: number;
      form_count: number;
      preview_members: Array<{ id: string; name: string }>;
    }>;
  }> {
    const teams = await this.db.team.findMany({
      where: { location_id: locationId },
      select: {
        id: true,
        name: true,
        description: true,
        kind: true,
        is_public_joinable: true,
        allow_member_pin: true,
        sms_otp_required: true,
        is_system: true,
        _count: { select: { memberships: true, forms: true } },
      },
      orderBy: [{ is_system: 'desc' }, { createdAt: 'asc' }],
    });
    if (teams.length === 0) return { teams: [] };
    const teamIds = teams.map((t) => t.id);
    const memberships = await this.db.teamMembership.findMany({
      where: { team_id: { in: teamIds } },
      orderBy: { joined_at: 'asc' },
      select: {
        team_id: true,
        user: { select: { id: true, name: true } },
      },
    });
    const grouped = new Map<string, Array<{ id: string; name: string }>>();
    for (const m of memberships) {
      const arr = grouped.get(m.team_id) ?? [];
      if (arr.length < 3) {
        const u = m.user;
        if (u) arr.push({ id: u.id, name: u.name });
      }
      grouped.set(m.team_id, arr);
    }
    return {
      teams: teams.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description ?? undefined,
        kind: t.kind as 'admin' | 'operational' | 'outreach' | 'custom',
        is_public_joinable: t.is_public_joinable,
        allow_member_pin: t.allow_member_pin,
        sms_otp_required: t.sms_otp_required,
        member_count: t._count.memberships,
        form_count: t._count.forms,
        preview_members: grouped.get(t.id) ?? [],
      })),
    };
  }

  private async settingsTab(
    locationId: string,
    status: string,
    createdAt: Date,
  ): Promise<{
    status: 'active' | 'paused' | 'archived';
    primary_admin: { id: string; name: string } | null;
    security_protocol: string;
    created_at: string;
  }> {
    const admin = await this.db.user.findFirst({
      where: {
        branch_id: locationId,
        role: { in: ['organization_admin', 'super_admin'] },
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true },
    });
    return {
      status: status as 'active' | 'paused' | 'archived',
      primary_admin: admin,
      security_protocol: '6-digit PIN',
      created_at: createdAt.toISOString(),
    };
  }

  private locationListSelect(): Prisma.LocationSelect {
    return {
      id: true,
      organization_id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      country: true,
      description: true,
      photo_url: true,
      is_hq: true,
      status: true,
      createdAt: true,
      updated_at: true,
    };
  }

  private async decorateWithStats(
    row: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const [teams, members, submissions30d] = await Promise.all([
      this.db.team.count({ where: { location_id: row.id as string } }),
      this.db.user.count({
        where: { branch_id: row.id as string, status: 'active' },
      }),
      this.db.formResponse.count({
        where: {
          location_id: row.id as string,
          submitted_at: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
        },
      }),
    ]);
    let activity: 'High' | 'Medium' | 'Low' = 'Low';
    if (submissions30d > 100) activity = 'High';
    else if (submissions30d > 25) activity = 'Medium';
    return {
      ...row,
      activity,
      stats: {
        teams,
        members,
        submissions_30d: submissions30d,
      },
      created_at: (row.createdAt as Date).toISOString(),
      updated_at: (row.updated_at as Date).toISOString(),
    };
  }

  async getBrand(organizationId: string, id: string) {
    const loc = await this.db.location.findFirst({
      where: { id, organization_id: organizationId },
      select: { id: true, brand: true },
    });
    if (!loc) {
      throw new HttpException(
        { error: { code: 'NOT_FOUND', message: 'Location not found' } },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      id: loc.id,
      brand: (loc.brand as Record<string, unknown> | null) ?? {},
    };
  }

  async updateBrand(
    organizationId: string,
    id: string,
    dto: UpdateLocationBrandDto,
    actor: { id: string; ip: string; ua: string },
  ) {
    const loc = await this.db.location.findFirst({
      where: { id, organization_id: organizationId },
    });
    if (!loc) {
      throw new HttpException(
        { error: { code: 'NOT_FOUND', message: 'Location not found' } },
        HttpStatus.NOT_FOUND,
      );
    }
    const updated = await this.db.location.update({
      where: { id },
      data: { brand: (dto.brand ?? {}) as Prisma.InputJsonValue },
      select: { id: true, brand: true },
    });
    await this.audit.log({
      actorId: actor.id,
      organizationId,
      locationId: id,
      entity: 'Location',
      entityId: id,
      action: 'brand.update',
      diff: { after: dto.brand ?? {} },
      ip: actor.ip,
      ua: actor.ua,
    });
    return {
      id: updated.id,
      brand: (updated.brand as Record<string, unknown>) ?? {},
    };
  }

  async getQrCode(organizationId: string, id: string) {
    const loc = await this.db.location.findFirst({
      where: { id, organization_id: organizationId },
      select: { id: true, name: true },
    });
    if (!loc) {
      throw new HttpException(
        { error: { code: 'NOT_FOUND', message: 'Location not found' } },
        HttpStatus.NOT_FOUND,
      );
    }
    const payload = `https://vangly.app/loc/${id}`;
    return {
      location_id: id,
      name: loc.name,
      payload,
      url: payload,
      qr_payload: payload,
    };
  }

  async listForms(
    organizationId: string,
    id: string,
    role: string,
    branchId: string | null,
    query: { page?: number; per_page?: number; status?: string; q?: string },
  ) {
    if (role === 'location_admin' && branchId !== id) {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your own location forms.',
        },
      });
    }
    const { page, perPage, offset, limit } = paginationFromQuery(
      query.page,
      query.per_page,
      { maxPerPage: 100 },
    );
    const where: Prisma.FormWhereInput = {
      organization_id: organizationId,
      location_id: id,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.db.form.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.db.form.count({ where }),
    ]);
    return buildPaginatedResponse(
      rows.map((r) => ({
        id: r.id,
        public_id: r.public_id,
        title: r.title,
        description: r.description,
        status: r.status,
        team_id: r.team_id,
        location_id: r.location_id,
        schema_version: r.schema_version,
        analytics_scans: r.analytics_scans,
        analytics_submissions: r.analytics_submissions,
        public_url: `https://vangly.app/f/${r.public_id}`,
        qr_payload: `https://vangly.app/f/${r.public_id}`,
        created_at: r.createdAt.toISOString(),
        published_at: r.published_at?.toISOString(),
        updated_at: r.updated_at.toISOString(),
      })),
      total,
      page,
      perPage,
    );
  }

  async listTeams(
    organizationId: string,
    id: string,
    role: string,
    branchId: string | null,
    query: { page?: number; per_page?: number; q?: string },
  ) {
    if (role === 'location_admin' && branchId !== id) {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your own location teams.',
        },
      });
    }
    const { page, perPage, offset, limit } = paginationFromQuery(
      query.page,
      query.per_page,
      { maxPerPage: 100 },
    );
    const where: Prisma.TeamWhereInput = {
      organization_id: organizationId,
      location_id: id,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.db.team.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: { _count: { select: { memberships: true, forms: true } } },
      }),
      this.db.team.count({ where }),
    ]);
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      kind: r.kind,
      is_system: r.is_system,
      is_public_joinable: r.is_public_joinable,
      members_count: r._count.memberships,
      forms_count: r._count.forms,
      location_id: r.location_id,
      created_at: r.createdAt.toISOString(),
      updated_at: r.updated_at.toISOString(),
    }));
    return buildPaginatedResponse(data, total, page, perPage);
  }
}
