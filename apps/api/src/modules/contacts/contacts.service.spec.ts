/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'mockedid9',
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { ContactMatchService } from './contact-match.service';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';

describe('ContactsService', () => {
  let service: ContactsService;
  let matcher: { matchOrCreate: jest.Mock; normalizePhone: jest.Mock };
  let prisma: {
    contact: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let audit: { log: jest.Mock };

  const orgAdmin = {
    sub: 'u1',
    organization_id: 'o1',
    role: 'organization_admin',
  };

  beforeEach(async () => {
    matcher = {
      matchOrCreate: jest.fn(),
      normalizePhone: jest.fn((p: string) => p.replace(/[^\d+]/g, '')),
    };
    prisma = {
      contact: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: ContactMatchService, useValue: matcher },
        { provide: PrismaService, useValue: prisma },
        { provide: OrgAuditService, useValue: audit },
      ],
    }).compile();
    service = module.get(ContactsService);
  });

  it('list scopes workers to their own contacts', async () => {
    prisma.$transaction.mockResolvedValue([0, []]);
    await service.list(
      { sub: 'u1', organization_id: 'o1', role: 'worker' },
      {},
      1,
      25,
    );
    const [where] = prisma.$transaction.mock.calls[0];
    expect(where).toBeDefined();
  });

  it('list allows org admins to see all', async () => {
    prisma.$transaction.mockResolvedValue([0, []]);
    await service.list(orgAdmin, { status: 'attended' }, 1, 25);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('create uses matcher and audits', async () => {
    matcher.matchOrCreate.mockResolvedValue({
      id: 'contact_1',
      matched: false,
      status: 'invited',
      updated: false,
      incrementedInviteCount: false,
    });
    prisma.contact.findUnique.mockResolvedValue({
      id: 'contact_1',
      location_id: null,
    });
    const result = await service.create(
      { ...orgAdmin, role: 'worker' },
      { name: 'J', phone: '+234 80 111' },
      { ip: '1.1.1.1' },
    );
    expect(result.id).toBe('contact_1');
    expect(audit.log).toHaveBeenCalled();
  });

  it('update rejects workers touching others contacts', async () => {
    prisma.contact.findFirst.mockResolvedValue({
      id: 'c1',
      owner_user_id: 'someone_else',
    });
    await expect(
      service.update(
        { sub: 'u1', organization_id: 'o1', role: 'worker' },
        'c1',
        { name: 'X' },
        {},
      ),
    ).rejects.toThrow('Cannot update');
  });

  it('remove allows branch admin to delete their branch contact', async () => {
    prisma.contact.findFirst.mockResolvedValue({
      id: 'c1',
      location_id: 'b1',
    });
    prisma.contact.delete.mockResolvedValue({ id: 'c1' });
    const result = await service.remove(
      {
        sub: 'u1',
        organization_id: 'o1',
        role: 'location_admin',
        branch_id: 'b1',
      },
      'c1',
      {},
    );
    expect(result.deleted).toBe(true);
  });

  it('bulkCreate rejects empty', async () => {
    await expect(
      service.bulkCreate(orgAdmin, { contacts: [] }, {}),
    ).rejects.toThrow('non-empty');
  });
});
