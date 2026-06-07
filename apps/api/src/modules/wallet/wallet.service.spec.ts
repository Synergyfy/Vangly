/* eslint-disable @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-member-access */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'mockedid9',
}));

import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';
import { JobsService } from '../../infra/jobs/jobs.service';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: {
    user: any;
    location: any;
    walletTransaction: any;
    $transaction: any;
  };
  let jobs: { enqueue: jest.Mock };
  let audit: { log: jest.Mock };

  const orgAdmin = {
    sub: 'u1',
    organization_id: 'o1',
    role: 'organization_admin',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      location: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      walletTransaction: {
        count: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        createMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    jobs = { enqueue: jest.fn().mockResolvedValue({ jobId: 'job_1' }) };
    audit = { log: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrgAuditService, useValue: audit },
        { provide: JobsService, useValue: jobs },
      ],
    }).compile();
    service = module.get(WalletService);
  });

  it('getBalance for org_admin returns sum of location credits', async () => {
    prisma.location.findMany.mockResolvedValue([
      { id: 'l1', sms_credits: 50 },
      { id: 'l2', sms_credits: 25 },
    ]);
    const b = await service.getBalance(orgAdmin);
    expect(b.balance).toBe(75);
  });

  it('getBalance for worker returns personal credits', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', credits: 12 });
    const b = await service.getBalance({ ...orgAdmin, role: 'worker' });
    expect(b.balance).toBe(12);
  });

  it('topup location credits', async () => {
    prisma.location.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.location.update.mockResolvedValue({ sms_credits: 100 });
    prisma.walletTransaction.create.mockResolvedValue({ id: 'wtx_1' });
    const tx = await service.topup(
      orgAdmin,
      { amount: 100, owner_type: 'location', location_id: 'l1' },
      {},
    );
    expect(tx.id).toBe('wtx_1');
  });

  it('topup rejects non-admin workers on location wallet', async () => {
    await expect(
      service.topup(
        { ...orgAdmin, role: 'worker' },
        { amount: 10, owner_type: 'location', location_id: 'l1' },
        {},
      ),
    ).rejects.toThrow('Only organization admins');
  });

  it('purchaseSms rejects insufficient personal credits', async () => {
    prisma.location.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.user.findUnique.mockResolvedValue({ credits: 0 });
    await expect(
      service.purchaseSms(orgAdmin, { sms_count: 10, location_id: 'l1' }, {}),
    ).rejects.toThrow('Insufficient');
  });

  it('listTransactions scopes workers to themselves', async () => {
    prisma.$transaction.mockResolvedValue([0, []]);
    await service.listTransactions({ ...orgAdmin, role: 'worker' }, 1, 50);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
