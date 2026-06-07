import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import { newId } from '../../common/utils/hash';

export interface OrgAuditInput {
  actorId: string | null;
  organizationId: string;
  locationId?: string | null;
  entity: string;
  entityId: string;
  action: string;
  diff?: Record<string, unknown>;
  ip?: string;
  ua?: string | null;
}

@Injectable()
export class OrgAuditService {
  constructor(private readonly db: DatabaseService) {}

  async log(input: OrgAuditInput): Promise<void> {
    await this.db.orgAuditLog.create({
      data: {
        id: newId('oaud'),
        actor_id: input.actorId,
        organization_id: input.organizationId,
        location_id: input.locationId ?? null,
        entity: input.entity,
        entity_id: input.entityId,
        action: input.action,
        diff: (input.diff ?? {}) as Prisma.InputJsonValue,
        ip: input.ip ?? 'unknown',
        ua: input.ua ?? 'unknown',
        at: new Date(),
      },
    });
  }
}
