import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService as PrismaService } from '../../database/database.service';

export interface AnalyticsScope {
  organizationId: string;
  locationId?: string | null;
  ownerUserId?: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverview(scope: AnalyticsScope) {
    const cards = await this.getCards(scope);
    const growth = await this.getGrowth(scope);
    return { cards, growth };
  }

  async getOrgAnalytics(scope: AnalyticsScope) {
    const [cards, growth, top, recent] = await Promise.all([
      this.getCards(scope),
      this.getGrowth(scope),
      this.getTopPerformers(scope, 5),
      this.getRecentActivity(scope, 10),
    ]);
    return {
      cards,
      growth,
      top_performers: top,
      recent_activity: recent,
    };
  }

  async getLocationAnalytics(scope: AnalyticsScope) {
    const [cards, growth, top, recent] = await Promise.all([
      this.getCards(scope),
      this.getGrowth(scope),
      this.getTopPerformers(scope, 5),
      this.getRecentActivity(scope, 10),
    ]);
    return {
      cards,
      growth,
      top_performers: top,
      recent_activity: recent,
    };
  }

  async getWorkerAnalytics(scope: AnalyticsScope) {
    const [cards, growth, recent] = await Promise.all([
      this.getCards(scope),
      this.getGrowth(scope),
      this.getRecentActivity(scope, 10),
    ]);
    return { cards, growth, recent_activity: recent };
  }

  private locationFilter(scope: AnalyticsScope) {
    if (scope.locationId) {
      return { location_id: scope.locationId };
    }
    return {};
  }

  private ownerFilter(scope: AnalyticsScope) {
    if (scope.ownerUserId) {
      return { owner_user_id: scope.ownerUserId };
    }
    return {};
  }

  private async getCards(scope: AnalyticsScope) {
    const locFilter = this.locationFilter(scope);
    const orgFilter = { organization_id: scope.organizationId };

    const [teams, forms, sms, contactCounts] = await Promise.all([
      this.prisma.team.count({
        where: {
          ...orgFilter,
          ...(locFilter.location_id
            ? { location_id: locFilter.location_id }
            : {}),
        },
      }),
      this.prisma.form.count({
        where: {
          ...orgFilter,
          ...(locFilter.location_id
            ? { location_id: locFilter.location_id }
            : {}),
        },
      }),
      this.prisma.smsAuditLog.count({
        where: {
          ...orgFilter,
          ...(locFilter.location_id
            ? { location_id: locFilter.location_id }
            : {}),
          status: 'sent',
        },
      }),
      this.prisma.contact.groupBy({
        by: ['status'],
        where: { ...orgFilter, ...locFilter, ...this.ownerFilter(scope) },
        _count: { _all: true },
      }),
    ]);

    const memberTeams = await this.prisma.team.findMany({
      where: {
        ...orgFilter,
        ...(locFilter.location_id
          ? { location_id: locFilter.location_id }
          : {}),
      },
      select: { id: true },
    });
    const totalMembers = await this.prisma.user.count({
      where: {
        organization_id: scope.organizationId,
        teamMemberships: {
          some: { team_id: { in: memberTeams.map((t) => t.id) } },
        },
      },
    });

    const totalSubmissions = contactCounts.reduce(
      (s, c) => s + (c._count?._all ?? 0),
      0,
    );

    return {
      total_teams: teams,
      total_members: totalMembers,
      total_forms: forms,
      total_submissions: totalSubmissions,
      sms_credits_used: sms,
    };
  }

  private async getGrowth(scope: AnalyticsScope) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 30);
    since.setUTCHours(0, 0, 0, 0);

    const where: Prisma.ContactWhereInput = {
      organization_id: scope.organizationId,
      createdAt: { gte: since },
    };
    if (scope.locationId) where.location_id = scope.locationId;
    if (scope.ownerUserId) where.owner_user_id = scope.ownerUserId;

    const rows = await this.prisma.contact.findMany({
      where,
      select: { createdAt: true, status: true },
    });

    const buckets = new Map<string, { invited: number; attended: number }>();
    for (let d = 0; d < 30; d++) {
      const day = new Date(since);
      day.setUTCDate(since.getUTCDate() + d);
      const key = day.toISOString().slice(0, 10);
      buckets.set(key, { invited: 0, attended: 0 });
    }
    for (const r of rows) {
      const key = r.createdAt.toISOString().slice(0, 10);
      const b = buckets.get(key);
      if (!b) continue;
      if (r.status === 'invited') b.invited += 1;
      if (r.status === 'attended') b.attended += 1;
    }

    return {
      points: Array.from(buckets.entries()).map(([date, v]) => ({
        date,
        invited: v.invited,
        attended: v.attended,
      })),
    };
  }

  private async getTopPerformers(scope: AnalyticsScope, limit: number) {
    const users = await this.prisma.user.findMany({
      where: {
        organization_id: scope.organizationId,
        role: 'worker',
        ...(scope.locationId ? { branch_id: scope.locationId } : {}),
      },
      select: { id: true, name: true, invites_count: true },
      orderBy: { invites_count: 'desc' },
      take: limit,
    });

    const counts = await Promise.all(
      users.map(async (u) => {
        const c = await this.prisma.contact.count({
          where: {
            organization_id: scope.organizationId,
            owner_user_id: u.id,
            status: 'attended',
          },
        });
        return { user_id: u.id, attended_count: c };
      }),
    );
    const countMap = new Map(counts.map((c) => [c.user_id, c.attended_count]));

    return users.map((u) => ({
      user_id: u.id,
      name: u.name,
      invites_count: u.invites_count,
      attended_count: countMap.get(u.id) ?? 0,
    }));
  }

  private async getRecentActivity(scope: AnalyticsScope, limit: number) {
    const audit = await this.prisma.orgAuditLog.findMany({
      where: {
        organization_id: scope.organizationId,
        ...(scope.locationId ? { location_id: scope.locationId } : {}),
      },
      orderBy: { at: 'desc' },
      take: limit,
      select: {
        id: true,
        entity: true,
        action: true,
        actor_id: true,
        diff: true,
        at: true,
      },
    });

    return audit.map((a) => ({
      id: a.id,
      kind: `${a.entity}.${a.action}`,
      actor_user_id: a.actor_id,
      description: this.summarize(a.entity, a.action, a.diff),
      at: a.at.toISOString(),
    }));
  }

  private summarize(
    entity: string,
    action: string,
    diff: Prisma.JsonValue | null,
  ): string {
    if (!diff || typeof diff !== 'object' || diff === null) {
      return `${entity} ${action}`;
    }
    const obj = diff as Record<string, unknown>;
    const after = obj.after as Record<string, unknown> | undefined;
    if (after && typeof after.name === 'string') {
      return `${entity} ${action}: ${after.name}`;
    }
    if (after && typeof after.phone === 'string') {
      return `${entity} ${action}: ${after.phone}`;
    }
    return `${entity} ${action}`;
  }
}
