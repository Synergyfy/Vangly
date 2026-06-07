import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'mockedid9',
}));

import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { DatabaseService as PrismaService } from '../../database/database.service';
import { OrgAuditService } from '../../infra/audit/org-audit.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let prisma: {
    organization: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let audit: { log: jest.Mock };

  const adminUser = {
    sub: 'user_admin',
    organization_id: 'org_1',
    role: 'organization_admin',
  };

  beforeEach(async () => {
    prisma = {
      organization: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    audit = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrgAuditService, useValue: audit },
      ],
    }).compile();
    service = module.get(OrganizationsService);
  });

  describe('getMyOrganization', () => {
    it('returns the org when found', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        id: 'org_1',
        name: 'Acme',
        subdomain: 'acme',
        primary_color: '#fff',
        logo_url: null,
        settings: {},
        brand: null,
        createdAt: new Date('2026-01-01'),
      });
      const result = await service.getMyOrganization(adminUser);
      expect(result.id).toBe('org_1');
    });

    it('throws NotFound when org is missing', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);
      await expect(service.getMyOrganization(adminUser)).rejects.toThrow(
        'Organization not found',
      );
    });
  });

  describe('updateMyOrganization', () => {
    it('rejects non-admin users', async () => {
      await expect(
        service.updateMyOrganization(
          { ...adminUser, role: 'worker' },
          { name: 'X' },
          {},
        ),
      ).rejects.toThrow('Only organization admins');
    });

    it('updates and audits', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        name: 'Old',
        primary_color: '#000',
        logo_url: null,
      });
      prisma.organization.findFirst.mockResolvedValue(null);
      prisma.organization.update.mockResolvedValue({
        id: 'org_1',
        name: 'New',
        subdomain: 'new',
        primary_color: '#fff',
        logo_url: null,
        settings: {},
        brand: null,
        createdAt: new Date(),
      });
      const result = await service.updateMyOrganization(
        adminUser,
        { name: 'New' },
        { ip: '1.2.3.4' },
      );
      expect(result.name).toBe('New');
      expect(audit.log).toHaveBeenCalled();
    });

    it('rejects name conflict', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        name: 'Old',
        primary_color: null,
        logo_url: null,
      });
      prisma.organization.findFirst.mockResolvedValue({ id: 'org_other' });
      await expect(
        service.updateMyOrganization(adminUser, { name: 'Acme' }, {}),
      ).rejects.toThrow('Another organization');
    });
  });

  describe('updateMySettings', () => {
    it('strips sensitive keys', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        id: 'org_1',
        settings: {},
      });
      prisma.organization.update.mockResolvedValue({
        settings: { locale: 'en' },
      });
      const result = await service.updateMySettings(
        adminUser,
        {
          settings: { locale: 'en', password: 'leak', token: 'leak' },
        },
        {},
      );
      expect(result.settings).toEqual({ locale: 'en' });
      expect(audit.log).toHaveBeenCalled();
    });
  });
});
