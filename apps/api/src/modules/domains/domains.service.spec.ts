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
import { DomainsService } from './domains.service';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';

describe('DomainsService', () => {
  let service: DomainsService;
  let prisma: any;
  let audit: { log: jest.Mock };

  const orgAdmin = {
    sub: 'u1',
    organization_id: 'o1',
    role: 'organization_admin',
  };

  beforeEach(async () => {
    prisma = {
      customDomain: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    audit = { log: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainsService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrgAuditService, useValue: audit },
      ],
    }).compile();
    service = module.get(DomainsService);
  });

  it('create rejects duplicates', async () => {
    prisma.customDomain.findUnique.mockResolvedValue({ id: 'd1' });
    await expect(
      service.create(orgAdmin, { domain: 'forms.acme.org' }, {}),
    ).rejects.toThrow('already registered');
  });

  it('create stores DNS instructions', async () => {
    prisma.customDomain.findUnique.mockResolvedValue(null);
    prisma.customDomain.create.mockImplementation(({ data }) => ({
      id: 'd1',
      ...data,
    }));
    const result = await service.create(
      orgAdmin,
      { domain: 'forms.acme.org' },
      {},
    );
    expect((result.dns_instructions as any).type).toBe('TXT');
    expect(audit.log).toHaveBeenCalled();
  });

  it('verify flips status to active', async () => {
    prisma.customDomain.findFirst.mockResolvedValue({
      id: 'd1',
      status: 'pending',
    });
    prisma.customDomain.update.mockImplementation(({ data }) => ({
      id: 'd1',
      ...data,
    }));
    const result = await service.verify(orgAdmin, 'd1', {});
    expect(result.status).toBe('active');
  });

  it('rejects non-admin create', async () => {
    await expect(
      service.create({ ...orgAdmin, role: 'worker' }, { domain: 'x.com' }, {}),
    ).rejects.toThrow('Only organization admins');
  });
});
