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
import { UsersService } from './users.service';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { FormsService } from '../forms/forms.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;
  let audit: { log: jest.Mock };
  let forms: { ensureFirstTimerForm: jest.Mock };

  const orgAdmin = {
    sub: 'u_admin',
    organization_id: 'o1',
    role: 'organization_admin',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    audit = { log: jest.fn() };
    forms = { ensureFirstTimerForm: jest.fn().mockResolvedValue(undefined) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrgAuditService, useValue: audit },
        { provide: FormsService, useValue: forms },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('create rejects duplicate phone', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    await expect(
      service.create(
        orgAdmin,
        { name: 'X', phone: '+234801', role: 'worker' },
        {},
      ),
    ).rejects.toThrow('Phone already in use');
  });

  it('create worker auto-creates first-timer form', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => ({
      id: data.id,
      ...data,
    }));
    const r = await service.create(
      orgAdmin,
      { name: 'X', phone: '+234801', role: 'worker' },
      {},
    );
    expect(forms.ensureFirstTimerForm).toHaveBeenCalled();
    expect(r.temporary_pin).toBe('0000');
  });

  it('branch admin cannot create org admin', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.create(
        {
          sub: 'u1',
          organization_id: 'o1',
          role: 'location_admin',
          branch_id: 'b1',
        },
        { name: 'X', phone: '+234801', role: 'organization_admin' },
        {},
      ),
    ).rejects.toThrow('Cannot create users');
  });

  it('remove blocks self', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: orgAdmin.sub });
    await expect(service.remove(orgAdmin, orgAdmin.sub, {})).rejects.toThrow(
      'cannot delete your own account',
    );
  });
});
