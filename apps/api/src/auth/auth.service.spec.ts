import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { envValidationSchema } from '../config/env.validation';

describe('AuthService Integration Tests', () => {
  let service: AuthService;
  let db: DatabaseService;

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
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  beforeEach(async () => {
    await db.auditLog.deleteMany({});
    await db.refreshTokenFamily.deleteMany({});
    await db.onboardingSession.deleteMany({});
    await db.user.deleteMany({});
    await db.location.deleteMany({});
    await db.organization.deleteMany({});

    // Seed superadmin
    await db.seedSuperAdmin();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('should complete onboarding successfully step-by-step', async () => {
    const phone = '+2348012345678';

    // 1. Start onboarding
    const startRes = await service.startOnboarding(phone);
    expect(startRes).toHaveProperty('onboarding_token');
    const obt1 = startRes.onboarding_token;

    // 2. Save Account
    const accountRes = await service.saveAccount(
      obt1,
      'Test Church',
      'Admin User',
      '1234',
    );
    expect(accountRes).toHaveProperty('onboarding_token');
    const obt2 = accountRes.onboarding_token;

    // 4. Save Subdomain
    const subdomainRes = await service.saveSubdomain(obt2, 'test-church-sub');
    expect(subdomainRes.subdomain).toBe('test-church-sub');
    const obt3 = subdomainRes.onboarding_token;

    // 5. Save Brand
    const brandRes = await service.saveBrand(obt3, '#007AFF', 'my_logo.png');
    expect(brandRes.primary_color).toBe('#007AFF');
    const obt4 = brandRes.onboarding_token;

    // 6. Save Location
    const locRes = await service.saveLocation(
      obt4,
      'HQ Location',
      '12 Road',
      'Lagos',
      'Lagos',
      'NG',
    );
    expect(locRes.is_hq).toBe(true);

    // 7. Complete Onboarding
    const completeRes = await service.completeOnboarding(
      obt4,
      '127.0.0.1',
      'JestTest',
    );
    expect(completeRes).toHaveProperty('access_token');
    expect(completeRes).toHaveProperty('refresh_token');
    expect(completeRes.user.role).toBe('organization_admin');
    expect(completeRes.user.credits).toBe(500);

    // Verify DB state
    const usersCount = await db.user.count({ where: { phone } });
    expect(usersCount).toBe(1);

    const orgsCount = await db.organization.count({
      where: { subdomain: 'test-church-sub' },
    });
    expect(orgsCount).toBe(1);
  });

  it('should reject duplicate subdomain and reserved subdomains', async () => {
    const phone = '+2348088888888';
    const startRes = await service.startOnboarding(phone);
    const accountRes = await service.saveAccount(
      startRes.onboarding_token,
      'Church',
      'Admin',
      '1234',
    );

    // Reserved subdomain
    await expect(
      service.saveSubdomain(accountRes.onboarding_token, 'admin'),
    ).rejects.toThrow();

    // Valid subdomain
    const subRes = await service.saveSubdomain(
      accountRes.onboarding_token,
      'test-sub',
    );

    // Pre-create org with same subdomain
    await db.organization.create({
      data: {
        id: 'org_collision',
        name: 'Colliding Org',
        subdomain: 'test-sub',
      },
    });

    // Subdomain collision
    await expect(
      service.saveSubdomain(subRes.onboarding_token, 'test-sub'),
    ).rejects.toThrow();
  });

  it('should handle account locking after 5 failed login attempts', async () => {
    const phone = '+2348000000000'; // Superadmin seeded

    // 4 failed attempts
    for (let i = 0; i < 4; i++) {
      await expect(
        service.login(phone, 'wrong_pin', false, '127.0.0.1', 'Jest'),
      ).rejects.toThrow();
    }

    // Still not locked, but 5th attempt locks it
    await expect(
      service.login(phone, 'wrong_pin', false, '127.0.0.1', 'Jest'),
    ).rejects.toThrow();

    // 6th attempt with correct pin should fail because it is locked
    await expect(
      service.login(phone, '1234', false, '127.0.0.1', 'Jest'),
    ).rejects.toThrow();
  });

  it('should support token refresh rotation and family revoke on reuse', async () => {
    const phone = '+2348000000000';
    const loginRes = await service.login(
      phone,
      '1234',
      false,
      '127.0.0.1',
      'Jest',
    );
    const rt1 = loginRes.refresh_token;

    // 1st refresh: Success
    const refreshRes = await service.refresh(rt1, '127.0.0.1', 'Jest');
    expect(refreshRes).toHaveProperty('access_token');
    expect(refreshRes).toHaveProperty('refresh_token');
    const rt2 = refreshRes.refresh_token;

    // 2nd refresh with rotated token: Success
    const refreshRes2 = await service.refresh(rt2, '127.0.0.1', 'Jest');
    expect(refreshRes2).toHaveProperty('access_token');

    // Reuse old token rt1: Compromise detected, family is revoked
    await expect(service.refresh(rt1, '127.0.0.1', 'Jest')).rejects.toThrow();

    // Rotated token is now also revoked because of family revocation
    await expect(service.refresh(rt2, '127.0.0.1', 'Jest')).rejects.toThrow();
  });

  it('should enforce last 3 PIN history rule on reset-pin', async () => {
    const phone = '+2348000000000';

    // Request reset PIN
    const resetSession = await service.forgotPin(phone);
    const token = resetSession.onboarding_token;

    // Cannot reset to current PIN (1234)
    await expect(
      service.resetPin(token, '1234', '127.0.0.1', 'Jest'),
    ).rejects.toThrow();

    // Reset to new PIN (5555)
    const resetRes = await service.resetPin(token, '5555', '127.0.0.1', 'Jest');
    expect(resetRes.success).toBe(true);

    // Login with new PIN
    const loginRes = await service.login(
      phone,
      '5555',
      false,
      '127.0.0.1',
      'Jest',
    );
    expect(loginRes.user.id).toBeDefined();
  });
});
