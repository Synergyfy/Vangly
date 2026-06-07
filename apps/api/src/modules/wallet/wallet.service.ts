import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { JobsService } from '../../infra/jobs/jobs.service';
import { newId } from '../../common/utils/hash';
import { PurchaseSmsDto, TopupWalletDto } from './dto/wallet.dto';

const SMS_UNIT_PRICE = 1;

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: OrgAuditService,
    private readonly jobs: JobsService,
  ) {}

  async getBalance(authUser: {
    sub: string;
    organization_id: string;
    role: string;
    branch_id?: string;
  }) {
    if (
      authUser.role === 'worker' ||
      authUser.role === 'location_admin' ||
      authUser.role === 'branch_admin' ||
      !authUser.organization_id
    ) {
      const user = await this.prisma.user.findUnique({
        where: { id: authUser.sub },
        select: { id: true, credits: true },
      });
      return {
        owner_type: 'user' as const,
        owner_id: user?.id ?? authUser.sub,
        balance: user?.credits ?? 0,
        currency: 'credits',
      };
    }
    if (authUser.role === 'organization_admin') {
      const locs = await this.prisma.location.findMany({
        where: { organization_id: authUser.organization_id },
        select: { id: true, sms_credits: true },
      });
      const total = locs.reduce((s, l) => s + (l.sms_credits ?? 0), 0);
      return {
        owner_type: 'location' as const,
        owner_id: null,
        balance: total,
        currency: 'sms_credits',
      };
    }
    throw new ForbiddenException('Cannot view wallet');
  }

  async listTransactions(
    authUser: {
      sub: string;
      organization_id: string;
      role: string;
      branch_id?: string;
    },
    page: number,
    pageSize: number,
  ) {
    const where: Prisma.WalletTransactionWhereInput = {
      organization_id: authUser.organization_id,
    };
    if (authUser.role === 'worker') {
      where.owner_user_id = authUser.sub;
      where.owner_type = 'user';
    } else if (
      authUser.role === 'location_admin' ||
      authUser.role === 'branch_admin'
    ) {
      where.OR = [
        { owner_type: 'user', owner_user_id: authUser.sub },
        { owner_type: 'location', owner_location_id: authUser.branch_id },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.walletTransaction.count({ where }),
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async topup(
    authUser: {
      sub: string;
      organization_id: string;
      role: string;
      branch_id?: string;
    },
    dto: TopupWalletDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    if (dto.owner_type === 'location') {
      this.assertOrgAdmin(authUser.role);
      if (!dto.location_id) {
        throw new BadRequestException('location_id is required');
      }
      const loc = await this.prisma.location.findFirst({
        where: {
          id: dto.location_id,
          organization_id: authUser.organization_id,
        },
      });
      if (!loc) throw new NotFoundException('Location not found');

      const updated = await this.prisma.location.update({
        where: { id: dto.location_id },
        data: { sms_credits: { increment: dto.amount } },
      });

      const tx = await this.prisma.walletTransaction.create({
        data: {
          id: newId('wtx'),
          organization_id: authUser.organization_id,
          owner_type: 'location',
          owner_location_id: dto.location_id,
          location_id: dto.location_id,
          actor_user_id: authUser.sub,
          delta: dto.amount,
          balance_after: updated.sms_credits,
          kind: 'topup',
          ref_id: dto.ref_id ?? null,
          description: dto.description ?? null,
          createdAt: new Date(),
        },
      });
      await this.audit.log({
        actorId: authUser.sub,
        organizationId: authUser.organization_id,
        locationId: dto.location_id,
        entity: 'WalletTransaction',
        entityId: tx.id,
        action: 'create',
        diff: { after: dto },
        ip: req?.ip ?? 'unknown',
        ua: (req?.headers?.['user-agent'] as string) ?? null,
      });
      return tx;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: authUser.sub,
        organization_id: authUser.organization_id,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { credits: { increment: dto.amount } },
    });

    const tx = await this.prisma.walletTransaction.create({
      data: {
        id: newId('wtx'),
        organization_id: authUser.organization_id,
        owner_type: 'user',
        owner_user_id: user.id,
        actor_user_id: authUser.sub,
        delta: dto.amount,
        balance_after: updated.credits,
        kind: 'topup',
        ref_id: dto.ref_id ?? null,
        description: dto.description ?? null,
        createdAt: new Date(),
      },
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id,
      entity: 'WalletTransaction',
      entityId: tx.id,
      action: 'create',
      diff: { after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? null,
    });
    return tx;
  }

  async purchaseSms(
    authUser: {
      sub: string;
      organization_id: string;
      role: string;
    },
    dto: PurchaseSmsDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    this.assertOrgMember(authUser.role);
    const loc = await this.prisma.location.findFirst({
      where: { id: dto.location_id, organization_id: authUser.organization_id },
    });
    if (!loc) throw new NotFoundException('Location not found');

    const cost = dto.sms_count * SMS_UNIT_PRICE;
    const user = await this.prisma.user.findUnique({
      where: { id: authUser.sub },
      select: { credits: true },
    });
    if (!user || user.credits < cost) {
      throw new BadRequestException('Insufficient personal credits');
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: authUser.sub },
      data: { credits: { decrement: cost } },
    });
    const updatedLoc = await this.prisma.location.update({
      where: { id: dto.location_id },
      data: { sms_credits: { increment: dto.sms_count } },
    });

    const job = await this.jobs.enqueue(
      'wallet.sms_purchase',
      authUser.organization_id,
      dto.location_id,
      {
        sms_count: dto.sms_count,
        cost,
        actor_user_id: authUser.sub,
      },
    );

    await this.prisma.walletTransaction.createMany({
      data: [
        {
          id: newId('wtx'),
          organization_id: authUser.organization_id,
          owner_type: 'user',
          owner_user_id: authUser.sub,
          location_id: dto.location_id,
          actor_user_id: authUser.sub,
          delta: -cost,
          balance_after: updatedUser.credits,
          kind: 'purchase_sms',
          ref_id: job.jobId,
          description: dto.description ?? null,
          createdAt: new Date(),
        },
        {
          id: newId('wtx'),
          organization_id: authUser.organization_id,
          owner_type: 'location',
          owner_location_id: dto.location_id,
          location_id: dto.location_id,
          actor_user_id: authUser.sub,
          delta: dto.sms_count,
          balance_after: updatedLoc.sms_credits,
          kind: 'purchase_sms',
          ref_id: job.jobId,
          description: dto.description ?? null,
          createdAt: new Date(),
        },
      ],
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id,
      locationId: dto.location_id,
      entity: 'Wallet',
      entityId: dto.location_id,
      action: 'purchase_sms',
      diff: { sms_count: dto.sms_count, cost },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? null,
    });
    return { job_id: job.jobId, sms_count: dto.sms_count, cost };
  }

  private assertOrgAdmin(role: string) {
    const normalized = role === 'branch_admin' ? 'location_admin' : role;
    if (normalized !== 'organization_admin' && normalized !== 'super_admin') {
      throw new ForbiddenException(
        'Only organization admins can perform this action',
      );
    }
  }

  private assertOrgMember(role: string) {
    const normalized = role === 'branch_admin' ? 'location_admin' : role;
    const allowed = [
      'organization_admin',
      'super_admin',
      'location_admin',
      'worker',
    ];
    if (!allowed.includes(normalized)) {
      throw new ForbiddenException('Not a member of this organization');
    }
  }
}
