import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { newId } from '../../common/utils/hash';

export interface SendSmsInput {
  to: string;
  template?: string;
  templateId?: string | null;
  vars?: Record<string, string | number>;
  organizationId: string;
  locationId?: string | null;
  actorUserId?: string;
  body: string;
}

export interface SendSmsResult {
  ok: boolean;
  reason?: 'INSUFFICIENT_CREDITS';
  status: 'sent' | 'failed' | 'insufficient_credits';
  logId?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly db: DatabaseService) {}

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    let creditsAfter = 0;
    if (input.locationId) {
      const location = await this.db.location.findUnique({
        where: { id: input.locationId },
        select: { sms_credits: true },
      });
      const current = location?.sms_credits ?? 0;
      if (current <= 0) {
        await this.audit(input, 'insufficient_credits', current);
        this.logger.warn(
          `[sms:mock] Insufficient credits for org=${input.organizationId} loc=${input.locationId} -> ${input.to}`,
        );
        throw new HttpException(
          {
            error: {
              code: 'INSUFFICIENT_CREDITS',
              message: 'Location has no SMS credits remaining.',
            },
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      await this.db.location.update({
        where: { id: input.locationId },
        data: { sms_credits: { decrement: 1 } },
      });
      creditsAfter = current - 1;
    }

    const logId = await this.audit(input, 'sent', creditsAfter);
    this.logger.log(
      `[sms:mock] -> ${input.to} | ${input.template ?? input.templateId ?? 'ad-hoc'} | ${input.body}`,
    );
    return { ok: true, status: 'sent', logId };
  }

  private async audit(
    input: SendSmsInput,
    status: 'sent' | 'failed' | 'insufficient_credits',
    creditsAfter: number,
  ): Promise<string> {
    const id = newId('sms');
    await this.db.smsAuditLog.create({
      data: {
        id,
        organization_id: input.organizationId,
        location_id: input.locationId ?? null,
        to_phone: input.to,
        template: input.template ?? input.templateId ?? 'ad-hoc',
        body_preview: input.body.slice(0, 280),
        status,
        credits_after: creditsAfter,
        at: new Date(),
      },
    });
    return id;
  }
}
