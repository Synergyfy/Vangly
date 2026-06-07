import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import {
  CreateFormDto,
  UpdateFormDto,
  FindFormsQueryDto,
  CloneFormDto,
  FormFieldDto,
  FormFieldType,
} from './dto';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { newId } from '../../common/utils/hash';
import { newPublicId } from '../../common/utils/nanoid';
import {
  paginationFromQuery,
  buildPaginatedResponse,
} from '../../common/utils/paginated';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

const PUBLIC_ID_MAX_ATTEMPTS = 5;

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: OrgAuditService,
  ) {}

  async list(
    organizationId: string,
    locationId: string | null,
    query: FindFormsQueryDto & { scope?: 'org' | 'location' | 'me' },
    actor?: AuthUser,
  ): Promise<{
    data: unknown[];
    meta: { page: number; per_page: number; total: number };
  }> {
    const { page, perPage, offset, limit } = paginationFromQuery(
      query.page,
      query.per_page,
      { maxPerPage: 100 },
    );
    const where: Prisma.FormWhereInput = {
      organization_id: organizationId,
      ...(locationId ? { location_id: locationId } : {}),
      ...(query.team_id ? { team_id: query.team_id } : {}),
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
    if (query.scope === 'me' && actor?.sub) {
      where.created_by = actor.sub;
    }

    const [rows, total] = await Promise.all([
      this.db.form.findMany({
        where,
        orderBy: [{ updated_at: 'desc' }],
        skip: offset,
        take: limit,
      }),
      this.db.form.count({ where }),
    ]);

    return buildPaginatedResponse(
      rows.map((r) => this.decorateForm(r)),
      total,
      page,
      perPage,
    );
  }

  async getById(
    organizationId: string,
    formId: string,
    roleScope: { isSuper: boolean; branchId: string | null },
  ): Promise<unknown> {
    const form = await this.db.form.findFirst({
      where: { id: formId, organization_id: organizationId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Form ${formId} not found.` },
      });
    }
    if (
      !roleScope.isSuper &&
      form.location_id !== roleScope.branchId &&
      form.team_id === 'General'
    ) {
      // branch admin not at form's location: still allowed for own org
    }
    return this.decorateForm(form);
  }

  async create(
    organizationId: string,
    locationId: string,
    dto: CreateFormDto,
    actor: AuthUser,
  ): Promise<unknown> {
    const team = await this.db.team.findFirst({
      where: {
        id: dto.team_id,
        location_id: locationId,
        organization_id: organizationId,
      },
      select: { id: true, name: true },
    });
    if (!team) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'team_id must belong to the location.',
        },
      });
    }
    this.validateFieldShapes(dto.fields);
    const id = newId('frm');
    const publicId = await this.uniquePublicId();
    const created = await this.db.form.create({
      data: {
        id,
        public_id: publicId,
        organization_id: organizationId,
        location_id: locationId,
        team_id: dto.team_id,
        title: dto.title,
        description: dto.description,
        status: 'draft',
        fields: dto.fields as unknown as Prisma.InputJsonValue,
        distribution: (dto.distribution ?? {
          mode: 'public',
        }) as unknown as Prisma.InputJsonValue,
        schema_version: 1,
        created_by: actor.sub,
        createdAt: new Date(),
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: actor.sub,
      organizationId,
      locationId,
      entity: 'form',
      entityId: id,
      action: 'form.create',
      diff: { title: dto.title, team_id: dto.team_id, public_id: publicId },
      ip: '',
      ua: '',
    });
    return this.decorateForm(created);
  }

  async update(
    organizationId: string,
    formId: string,
    dto: UpdateFormDto,
    actor: AuthUser,
  ): Promise<unknown> {
    const form = await this.db.form.findFirst({
      where: { id: formId, organization_id: organizationId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Form ${formId} not found.` },
      });
    }
    if (form.status === 'archived') {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot update an archived form.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const fieldsChanged =
      dto.fields && JSON.stringify(dto.fields) !== JSON.stringify(form.fields);
    if (fieldsChanged && form.status === 'published') {
      const newVersion = form.schema_version + 1;
      await this.db.$transaction(async (tx) => {
        await tx.formVersion.create({
          data: {
            id: newId('fver'),
            form_id: formId,
            schema_version: form.schema_version,
            fields: form.fields as Prisma.InputJsonValue,
            distribution: form.distribution as Prisma.InputJsonValue,
            archived_at: new Date(),
          },
        });
        await tx.form.update({
          where: { id: formId },
          data: {
            fields: dto.fields as unknown as Prisma.InputJsonValue,
            schema_version: newVersion,
            updated_at: new Date(),
          },
        });
      });
    } else if (fieldsChanged) {
      await this.db.form.update({
        where: { id: formId },
        data: {
          fields: dto.fields as unknown as Prisma.InputJsonValue,
          updated_at: new Date(),
        },
      });
    }

    if (dto.title || dto.description || dto.distribution) {
      await this.db.form.update({
        where: { id: formId },
        data: {
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(dto.distribution !== undefined
            ? {
                distribution:
                  dto.distribution as unknown as Prisma.InputJsonValue,
              }
            : {}),
          updated_at: new Date(),
        },
      });
    }

    const updated = await this.db.form.findUnique({ where: { id: formId } });
    await this.audit.log({
      actorId: actor.sub,
      organizationId,
      locationId: form.location_id,
      entity: 'form',
      entityId: formId,
      action: 'form.update',
      diff: { fields_changed: fieldsChanged },
      ip: '',
      ua: '',
    });
    return this.decorateForm(updated!);
  }

  async publish(
    organizationId: string,
    formId: string,
    actor: AuthUser,
  ): Promise<unknown> {
    const form = await this.db.form.findFirst({
      where: { id: formId, organization_id: organizationId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Form ${formId} not found.` },
      });
    }
    if (form.status === 'archived') {
      throw new BadRequestException({
        error: { code: 'VALIDATION_ERROR', message: 'Form is archived.' },
      });
    }
    const fields = (form.fields as unknown as FormFieldDto[]) ?? [];
    if (fields.length === 0) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Form must have at least one field.',
        },
      });
    }
    const updated = await this.db.form.update({
      where: { id: formId },
      data: {
        status: 'published',
        published_at: new Date(),
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: actor.sub,
      organizationId,
      locationId: form.location_id,
      entity: 'form',
      entityId: formId,
      action: 'form.publish',
      diff: {},
      ip: '',
      ua: '',
    });
    return this.decorateForm(updated);
  }

  async archive(
    organizationId: string,
    formId: string,
    actor: AuthUser,
  ): Promise<unknown> {
    const form = await this.db.form.findFirst({
      where: { id: formId, organization_id: organizationId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Form ${formId} not found.` },
      });
    }
    const updated = await this.db.form.update({
      where: { id: formId },
      data: {
        status: 'archived',
        archived_at: new Date(),
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: actor.sub,
      organizationId,
      locationId: form.location_id,
      entity: 'form',
      entityId: formId,
      action: 'form.archive',
      diff: {},
      ip: '',
      ua: '',
    });
    return this.decorateForm(updated);
  }

  async duplicate(
    organizationId: string,
    formId: string,
    actor: AuthUser,
  ): Promise<unknown> {
    const form = await this.db.form.findFirst({
      where: { id: formId, organization_id: organizationId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Form ${formId} not found.` },
      });
    }
    const id = newId('frm');
    const publicId = await this.uniquePublicId();
    const created = await this.db.form.create({
      data: {
        id,
        public_id: publicId,
        organization_id: form.organization_id,
        location_id: form.location_id,
        team_id: form.team_id,
        title: `${form.title} (copy)`,
        description: form.description,
        status: 'draft',
        fields: form.fields as Prisma.InputJsonValue,
        distribution: form.distribution as Prisma.InputJsonValue,
        schema_version: 1,
        created_by: actor.sub,
        createdAt: new Date(),
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: actor.sub,
      organizationId,
      locationId: form.location_id,
      entity: 'form',
      entityId: id,
      action: 'form.duplicate',
      diff: { source: formId },
      ip: '',
      ua: '',
    });
    return this.decorateForm(created);
  }

  async cloneTo(
    organizationId: string,
    formId: string,
    dto: CloneFormDto,
    actor: AuthUser,
  ): Promise<unknown> {
    const form = await this.db.form.findFirst({
      where: { id: formId, organization_id: organizationId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Form ${formId} not found.` },
      });
    }
    const targetTeam = await this.db.team.findFirst({
      where: { id: dto.target_team_id, organization_id: organizationId },
      select: { id: true, location_id: true },
    });
    if (!targetTeam) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'target_team_id must belong to your organization.',
        },
      });
    }
    if (targetTeam.location_id === form.location_id) {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message:
            'target_team_id must be at a different location for cross-location clone.',
        },
      });
    }
    const id = newId('frm');
    const publicId = await this.uniquePublicId();
    const created = await this.db.form.create({
      data: {
        id,
        public_id: publicId,
        organization_id: form.organization_id,
        location_id: targetTeam.location_id,
        team_id: targetTeam.id,
        title: dto.new_title ?? form.title,
        description: form.description,
        status: 'draft',
        fields: form.fields as Prisma.InputJsonValue,
        distribution: form.distribution as Prisma.InputJsonValue,
        schema_version: 1,
        created_by: actor.sub,
        createdAt: new Date(),
        updated_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: actor.sub,
      organizationId,
      locationId: targetTeam.location_id,
      entity: 'form',
      entityId: id,
      action: 'form.clone',
      diff: { source: formId, target_team: targetTeam.id },
      ip: '',
      ua: '',
    });
    return this.decorateForm(created);
  }

  async listVersions(
    organizationId: string,
    formId: string,
  ): Promise<unknown[]> {
    const form = await this.db.form.findFirst({
      where: { id: formId, organization_id: organizationId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Form ${formId} not found.` },
      });
    }
    const rows = await this.db.formVersion.findMany({
      where: { form_id: formId },
      orderBy: [{ schema_version: 'desc' }],
    });
    return rows.map((r) => ({
      id: r.id,
      form_id: r.form_id,
      schema_version: r.schema_version,
      archived_at: r.archived_at.toISOString(),
    }));
  }

  async listResponses(
    organizationId: string,
    formId: string,
    page: number,
    perPage: number,
  ): Promise<{
    data: unknown[];
    meta: { page: number; per_page: number; total: number };
  }> {
    const form = await this.db.form.findFirst({
      where: { id: formId, organization_id: organizationId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Form ${formId} not found.` },
      });
    }
    const { offset, limit } = paginationFromQuery(page, perPage, {
      maxPerPage: 100,
    });
    const [rows, total] = await Promise.all([
      this.db.formResponse.findMany({
        where: { form_id: formId, organization_id: organizationId },
        orderBy: [{ submitted_at: 'desc' }],
        skip: offset,
        take: limit,
      }),
      this.db.formResponse.count({
        where: { form_id: formId, organization_id: organizationId },
      }),
    ]);
    const data = rows.map((r) => ({
      id: r.id,
      form_id: r.form_id,
      form_schema_version: r.form_schema_version,
      submitted_at: r.submitted_at.toISOString(),
      submitted_by: r.submitted_by,
      answers: r.answers,
    }));
    return buildPaginatedResponse(data, total, page, perPage);
  }

  async exportResponsesCsv(
    organizationId: string,
    formId: string,
  ): Promise<string> {
    const form = await this.db.form.findFirst({
      where: { id: formId, organization_id: organizationId },
    });
    if (!form) {
      throw new NotFoundException({
        error: { code: 'NOT_FOUND', message: `Form ${formId} not found.` },
      });
    }
    const fields = (form.fields as unknown as FormFieldDto[]) ?? [];
    const responses = await this.db.formResponse.findMany({
      where: { form_id: formId, organization_id: organizationId },
      orderBy: [{ submitted_at: 'desc' }],
    });
    const header = [
      'submitted_at',
      'submitted_by',
      ...fields.map((f) => f.label),
    ];
    const lines = [header.map(csvEscape).join(',')];
    for (const r of responses) {
      const ans = (r.answers as Record<string, unknown>) ?? {};
      const cells = [r.submitted_at.toISOString(), r.submitted_by ?? ''];
      for (const f of fields) {
        cells.push(stringifyAnswer(ans[f.key]));
      }
      lines.push(cells.map(csvEscape).join(','));
    }
    return lines.join('\n');
  }

  validateSubmission(
    form: { fields: unknown },
    answers: Record<string, unknown>,
  ): Promise<void> {
    return Promise.resolve(this.validateSubmissionSync(form, answers));
  }

  private validateSubmissionSync(
    form: { fields: unknown },
    answers: Record<string, unknown>,
  ): void {
    const fields = (form.fields as FormFieldDto[]) ?? [];
    const seen = new Set<string>();
    for (const f of fields) {
      seen.add(f.key);
      const v = answers[f.key];
      const present = v !== undefined && v !== null && v !== '';
      if (f.required && !present) {
        throw new BadRequestException({
          error: {
            code: 'VALIDATION_ERROR',
            message: `Field "${f.label}" is required.`,
          },
        });
      }
      if (!present) continue;
      if (f.type && !this.validateType(f.type, v)) {
        throw new BadRequestException({
          error: {
            code: 'VALIDATION_ERROR',
            message: `Field "${f.label}" has an invalid value.`,
          },
        });
      }
      if (
        f.type === 'single_choice' ||
        f.type === 'multi_choice' ||
        f.type === 'dropdown'
      ) {
        const allowed = new Set((f.options ?? []).map((o) => o.value));
        if (f.type === 'multi_choice') {
          if (!Array.isArray(v)) {
            throw new BadRequestException({
              error: {
                code: 'VALIDATION_ERROR',
                message: `Field "${f.label}" must be an array.`,
              },
            });
          }
          for (const item of v) {
            if (!allowed.has(String(item))) {
              throw new BadRequestException({
                error: {
                  code: 'VALIDATION_ERROR',
                  message: `Field "${f.label}" has an invalid choice.`,
                },
              });
            }
          }
        } else if (!allowed.has(toStringSafe(v))) {
          throw new BadRequestException({
            error: {
              code: 'VALIDATION_ERROR',
              message: `Field "${f.label}" has an invalid choice.`,
            },
          });
        }
      }
    }
    const extra = Object.keys(answers).filter((k) => !seen.has(k));
    if (extra.length > 0) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: `Unknown fields: ${extra.join(', ')}`,
        },
      });
    }
  }

  private validateType(type: FormFieldType, v: unknown): boolean {
    switch (type) {
      case 'text':
      case 'multiline':
      case 'address':
      case 'signature':
      case 'barcode':
        return typeof v === 'string';
      case 'number':
        return (
          typeof v === 'number' ||
          (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v))
        );
      case 'email':
        return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      case 'phone':
        return typeof v === 'string' && /^\+?[1-9]\d{1,14}$/.test(v);
      case 'rating':
        return typeof v === 'number' && v >= 0 && v <= 5;
      case 'date':
        return typeof v === 'string' && !isNaN(Date.parse(v));
      case 'photo':
        return typeof v === 'string' && /^https?:\/\//.test(v);
      case 'multi_choice':
        return (
          Array.isArray(v) &&
          v.every((x) => typeof x === 'string' || typeof x === 'number')
        );
      case 'single_choice':
      case 'dropdown':
        return typeof v === 'string' || typeof v === 'number';
      default:
        return true;
    }
  }

  private validateFieldShapes(fields: FormFieldDto[]): void {
    if (!Array.isArray(fields) || fields.length === 0) {
      throw new BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'fields must be a non-empty array.',
        },
      });
    }
    const seen = new Set<string>();
    for (const f of fields) {
      if (!f.key) {
        throw new BadRequestException({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'each field must have a key.',
          },
        });
      }
      if (seen.has(f.key)) {
        throw new BadRequestException({
          error: {
            code: 'VALIDATION_ERROR',
            message: `duplicate field key: ${f.key}`,
          },
        });
      }
      seen.add(f.key);
    }
  }

  private decorateForm(row: {
    id: string;
    public_id: string;
    title: string;
    description: string | null;
    status: string;
    fields: unknown;
    distribution: unknown;
    schema_version: number;
    analytics_scans: number;
    analytics_submissions: number;
    team_id: string;
    location_id: string;
    createdAt: Date;
    published_at: Date | null;
    updated_at: Date;
  }): Record<string, unknown> {
    return {
      id: row.id,
      public_id: row.public_id,
      title: row.title,
      description: row.description ?? undefined,
      status: row.status,
      fields: row.fields,
      distribution: row.distribution,
      schema_version: row.schema_version,
      analytics_scans: row.analytics_scans,
      analytics_submissions: row.analytics_submissions,
      team_id: row.team_id,
      location_id: row.location_id,
      created_at: row.createdAt.toISOString(),
      published_at: row.published_at?.toISOString(),
      updated_at: row.updated_at.toISOString(),
      public_url: `https://vangly.app/f/${row.public_id}`,
      qr_payload: `https://vangly.app/f/${row.public_id}`,
    };
  }

  async ensureFirstTimerForm(input: {
    organizationId: string;
    ownerUserId: string;
    name: string;
  }): Promise<{ id: string; public_id: string; public_url: string }> {
    const existing = await this.db.form.findFirst({
      where: {
        organization_id: input.organizationId,
        created_by: input.ownerUserId,
        title: { contains: 'Invite' },
      },
    });
    if (existing) {
      return this.decorateForm(existing) as {
        id: string;
        public_id: string;
        public_url: string;
      };
    }

    const user = await this.db.user.findUnique({
      where: { id: input.ownerUserId },
      select: { branch_id: true, organization_id: true },
    });
    if (!user?.branch_id) {
      throw new Error(
        'Worker has no branch assigned; cannot create first-timer form.',
      );
    }

    const membership = await this.db.teamMembership.findFirst({
      where: { user_id: input.ownerUserId },
      include: { team: true },
      orderBy: { joined_at: 'desc' },
    });
    let team: Awaited<
      ReturnType<DatabaseService['team']['findFirstOrThrow']>
    > | null = membership?.team ?? null;

    if (!team) {
      const found = await this.db.team.findFirst({
        where: {
          organization_id: input.organizationId,
          location_id: user.branch_id,
          name: 'General',
        },
      });
      team = found ?? null;
    }
    if (!team) {
      const teamId = newId('team');
      team = await this.db.team.create({
        data: {
          id: teamId,
          organization_id: input.organizationId,
          location_id: user.branch_id,
          name: 'General',
          description: 'Default team for first-timer forms',
          kind: 'general',
          is_system: true,
          is_public_joinable: true,
          allow_member_pin: false,
          sms_otp_required: false,
          createdAt: new Date(),
          updated_at: new Date(),
        },
      });
      await this.db.teamMembership.create({
        data: {
          id: newId('tm'),
          team_id: teamId,
          user_id: input.ownerUserId,
          is_team_admin: true,
          joined_at: new Date(),
        },
      });
    }

    const id = newId('frm');
    const publicId = await this.uniquePublicId();
    const created = await this.db.form.create({
      data: {
        id,
        public_id: publicId,
        organization_id: input.organizationId,
        location_id: user.branch_id,
        team_id: team.id,
        title: `${input.name} Invite`,
        description:
          'You are warmly invited! Please fill in your details below.',
        status: 'published',
        fields: [
          { key: 'name', label: 'Full name', type: 'text', required: true },
          {
            key: 'phone',
            label: 'Phone number',
            type: 'phone',
            required: true,
          },
          {
            key: 'email',
            label: 'Email (optional)',
            type: 'email',
            required: false,
          },
          {
            key: 'address',
            label: 'Home address',
            type: 'address',
            required: false,
          },
        ],
        distribution: { mode: 'public' },
        schema_version: 1,
        created_by: input.ownerUserId,
        createdAt: new Date(),
        updated_at: new Date(),
        published_at: new Date(),
      },
    });
    await this.audit.log({
      actorId: input.ownerUserId,
      organizationId: input.organizationId,
      locationId: user.branch_id,
      entity: 'form',
      entityId: id,
      action: 'form.auto_create',
      diff: { owner: input.ownerUserId, public_id: publicId },
      ip: '',
      ua: '',
    });
    return this.decorateForm(created) as {
      id: string;
      public_id: string;
      public_url: string;
    };
  }

  private async uniquePublicId(): Promise<string> {
    for (let i = 0; i < PUBLIC_ID_MAX_ATTEMPTS; i++) {
      const candidate = newPublicId();
      const existing = await this.db.form.findUnique({
        where: { public_id: candidate },
        select: { id: true },
      });
      if (!existing) return candidate;
    }
    throw new ConflictException({
      error: {
        code: 'CONFLICT',
        message: 'Could not allocate a unique public_id; please retry.',
      },
    });
  }
}

function csvEscape(v: string): string {
  if (v == null) return '';
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function stringifyAnswer(v: unknown): string {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map((x) => toStringSafe(x)).join('; ');
  if (typeof v === 'object') return JSON.stringify(v);
  return toStringSafe(v);
}

function toStringSafe(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint')
    return String(v);
  return JSON.stringify(v);
}
