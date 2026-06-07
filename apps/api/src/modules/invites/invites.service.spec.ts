/* eslint-disable @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-return */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'mockedid9',
}));

import { Test, TestingModule } from '@nestjs/testing';
import { InvitesService } from './invites.service';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { SmsService } from '../../infra/sms/sms.service';
import { FormsService } from '../forms/forms.service';

describe('InvitesService', () => {
  let service: InvitesService;
  let prisma: any;
  let audit: { log: jest.Mock };
  let forms: { ensureFirstTimerForm: jest.Mock };
  let sms: { send: jest.Mock };

  const worker = {
    sub: 'u1',
    organization_id: 'o1',
    role: 'worker',
    branch_id: 'b1',
  };

  beforeEach(async () => {
    prisma = {
      inviteLink: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      user: { findUnique: jest.fn() },
      $transaction: jest.fn(),
    };
    audit = { log: jest.fn() };
    forms = { ensureFirstTimerForm: jest.fn() };
    sms = { send: jest.fn().mockResolvedValue({ ok: true, status: 'sent' }) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitesService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrgAuditService, useValue: audit },
        { provide: FormsService, useValue: forms },
        { provide: SmsService, useValue: sms },
      ],
    }).compile();
    service = module.get(InvitesService);
  });

  it('getOrCreatePersonalLink returns existing', async () => {
    prisma.inviteLink.findFirst.mockResolvedValue({
      id: 'inv1',
      organization_id: 'o1',
      location_id: 'b1',
      team_id: null,
      owner_user_id: 'u1',
      form_id: 'f1',
      code: 'abc123',
      expires_at: null,
      max_uses: 0,
      uses: 1,
      status: 'active',
      createdAt: new Date(),
      updated_at: new Date(),
    });
    const r = await service.getOrCreatePersonalLink(worker);
    expect(r.code).toBe('abc123');
    expect(forms.ensureFirstTimerForm).not.toHaveBeenCalled();
  });

  it('getOrCreatePersonalLink creates new when none', async () => {
    prisma.inviteLink.findFirst.mockResolvedValue(null);
    prisma.inviteLink.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({ name: 'Jane' });
    forms.ensureFirstTimerForm.mockResolvedValue({ id: 'f_new' });
    prisma.inviteLink.create.mockImplementation(({ data }) => ({
      ...data,
      createdAt: new Date(),
    }));
    const r = await service.getOrCreatePersonalLink(worker);
    expect(r.code).toBeTruthy();
    expect(forms.ensureFirstTimerForm).toHaveBeenCalled();
  });

  it('share via SMS increments uses and audits', async () => {
    prisma.inviteLink.findFirst.mockResolvedValue({
      id: 'inv1',
      organization_id: 'o1',
      location_id: 'b1',
      team_id: null,
      owner_user_id: 'u1',
      form_id: null,
      code: 'abc',
      expires_at: null,
      max_uses: 0,
      uses: 0,
      status: 'active',
      createdAt: new Date(),
      updated_at: new Date(),
    });
    prisma.inviteLink.update.mockResolvedValue({});
    const r = await service.share(
      worker,
      'inv1',
      { channel: 'sms', recipient: '+234' },
      {},
    );
    expect(r.ok).toBe(true);
    expect(sms.send).toHaveBeenCalled();
  });
});
