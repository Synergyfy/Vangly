/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-argument */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'mockedid9',
}));

import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { SmsService } from '../../infra/sms/sms.service';
import { ContactMatchService } from '../contacts/contact-match.service';

describe('MessagesService', () => {
  let service: MessagesService;
  let prisma: { messageTemplate: any; contact: any };
  let sms: { send: jest.Mock };
  let matcher: { normalizePhone: jest.Mock; matchOrCreate: jest.Mock };
  let audit: { log: jest.Mock };

  const orgAdmin = {
    sub: 'u1',
    organization_id: 'o1',
    role: 'organization_admin',
  };

  beforeEach(async () => {
    prisma = {
      messageTemplate: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      contact: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    };
    sms = {
      send: jest
        .fn()
        .mockResolvedValue({ ok: true, status: 'sent', logId: 'sms_x' }),
    };
    matcher = {
      normalizePhone: jest.fn((p: string) => p.replace(/[^\d+]/g, '')),
      matchOrCreate: jest.fn().mockResolvedValue({
        id: 'contact_1',
        matched: false,
        status: 'invited',
        updated: false,
        incrementedInviteCount: false,
      }),
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrgAuditService, useValue: audit },
        { provide: SmsService, useValue: sms },
        { provide: ContactMatchService, useValue: matcher },
      ],
    }).compile();
    service = module.get(MessagesService);
  });

  it('substitutes variables and sends', async () => {
    prisma.messageTemplate.findFirst.mockResolvedValue({
      id: 't1',
      organization_id: 'o1',
      body: 'Hi [Name] from [Church Name]',
      mode: 'flexible',
      scope: 'organization',
      variables: { name: '[Name]', church: '[Church Name]' },
    });
    const result = await service.send(
      orgAdmin,
      {
        template_id: 't1',
        variables: { name: 'Jane' },
        recipients: [{ phone: '+234801111' }],
      },
      {},
    );
    expect(result.sent).toBe(1);
    expect(sms.send).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Hi Jane from [Church Name]',
        templateId: 't1',
      }),
    );
  });

  it('rejects strict mode override', async () => {
    prisma.messageTemplate.findFirst.mockResolvedValue({
      id: 't1',
      organization_id: 'o1',
      body: 'Hi [Name]',
      mode: 'strict',
      variables: {},
    });
    await expect(
      service.send(
        orgAdmin,
        {
          template_id: 't1',
          body: 'OVERRIDE',
          recipients: [{ phone: '+234' }],
        },
        {},
      ),
    ).rejects.toThrow('Strict mode');
  });

  it('rejects without template or body', async () => {
    await expect(
      service.send(orgAdmin, { recipients: [{ phone: '+234' }] } as any, {}),
    ).rejects.toThrow('required');
  });
});
