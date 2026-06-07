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
import { hashSecret } from '../../common/utils/hash';
import { newId } from '../../common/utils/hash';
import { FormsService } from '../forms/forms.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateUserDto,
} from './dto/user.dto';

type UserListRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  organization_id: string;
  teamMemberships: Array<{ team_id: string }>;
  branch_id: string | null;
  credits: number;
  invites_count: number;
  suspended: boolean;
  createdAt: Date;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: OrgAuditService,
    private readonly forms: FormsService,
  ) {}

  async list(
    authUser: AuthUser,
    query: ListUsersQueryDto,
    page: number,
    pageSize: number,
  ) {
    const where: Prisma.UserWhereInput = {
      organization_id: authUser.organization_id!,
    };
    if (this.isBranchScoped(authUser.role) && authUser.branch_id) {
      where.branch_id = authUser.branch_id;
    }
    if (query.role) where.role = query.role;
    if (query.team_id) {
      where.teamMemberships = { some: { team_id: query.team_id } };
    }
    if (query.branch_id) where.branch_id = query.branch_id;
    if (query.status === 'suspended') where.suspended = true;
    if (query.status === 'active') where.suspended = false;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          organization_id: true,
          teamMemberships: { select: { team_id: true } },
          branch_id: true,
          credits: true,
          invites_count: true,
          suspended: true,
          createdAt: true,
        },
      }),
    ]);
    return {
      data: data.map((u: UserListRow) => ({
        ...u,
        team_id: u.teamMemberships?.[0]?.team_id ?? null,
        teamMemberships: undefined,
        created_at: u.createdAt,
      })),
      total,
      page,
      page_size: pageSize,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async get(authUser: AuthUser, id: string) {
    const u = await this.prisma.user.findFirst({
      where: { id, organization_id: authUser.organization_id! },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        organization_id: true,
        teamMemberships: { select: { team_id: true } },
        branch_id: true,
        credits: true,
        invites_count: true,
        suspended: true,
        createdAt: true,
      },
    });
    if (!u) throw new NotFoundException('User not found');
    this.assertCanRead(authUser, u);
    return {
      ...u,
      team_id: u.teamMemberships?.[0]?.team_id ?? null,
      teamMemberships: undefined,
      created_at: u.createdAt,
    };
  }

  async create(
    authUser: AuthUser,
    dto: CreateUserDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    this.assertCanManage(authUser, dto.role);

    const dup = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (dup) throw new ConflictException('Phone already in use');

    const tempPin = '0000';
    const pinHash = hashSecret(tempPin);
    const id = newId('usr');
    await this.prisma.user.create({
      data: {
        id,
        name: dto.name,
        phone: dto.phone,
        email: dto.email ?? null,
        role: dto.role,
        organization_id: authUser.organization_id!,
        branch_id: dto.branch_id ?? null,
        credits: dto.credits ?? 0,
        pin_hash: pinHash,
        pin_history: [pinHash],
        suspended: false,
        failed_attempts: 0,
        locked_until: null,
        createdAt: new Date(),
      },
    });

    if (dto.team_id) {
      await this.prisma.teamMembership.create({
        data: {
          id: newId('tm'),
          team_id: dto.team_id,
          user_id: id,
          is_team_admin: false,
          joined_at: new Date(),
        },
      });
    }

    if (dto.role === 'worker') {
      try {
        await this.forms.ensureFirstTimerForm({
          organizationId: authUser.organization_id!,
          ownerUserId: id,
          name: `${dto.name} Invite`,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'unknown';
        void this.audit.log({
          actorId: authUser.sub,
          organizationId: authUser.organization_id!,
          entity: 'User',
          entityId: id,
          action: 'create_form_failed',
          diff: { error: message },
          ip: req?.ip ?? 'unknown',
          ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
        });
      }
    }

    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: dto.branch_id ?? null,
      entity: 'User',
      entityId: id,
      action: 'create',
      diff: { after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });

    return { id, temporary_pin: tempPin };
  }

  async update(
    authUser: AuthUser,
    id: string,
    dto: UpdateUserDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    const current = await this.prisma.user.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!current) throw new NotFoundException('User not found');
    this.assertCanWrite(authUser, current);

    if (dto.team_id !== undefined) {
      await this.prisma.teamMembership.deleteMany({
        where: { user_id: id },
      });
      if (dto.team_id) {
        await this.prisma.teamMembership.create({
          data: {
            id: newId('tm'),
            team_id: dto.team_id,
            user_id: id,
            is_team_admin: false,
            joined_at: new Date(),
          },
        });
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        email: dto.email ?? undefined,
        branch_id: dto.branch_id ?? undefined,
        suspended: dto.suspended ?? undefined,
        credits: dto.credits ?? undefined,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        organization_id: true,
        teamMemberships: { select: { team_id: true } },
        branch_id: true,
        credits: true,
        invites_count: true,
        suspended: true,
        createdAt: true,
      },
    });

    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: updated.branch_id,
      entity: 'User',
      entityId: id,
      action: 'update',
      diff: { before: current, after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return {
      ...updated,
      team_id: updated.teamMemberships?.[0]?.team_id ?? null,
      teamMemberships: undefined,
      created_at: updated.createdAt,
    };
  }

  async remove(
    authUser: AuthUser,
    id: string,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    const current = await this.prisma.user.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!current) throw new NotFoundException('User not found');
    if (id === authUser.sub) {
      throw new BadRequestException('You cannot delete your own account');
    }
    if (!this.isOrgAdmin(authUser.role)) {
      throw new ForbiddenException('Only organization admins can delete users');
    }
    await this.prisma.user.delete({ where: { id } });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: current.branch_id,
      entity: 'User',
      entityId: id,
      action: 'delete',
      diff: { before: current },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return { id, deleted: true };
  }

  private isOrgAdmin(role: string | null): boolean {
    const normalized = role === 'branch_admin' ? 'location_admin' : role;
    return normalized === 'organization_admin' || normalized === 'super_admin';
  }
  private isBranchScoped(role: string | null): boolean {
    return role === 'location_admin' || role === 'branch_admin';
  }
  private assertCanManage(
    authUser: { role: string | null; organization_id: string | null },
    targetRole: string,
  ) {
    if (this.isOrgAdmin(authUser.role)) return;
    if (this.isBranchScoped(authUser.role) && targetRole === 'worker') return;
    throw new ForbiddenException('Cannot create users with this role');
  }
  private assertCanRead(
    authUser: AuthUser,
    user: {
      id: string;
      branch_id: string | null;
    },
  ) {
    if (this.isOrgAdmin(authUser.role)) return;
    if (
      this.isBranchScoped(authUser.role) &&
      user.branch_id === authUser.branch_id
    )
      return;
    if (user.id === authUser.sub) return;
    throw new ForbiddenException('Cannot view this user');
  }
  private assertCanWrite(
    authUser: AuthUser,
    user: { branch_id: string | null },
  ) {
    if (this.isOrgAdmin(authUser.role)) return;
    if (
      this.isBranchScoped(authUser.role) &&
      user.branch_id === authUser.branch_id
    )
      return;
    throw new ForbiddenException('Cannot update this user');
  }
}
