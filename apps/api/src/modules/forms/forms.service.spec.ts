import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'mockedid9',
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { FormsService } from './forms.service';
import { PublicFormsService } from '../public-forms/public-forms.service';
import { SmsService } from '../../infra/sms/sms.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { JobsService } from '../../infra/jobs/jobs.service';
import { DatabaseModule } from '../../database/database.module';
import { DatabaseService } from '../../database/database.service';
import { envValidationSchema } from '../../config/env.validation';
import { hashSecret, newId } from '../../common/utils/hash';

describe('Manage Organization - Forms Flow (integration)', () => {
  let forms: FormsService;
  let publicForms: PublicFormsService;
  let db: DatabaseService;
  let orgId: string;
  let locId: string;
  let userId: string;
  let teamId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          validationSchema: envValidationSchema,
          validationOptions: { abortEarly: false, allowUnknown: true },
        }),
        DatabaseModule,
      ],
      providers: [
        FormsService,
        PublicFormsService,
        SmsService,
        OrgAuditService,
        JobsService,
      ],
    }).compile();

    forms = module.get<FormsService>(FormsService);
    publicForms = module.get<PublicFormsService>(PublicFormsService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  beforeEach(async () => {
    await db.job.deleteMany({});
    await db.smsAuditLog.deleteMany({});
    await db.orgAuditLog.deleteMany({});
    await db.formResponse.deleteMany({});
    await db.formVersion.deleteMany({});
    await db.form.deleteMany({});
    await db.teamMembership.deleteMany({});
    await db.team.deleteMany({});
    await db.auditLog.deleteMany({});
    await db.refreshTokenFamily.deleteMany({});
    await db.onboardingSession.deleteMany({});
    await db.user.deleteMany({});
    await db.location.deleteMany({});
    await db.organization.deleteMany({});

    orgId = newId('org');
    locId = newId('loc');
    userId = newId('usr');
    teamId = newId('team');
    await db.organization.create({
      data: {
        id: orgId,
        name: 'Test Org',
        subdomain: `org-${orgId.slice(-8)}`,
        primary_color: '#000000',
        logo_url: 'https://cdn.harvite.app/logo.png',
        createdAt: new Date(),
      },
    });
    await db.location.create({
      data: {
        id: locId,
        organization_id: orgId,
        name: 'HQ',
        address: '1 Road',
        city: 'Lagos',
        state: 'Lagos',
        country: 'NG',
        is_hq: true,
        sms_credits: 10,
        createdAt: new Date(),
      },
    });
    await db.user.create({
      data: {
        id: userId,
        name: 'Admin',
        phone: '+2348000000000',
        pin_hash: hashSecret('1234'),
        pin_history: [],
        role: 'organization_admin',
        organization_id: orgId,
        branch_id: locId,
        credits: 0,
        createdAt: new Date(),
      },
    });
    await db.team.create({
      data: {
        id: teamId,
        organization_id: orgId,
        location_id: locId,
        name: 'Volunteers',
        createdAt: new Date(),
      },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('creates a draft form, publishes it, submits, and lists responses', async () => {
    const draft = (await forms.create(
      orgId,
      locId,
      {
        title: 'Volunteer sign-up',
        description: 'Sign up for Sunday service',
        team_id: teamId,
        fields: [
          { key: 'name', label: 'Full name', type: 'text', required: true },
          { key: 'email', label: 'Email', type: 'email' },
        ],
        distribution: { mode: 'public' },
      },
      {
        sub: userId,
        role: 'organization_admin',
        organization_id: orgId,
        branch_id: locId,
      },
    )) as Record<string, unknown>;
    expect(draft.status).toBe('draft');
    expect(draft.public_id).toHaveLength(9);
    expect(draft.public_url).toContain(draft.public_id as string);

    const formId = draft.id as string;
    const publicId = draft.public_id as string;

    await expect(publicForms.getForm(publicId, null)).rejects.toThrow();

    const published = (await forms.publish(orgId, formId, {
      sub: userId,
      role: 'organization_admin',
      organization_id: orgId,
      branch_id: locId,
    })) as Record<string, unknown>;
    expect(published.status).toBe('published');
    expect(published.published_at).toBeTruthy();

    const fetched = (await publicForms.getForm(publicId, null)) as Record<
      string,
      unknown
    >;
    expect(fetched.title).toBe('Volunteer sign-up');
    expect(Array.isArray(fetched.fields)).toBe(true);

    const track = (await publicForms.requestScan(publicId, 'r1', {
      ip: '1.1.1.1',
      ua: 'jest',
    })) as Record<string, unknown>;
    expect(track.scan_token).toBeTruthy();

    const submit = (await publicForms.submit(
      publicId,
      { name: 'Jane Doe', email: 'jane@example.com' },
      { ip: '1.1.1.1', ua: 'jest', scanToken: track.scan_token as string },
    )) as Record<string, unknown>;
    expect(submit.response_id).toBeTruthy();
    expect(submit.submitted_at).toBeTruthy();

    const list = (await forms.listResponses(orgId, formId, 1, 50)) as {
      data: unknown[];
      meta: { total: number };
    };
    expect(list.meta.total).toBe(1);
    expect(list.data).toHaveLength(1);

    const csv = await forms.exportResponsesCsv(orgId, formId);
    expect(csv).toContain('Full name');
    expect(csv).toContain('Jane Doe');
  });

  it('rejects submission with missing required fields', async () => {
    const draft = (await forms.create(
      orgId,
      locId,
      {
        title: 'Required test',
        team_id: teamId,
        fields: [{ key: 'name', label: 'Name', type: 'text', required: true }],
        distribution: { mode: 'public' },
      },
      {
        sub: userId,
        role: 'organization_admin',
        organization_id: orgId,
        branch_id: locId,
      },
    )) as Record<string, unknown>;
    await forms.publish(orgId, draft.id as string, {
      sub: userId,
      role: 'organization_admin',
      organization_id: orgId,
      branch_id: locId,
    });

    await expect(
      publicForms.submit(
        draft.public_id as string,
        {},
        { ip: '1.1.1.1', ua: 'jest' },
      ),
    ).rejects.toThrow();
  });

  it('snapshots the prior version on published-form edit (schema_version bump)', async () => {
    const draft = (await forms.create(
      orgId,
      locId,
      {
        title: 'Versioned',
        team_id: teamId,
        fields: [{ key: 'a', label: 'A', type: 'text' }],
        distribution: { mode: 'public' },
      },
      {
        sub: userId,
        role: 'organization_admin',
        organization_id: orgId,
        branch_id: locId,
      },
    )) as Record<string, unknown>;
    const formId = draft.id as string;
    await forms.publish(orgId, formId, {
      sub: userId,
      role: 'organization_admin',
      organization_id: orgId,
      branch_id: locId,
    });

    await forms.update(
      orgId,
      formId,
      {
        fields: [
          { key: 'a', label: 'A renamed', type: 'text' },
          { key: 'b', label: 'B', type: 'text' },
        ],
      },
      {
        sub: userId,
        role: 'organization_admin',
        organization_id: orgId,
        branch_id: locId,
      },
    );
    const updated = await db.form.findUnique({ where: { id: formId } });
    expect(updated!.schema_version).toBe(2);

    const versions = await forms.listVersions(orgId, formId);
    expect(versions).toHaveLength(1);
    expect((versions[0] as Record<string, unknown>).schema_version).toBe(1);
  });

  it('allows an organization admin not pinned to a location to create a form for a team', async () => {
    const draft = (await forms.create(
      orgId,
      null,
      {
        title: 'Org Admin form',
        team_id: teamId,
        fields: [{ key: 'name', label: 'Name', type: 'text' }],
        distribution: { mode: 'public' },
      },
      {
        sub: userId,
        role: 'organization_admin',
        organization_id: orgId,
        branch_id: null,
      },
    )) as Record<string, unknown>;
    expect(draft.status).toBe('draft');
    expect(draft.location_id).toBe(locId);
  });

  it('prevents a location admin from creating forms for a team in a different location', async () => {
    const otherLocId = newId('loc');
    const otherTeamId = newId('team');
    await db.location.create({
      data: {
        id: otherLocId,
        organization_id: orgId,
        name: 'Branch 2',
        address: '2 Road',
        city: 'Lagos',
        state: 'Lagos',
        country: 'NG',
        is_hq: false,
        sms_credits: 5,
        createdAt: new Date(),
      },
    });
    await db.team.create({
      data: {
        id: otherTeamId,
        organization_id: orgId,
        location_id: otherLocId,
        name: 'Operational',
        createdAt: new Date(),
      },
    });

    await expect(
      forms.create(
        orgId,
        otherLocId,
        {
          title: 'Unauthorized Form',
          team_id: otherTeamId,
          fields: [{ key: 'name', label: 'Name', type: 'text' }],
          distribution: { mode: 'public' },
        },
        {
          sub: userId,
          role: 'location_admin',
          organization_id: orgId,
          branch_id: locId,
        },
      ),
    ).rejects.toThrow();
  });

  it('allows an organization admin pinned to a location to create a form for a team in a different location', async () => {
    const otherLocId = newId('loc');
    const otherTeamId = newId('team');
    await db.location.create({
      data: {
        id: otherLocId,
        organization_id: orgId,
        name: 'Branch 2',
        address: '2 Road',
        city: 'Lagos',
        state: 'Lagos',
        country: 'NG',
        is_hq: false,
        sms_credits: 5,
        createdAt: new Date(),
      },
    });
    await db.team.create({
      data: {
        id: otherTeamId,
        organization_id: orgId,
        location_id: otherLocId,
        name: 'Operational',
        createdAt: new Date(),
      },
    });

    const draft = (await forms.create(
      orgId,
      undefined,
      {
        title: 'Org Admin Form in Branch 2',
        team_id: otherTeamId,
        fields: [{ key: 'name', label: 'Name', type: 'text' }],
        distribution: { mode: 'public' },
      },
      {
        sub: userId,
        role: 'organization_admin',
        organization_id: orgId,
        branch_id: locId,
      },
    )) as Record<string, unknown>;

    expect(draft.status).toBe('draft');
    expect(draft.location_id).toBe(otherLocId);
  });
});
