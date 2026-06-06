import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'mockedid9',
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MembersService } from './members.service';
import { SmsService } from '../../infra/sms/sms.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { JobsService } from '../../infra/jobs/jobs.service';
import { DatabaseModule } from '../../database/database.module';
import { DatabaseService } from '../../database/database.service';
import { envValidationSchema } from '../../config/env.validation';
import { hashSecret, newId } from '../../common/utils/hash';

describe('MembersService Integration Tests', () => {
  let members: MembersService;
  let db: DatabaseService;
  let orgId: string;
  let locId: string;
  let teamId: string;
  let adminId: string;

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
      providers: [MembersService, SmsService, OrgAuditService, JobsService],
    }).compile();

    members = module.get<MembersService>(MembersService);
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
    teamId = newId('team');
    adminId = newId('usr');
    await db.organization.create({
      data: {
        id: orgId,
        name: 'Org',
        subdomain: `org-${orgId.slice(-8)}`,
        primary_color: '#000000',
        logo_url: 'https://cdn.vangly.app/logo.png',
        createdAt: new Date(),
      },
    });
    await db.location.create({
      data: {
        id: locId,
        organization_id: orgId,
        name: 'HQ',
        address: 'a',
        city: 'c',
        state: 's',
        country: 'NG',
        is_hq: true,
        sms_credits: 10,
        createdAt: new Date(),
      },
    });
    await db.team.create({
      data: {
        id: teamId,
        organization_id: orgId,
        location_id: locId,
        name: 'Ushers',
        createdAt: new Date(),
      },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('creates a member, lists, and updates', async () => {
    const created = (await members.create(
      orgId,
      locId,
      {
        name: 'Jane',
        phone: '+2348011111111',
        team_ids: [teamId],
        pin: '1234',
      },
      { id: adminId, ip: '1.1.1.1', ua: 'jest' },
    )) as Record<string, unknown>;
    expect(created.name).toBe('Jane');
    expect(created.status).toBe('active');
    expect(created.roles as string[]).toEqual(['Ushers']);

    const list = await members.list(orgId, locId, { page: 1, per_page: 50 });
    expect(list.data.length).toBe(1);

    const updated = (await members.update(
      orgId,
      created.id as string,
      { status: 'inactive' },
      { id: adminId, ip: '1.1.1.1', ua: 'jest' },
    )) as Record<string, unknown>;
    expect(updated.status).toBe('inactive');
  });

  it('rejects creating a member with a phone from another org (409)', async () => {
    const otherOrg = newId('org');
    await db.organization.create({
      data: {
        id: otherOrg,
        name: 'Other',
        subdomain: `other-${otherOrg.slice(-8)}`,
        primary_color: '#000000',
        logo_url: 'https://cdn.vangly.app/logo.png',
        createdAt: new Date(),
      },
    });
    await db.user.create({
      data: {
        id: newId('usr'),
        name: 'Bob',
        phone: '+2348022222222',
        pin_hash: hashSecret('1234'),
        pin_history: [],
        role: 'worker',
        organization_id: otherOrg,
        branch_id: locId,
        credits: 0,
        createdAt: new Date(),
      },
    });

    await expect(
      members.create(
        orgId,
        locId,
        { name: 'Conflict', phone: '+2348022222222', team_ids: [teamId] },
        { id: adminId, ip: '1.1.1.1', ua: 'jest' },
      ),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('enqueues a bulk-import job', async () => {
    const res = await members.bulkImport(
      orgId,
      locId,
      {
        team_id: teamId,
        rows: [
          { name: 'A', phone: '+2348033333333' },
          { name: 'B', phone: '+2348033333334' },
        ],
      },
      { id: adminId, ip: '1.1.1.1', ua: 'jest' },
    );
    expect(res.queued).toBe(2);
    expect(res.job_id).toBeTruthy();

    await new Promise((r) => setTimeout(r, 500));
    const job = await db.job.findUnique({ where: { id: res.job_id } });
    expect(job!.status).toBe('done');
    expect(job!.succeeded).toBe(2);
  });
});
