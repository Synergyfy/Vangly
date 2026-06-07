/* eslint-disable @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-member-access */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'mockedid9',
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { DatabaseService as PrismaService } from '../../database/database.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      team: { count: jest.fn(), findMany: jest.fn() },
      form: { count: jest.fn() },
      smsAuditLog: { count: jest.fn() },
      contact: { groupBy: jest.fn(), findMany: jest.fn() },
      user: { count: jest.fn(), findMany: jest.fn() },
      orgAuditLog: { findMany: jest.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AnalyticsService);
  });

  it('getOrgAnalytics aggregates cards', async () => {
    prisma.team.count.mockResolvedValue(3);
    prisma.form.count.mockResolvedValue(5);
    prisma.smsAuditLog.count.mockResolvedValue(8);
    prisma.contact.groupBy.mockResolvedValue([
      { status: 'invited', _count: { _all: 10 } },
      { status: 'attended', _count: { _all: 4 } },
    ]);
    prisma.team.findMany.mockResolvedValue([{ id: 't1' }, { id: 't2' }]);
    prisma.user.count.mockResolvedValue(12);
    prisma.contact.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);
    prisma.orgAuditLog.findMany.mockResolvedValue([]);

    const result = await service.getOrgAnalytics({
      organizationId: 'o1',
    });
    expect(result.cards.total_teams).toBe(3);
    expect(result.cards.total_submissions).toBe(14);
    expect(result.cards.sms_credits_used).toBe(8);
    expect(result.growth.points).toHaveLength(30);
  });
});
