import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { Prisma } from '@prisma/client';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { SmsService } from '../../infra/sms/sms.service';
import { ContactMatchService } from '../contacts/contact-match.service';
import {
  CreateMessageTemplateDto,
  SendMessageDto,
  UpdateMessageTemplateDto,
} from './dto/message.dto';
import { newId } from '../../common/utils/hash';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

type TemplateRow = Awaited<
  ReturnType<PrismaService['messageTemplate']['findFirstOrThrow']>
>;

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
    private readonly matcher: ContactMatchService,
    private readonly audit: OrgAuditService,
  ) {}

  async listTemplates(authUser: AuthUser) {
    const where: Prisma.MessageTemplateWhereInput = {
      organization_id: authUser.organization_id!,
    };
    if (
      authUser.role === 'location_admin' ||
      authUser.role === 'branch_admin' ||
      authUser.role === 'worker'
    ) {
      const orFilters: Prisma.MessageTemplateWhereInput[] = [
        { scope: 'organization' },
      ];
      if (authUser.branch_id) {
        orFilters.push({ scope: 'location', location_id: authUser.branch_id });
      }
      where.OR = orFilters;
    }
    return this.prisma.messageTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplate(authUser: AuthUser, id: string) {
    const t = await this.prisma.messageTemplate.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!t) throw new NotFoundException('Template not found');
    return t;
  }

  async createTemplate(
    authUser: AuthUser,
    dto: CreateMessageTemplateDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    this.assertCanManageTemplates(authUser.role);
    if (dto.scope === 'location' && !dto.location_id) {
      throw new BadRequestException(
        'location_id is required for location-scoped templates',
      );
    }
    const id = `tmpl_${newId('').replace(/-/g, '').slice(0, 16)}`;
    const created = await this.prisma.messageTemplate.create({
      data: {
        id,
        organization_id: authUser.organization_id!,
        scope: dto.scope ?? 'organization',
        location_id: dto.location_id ?? null,
        name: dto.name,
        body: dto.body,
        channel: dto.channel ?? 'sms',
        mode: dto.mode ?? 'flexible',
        variables: (dto.variables ?? undefined) as Prisma.InputJsonValue,
        created_by: authUser.sub,
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: created.location_id,
      entity: 'MessageTemplate',
      entityId: id,
      action: 'create',
      diff: { after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return created;
  }

  async updateTemplate(
    authUser: AuthUser,
    id: string,
    dto: UpdateMessageTemplateDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    this.assertCanManageTemplates(authUser.role);
    const current = await this.prisma.messageTemplate.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!current) throw new NotFoundException('Template not found');

    const updated = await this.prisma.messageTemplate.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        body: dto.body ?? undefined,
        mode: dto.mode ?? undefined,
        scope: dto.scope ?? undefined,
        location_id: dto.location_id ?? undefined,
        variables: (dto.variables ?? undefined) as Prisma.InputJsonValue,
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: updated.location_id,
      entity: 'MessageTemplate',
      entityId: id,
      action: 'update',
      diff: { before: current, after: dto },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return updated;
  }

  async deleteTemplate(
    authUser: AuthUser,
    id: string,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    this.assertCanManageTemplates(authUser.role);
    const current = await this.prisma.messageTemplate.findFirst({
      where: { id, organization_id: authUser.organization_id! },
    });
    if (!current) throw new NotFoundException('Template not found');
    await this.prisma.messageTemplate.delete({ where: { id } });
    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: current.location_id,
      entity: 'MessageTemplate',
      entityId: id,
      action: 'delete',
      diff: { before: current },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });
    return { id, deleted: true };
  }

  async send(
    authUser: AuthUser,
    dto: SendMessageDto,
    req: { ip?: string; headers?: Record<string, string | string[]> },
  ) {
    if (!dto.recipients?.length) {
      throw new BadRequestException('recipients is required');
    }

    let body = dto.body;
    let template: TemplateRow | null = null;
    if (dto.template_id) {
      template = await this.prisma.messageTemplate.findFirst({
        where: {
          id: dto.template_id,
          organization_id: authUser.organization_id!,
        },
      });
      if (!template) {
        throw new NotFoundException('Template not found');
      }
      const vars: Record<string, string> = {
        ...((template.variables as Record<string, string> | null) ?? {}),
        ...(dto.variables ?? {}),
      };
      body = this.substituteVariables(template.body, vars);
      if (template.mode === 'strict' && dto.body && dto.body !== body) {
        throw new BadRequestException(
          'Strict mode does not allow overriding the template body',
        );
      }
    }
    if (!body) {
      throw new BadRequestException('Either template_id or body is required');
    }
    if (body.length > 1600) {
      throw new BadRequestException('Message body exceeds 1600 characters');
    }

    const locationId =
      authUser.branch_id ??
      (template?.scope === 'location' ? template.location_id : null);

    if (
      locationId &&
      authUser.role !== 'organization_admin' &&
      authUser.role !== 'super_admin' &&
      authUser.branch_id !== locationId
    ) {
      throw new ForbiddenException('Cannot send from this location');
    }

    const results: Array<{ phone: string; ok: boolean; error?: string }> = [];
    for (const r of dto.recipients) {
      const phone = this.matcher.normalizePhone(r.phone);
      try {
        await this.sms.send({
          organizationId: authUser.organization_id!,
          locationId: locationId ?? null,
          actorUserId: authUser.sub,
          to: phone,
          body,
          templateId: template?.id ?? null,
        });
        await this.matcher.matchOrCreate({
          organizationId: authUser.organization_id!,
          phone,
          name: r.name,
          locationId: locationId ?? undefined,
          ownerUserId: authUser.role === 'worker' ? authUser.sub : undefined,
          sourceUserId: authUser.sub,
          sourceKind: locationId ? 'branch_qr' : 'worker',
        });
        await this.prisma.contact
          .updateMany({
            where: { organization_id: authUser.organization_id!, phone },
            data: { last_messaged_at: new Date() },
          })
          .catch(() => undefined);
        results.push({ phone, ok: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'send failed';
        results.push({
          phone,
          ok: false,
          error: message,
        });
      }
    }

    await this.audit.log({
      actorId: authUser.sub,
      organizationId: authUser.organization_id!,
      locationId: locationId ?? null,
      entity: 'Message',
      entityId: dto.template_id ?? 'ad-hoc',
      action: 'send',
      diff: {
        recipients: dto.recipients.length,
        sent: results.filter((r) => r.ok).length,
        failed: results.filter((r) => !r.ok).length,
      },
      ip: req?.ip ?? 'unknown',
      ua: (req?.headers?.['user-agent'] as string) ?? 'unknown',
    });

    return {
      total: results.length,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    };
  }

  private substituteVariables(
    body: string,
    vars: Record<string, string>,
  ): string {
    let out = body;
    for (const [k, v] of Object.entries(vars ?? {})) {
      const tokenSquare = new RegExp(`\\[${this.escape(k)}\\]`, 'gi');
      out = out.replace(tokenSquare, v ?? '');
      const tokenCurly = new RegExp(`\\{${this.escape(k)}\\}`, 'gi');
      out = out.replace(tokenCurly, v ?? '');
    }
    return out;
  }

  private escape(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async listHistory(authUser: AuthUser, page: number, pageSize: number) {
    const where: Prisma.SmsAuditLogWhereInput = {
      organization_id: authUser.organization_id!,
    };

    if (authUser.role === 'worker') {
      const contacts = await this.prisma.contact.findMany({
        where: {
          organization_id: authUser.organization_id!,
          owner_user_id: authUser.sub,
        },
        select: { phone: true },
      });
      const phones = contacts.map((c) => c.phone);
      where.to_phone = { in: phones };
    } else if (
      authUser.role === 'location_admin' ||
      authUser.role === 'branch_admin'
    ) {
      if (authUser.branch_id) {
        where.location_id = authUser.branch_id;
      }
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.smsAuditLog.count({ where }),
      this.prisma.smsAuditLog.findMany({
        where,
        orderBy: { at: 'desc' },
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

  private assertCanManageTemplates(role: string | null) {
    const ok = [
      'organization_admin',
      'super_admin',
      'location_admin',
      'branch_admin',
    ].includes(role ?? '');
    if (!ok) {
      throw new ForbiddenException('Cannot manage message templates');
    }
  }
}
