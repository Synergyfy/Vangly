import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService as PrismaService } from '../../database/database.service';

export interface ContactMatchInput {
  organizationId: string;
  phone: string;
  name?: string;
  email?: string;
  locationId?: string;
  ownerUserId?: string;
  sourceUserId?: string;
  sourceKind?: 'worker' | 'branch_qr' | 'public';
}

export interface ContactMatchResult {
  id: string;
  matched: boolean;
  status: 'invited' | 'attended' | 'lost';
  updated: boolean;
  incrementedInviteCount: boolean;
}

@Injectable()
export class ContactMatchService {
  private readonly logger = new Logger(ContactMatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  normalizePhone(phone: string): string {
    return (phone ?? '').replace(/[^\d+]/g, '').trim();
  }

  async matchOrCreate(input: ContactMatchInput): Promise<ContactMatchResult> {
    const phone = this.normalizePhone(input.phone);
    if (!phone) {
      throw new Error('phone is required');
    }

    const existing = await this.prisma.contact.findUnique({
      where: {
        organization_id_phone: {
          organization_id: input.organizationId,
          phone,
        },
      },
      select: {
        id: true,
        status: true,
        owner_user_id: true,
        source_user_id: true,
        name: true,
        email: true,
      },
    });

    if (existing) {
      const isBranchQr = input.sourceKind === 'branch_qr';
      const becomesAttended = isBranchQr && existing.status !== 'attended';

      const updated = await this.prisma.contact.update({
        where: { id: existing.id },
        data: {
          name: input.name ?? existing.name,
          email: input.email ?? existing.email,
          status: becomesAttended ? 'attended' : existing.status,
          owner_user_id: input.ownerUserId ?? existing.owner_user_id,
          source_user_id: input.sourceUserId ?? existing.source_user_id,
          location_id: input.locationId ?? undefined,
        },
        select: { id: true, status: true },
      });

      if (becomesAttended && existing.owner_user_id) {
        await this.prisma.user
          .update({
            where: { id: existing.owner_user_id },
            data: { invites_count: { increment: 1 } },
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : 'unknown';
            this.logger.warn(
              `failed to increment invites_count for user ${existing.owner_user_id}: ${message}`,
            );
          });
      }

      return {
        id: updated.id,
        matched: true,
        status: updated.status as 'invited' | 'attended' | 'lost',
        updated: true,
        incrementedInviteCount: becomesAttended,
      };
    }

    const status: 'invited' | 'attended' =
      input.sourceKind === 'branch_qr' ? 'attended' : 'invited';

    const created = await this.prisma.contact.create({
      data: {
        id: `contact_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`,
        organization_id: input.organizationId,
        location_id: input.locationId ?? null,
        owner_user_id: input.ownerUserId ?? null,
        source_user_id: input.sourceUserId ?? null,
        name: input.name ?? 'Guest',
        phone,
        email: input.email ?? null,
        status,
        source_kind: input.sourceKind ?? 'worker',
        updated_at: new Date(),
      },
      select: { id: true, status: true },
    });

    if (status === 'attended' && input.ownerUserId) {
      await this.prisma.user
        .update({
          where: { id: input.ownerUserId },
          data: { invites_count: { increment: 1 } },
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'unknown';
          this.logger.warn(
            `failed to increment invites_count for user ${input.ownerUserId}: ${message}`,
          );
        });
    }

    return {
      id: created.id,
      matched: false,
      status: created.status as 'invited' | 'attended' | 'lost',
      updated: false,
      incrementedInviteCount: status === 'attended' && !!input.ownerUserId,
    };
  }
}
