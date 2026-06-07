import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { FormsService } from '../forms/forms.service';
import { SmsService } from '../../infra/sms/sms.service';
import { ContactMatchService } from '../contacts/contact-match.service';
import { newId } from '../../common/utils/hash';

const SCAN_TOKENS = new Map<string, { publicId: string; expiresAt: Date }>();
const SCAN_TOKEN_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class PublicFormsService {
  private readonly logger = new Logger(PublicFormsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly forms: FormsService,
    private readonly sms: SmsService,
    @Optional() private readonly contactMatcher?: ContactMatchService,
  ) {}

  async getForm(
    publicId: string,
    sessionUserId: string | null,
  ): Promise<unknown> {
    const form = await this.db.form.findUnique({
      where: { public_id: publicId },
      include: {
        organization: {
          select: { name: true, logo_url: true, primary_color: true },
        },
        location: { select: { name: true } },
      },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: 'Form not found.' },
      });
    }
    if (form.status !== 'published') {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message: 'Form is not currently published.',
        },
      });
    }
    const distribution = (form.distribution as Record<string, unknown>) ?? {};
    if (distribution.mode === 'registered' && !sessionUserId) {
      throw new ForbiddenException({
        error: {
          code: 'REGISTRATION_REQUIRED',
          message: 'Sign in to access this form.',
        },
      });
    }
    return {
      public_id: form.public_id,
      title: form.title,
      description: form.description ?? undefined,
      organization_name: form.organization.name,
      location_name: form.location.name,
      logo_url: form.organization.logo_url ?? undefined,
      primary_color: form.organization.primary_color ?? undefined,
      fields: form.fields,
      distribution: form.distribution,
      schema_version: form.schema_version,
    };
  }

  async requestScan(
    publicId: string,
    ref: string | undefined,
    meta: { ip: string; ua: string },
  ): Promise<unknown> {
    const form = await this.db.form.findUnique({
      where: { public_id: publicId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: 'Form not found.' },
      });
    }
    if (form.status !== 'published') {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Form is not currently published.',
        },
      });
    }
    const token = cryptoRandomToken(16);
    SCAN_TOKENS.set(token, {
      publicId,
      expiresAt: new Date(Date.now() + SCAN_TOKEN_TTL_MS),
    });
    this.logger.log(
      `Scan token issued for form ${form.id} ref=${ref ?? ''} ip=${meta.ip}`,
    );
    return { scan_token: token, public_id: publicId, form_id: form.id };
  }

  async verifyScan(publicId: string, scanToken: string): Promise<{ ok: true }> {
    const record = SCAN_TOKENS.get(scanToken);
    if (
      !record ||
      record.publicId !== publicId ||
      record.expiresAt < new Date()
    ) {
      SCAN_TOKENS.delete(scanToken);
      throw new ForbiddenException({
        error: { code: 'FORBIDDEN', message: 'Invalid or expired scan token.' },
      });
    }
    await this.db.form.update({
      where: { public_id: publicId },
      data: { analytics_scans: { increment: 1 } },
    });
    SCAN_TOKENS.delete(scanToken);
    return { ok: true };
  }

  async submit(
    publicId: string,
    answers: Record<string, unknown>,
    meta: { ip: string; ua: string; scanToken?: string; userId?: string },
  ): Promise<unknown> {
    const form = await this.db.form.findUnique({
      where: { public_id: publicId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: 'Form not found.' },
      });
    }
    if (form.status !== 'published') {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message: 'Form is not currently published.',
        },
      });
    }
    if (meta.scanToken) {
      const record = SCAN_TOKENS.get(meta.scanToken);
      if (
        !record ||
        record.publicId !== publicId ||
        record.expiresAt < new Date()
      ) {
        throw new ForbiddenException({
          error: {
            code: 'FORBIDDEN',
            message: 'Invalid or expired scan token.',
          },
        });
      }
      SCAN_TOKENS.delete(meta.scanToken);
    }
    const distribution = (form.distribution as Record<string, unknown>) ?? {};
    if (distribution.mode === 'registered' && !meta.userId) {
      throw new ForbiddenException({
        error: {
          code: 'REGISTRATION_REQUIRED',
          message: 'Sign in to submit this form.',
        },
      });
    }
    if (distribution.mode === 'private' && !meta.userId) {
      throw new ForbiddenException({
        error: {
          code: 'REGISTRATION_REQUIRED',
          message: 'Sign in to submit this form.',
        },
      });
    }

    await this.forms.validateSubmission({ fields: form.fields }, answers);

    const response = await this.db.$transaction(async (tx) => {
      const updated = await tx.form.update({
        where: { id: form.id },
        data: {
          analytics_submissions: { increment: 1 },
          updated_at: new Date(),
        },
        select: { schema_version: true },
      });
      return tx.formResponse.create({
        data: {
          id: newId('fresp'),
          form_id: form.id,
          organization_id: form.organization_id,
          location_id: form.location_id,
          form_schema_version: updated.schema_version,
          submitted_by: meta.userId ?? null,
          answers: answers as Prisma.InputJsonValue,
          ip: meta.ip || null,
          ua: meta.ua || null,
          submitted_at: new Date(),
        },
      });
    });

    if (
      distribution.send_sms_invites &&
      typeof distribution.sms_message === 'string'
    ) {
      try {
        await this.sms.send({
          to: 'mock',
          template: 'form_invite',
          vars: { message: distribution.sms_message, form_title: form.title },
          organizationId: form.organization_id,
          locationId: form.location_id,
          body: distribution.sms_message,
        });
      } catch (err) {
        this.logger.warn(
          `SMS invite failed for form ${form.id}: ${(err as Error).message}`,
        );
      }
    }

    if (this.contactMatcher) {
      const phone = (answers['phone'] ??
        answers['Phone'] ??
        answers['mobile']) as string | undefined;
      if (typeof phone === 'string' && phone.trim().length > 0) {
        const name = (answers['name'] ??
          answers['Name'] ??
          answers['full_name']) as string | undefined;
        try {
          await this.contactMatcher.matchOrCreate({
            organizationId: form.organization_id,
            phone,
            name: typeof name === 'string' ? name : undefined,
            locationId: form.location_id,
            ownerUserId: form.created_by,
            sourceUserId: meta.userId ?? form.created_by,
            sourceKind: 'public',
          });
        } catch (err) {
          this.logger.warn(
            `Contact match failed for form ${form.id}: ${(err as Error).message}`,
          );
        }
      }
    }

    return {
      response_id: response.id,
      submitted_at: response.submitted_at.toISOString(),
      message: 'Thanks for your response!',
    };
  }
}

function cryptoRandomToken(bytes: number): string {
  return crypto.randomBytes(bytes).toString('hex');
}
