import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { hashSecret, newId } from '../common/utils/hash';
import {
  isValidPinFormat,
  validatePinPolicy,
} from '../common/utils/pin-policy';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTtl: string;
  private readonly refreshTtlDays: number;

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {
    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    if (!accessSecret || accessSecret.length < 32) {
      throw new Error('JWT_ACCESS_SECRET must be set and >= 32 chars');
    }
    if (!refreshSecret || refreshSecret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be set and >= 32 chars');
    }
    this.jwtSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    this.accessTtl = this.config.get<string>('JWT_ACCESS_TTL') ?? '15m';
    this.refreshTtlDays = this.config.get<number>('JWT_REFRESH_TTL_DAYS') ?? 7;
  }

  private generateId(prefix: string): string {
    return newId(prefix);
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  }

  private hash(value: string): string {
    return hashSecret(value);
  }

  // --- Onboarding Logic ---

  async startOnboarding(phone: string) {
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid phone number format. Must be E.164.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUser = await this.db.user.findUnique({
      where: { phone },
    });
    if (existingUser) {
      throw new HttpException(
        {
          error: {
            code: 'PHONE_ALREADY_REGISTERED',
            message: 'Phone number already registered.',
          },
        },
        HttpStatus.CONFLICT,
      );
    }

    const onboardingId = this.generateId('ob');
    const token = this.generateId('obt');
    const tokenExpires = new Date();
    tokenExpires.setMinutes(tokenExpires.getMinutes() + 15); // 15 min

    await this.db.onboardingSession.create({
      data: {
        id: onboardingId,
        phone,
        verified: true,
        onboarding_token: token,
        onboarding_token_expires_at: tokenExpires,
        step: 'ACCOUNT_PENDING',
        createdAt: new Date(),
      },
    });

    return {
      onboarding_token: token,
    };
  }

  private async verifyOnboardingToken(token: string) {
    const session = await this.db.onboardingSession.findUnique({
      where: { onboarding_token: token },
    });
    if (!session) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Invalid onboarding token.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (
      session.onboarding_token_expires_at &&
      session.onboarding_token_expires_at < new Date()
    ) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Onboarding token expired.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return session;
  }

  async saveAccount(
    token: string,
    orgName: string,
    adminName: string,
    pin: string,
  ) {
    const session = await this.verifyOnboardingToken(token);

    if (!isValidPinFormat(pin)) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'PIN must be 4 to 6 digits.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const newToken = this.generateId('obt');
    const tokenExpires = new Date();
    tokenExpires.setMinutes(tokenExpires.getMinutes() + 15);

    await this.db.onboardingSession.update({
      where: { id: session.id },
      data: {
        organization_name: orgName,
        admin_name: adminName,
        pin,
        step: 'SUBDOMAIN_PENDING',
        onboarding_token: newToken,
        onboarding_token_expires_at: tokenExpires,
      },
    });

    return {
      organization_id: this.generateId('org'),
      admin_user_id: this.generateId('usr'),
      onboarding_token: newToken,
    };
  }

  async saveSubdomain(token: string, subdomain: string) {
    const session = await this.verifyOnboardingToken(token);

    if (!subdomain || !/^[a-z0-9-]{3,30}$/.test(subdomain)) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'Subdomain must be 3-30 alphanumeric characters or hyphens.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const reserved = ['admin', 'www', 'mail', 'api', 'app', 'vangly'];
    if (reserved.includes(subdomain.toLowerCase())) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'This subdomain is reserved.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const collision = await this.db.organization.findUnique({
      where: { subdomain },
    });
    if (collision) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Subdomain is already taken.',
          },
        },
        HttpStatus.CONFLICT,
      );
    }

    const newToken = this.generateId('obt');
    const tokenExpires = new Date();
    tokenExpires.setMinutes(tokenExpires.getMinutes() + 15);

    await this.db.onboardingSession.update({
      where: { id: session.id },
      data: {
        subdomain,
        step: 'BRAND_PENDING',
        onboarding_token: newToken,
        onboarding_token_expires_at: tokenExpires,
      },
    });

    return {
      subdomain,
      url: `https://${subdomain}.vangly.app`,
      onboarding_token: newToken,
    };
  }

  async saveBrand(
    token: string,
    primaryColor: string,
    logoFilename: string | undefined,
  ) {
    const session = await this.verifyOnboardingToken(token);

    if (primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Primary color must be a valid hex color.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const orgId = this.generateId('org');
    const logoUrl = logoFilename
      ? `https://cdn.vangly.app/${orgId}/${logoFilename}`
      : `https://cdn.vangly.app/${orgId}/logo.png`;

    const newToken = this.generateId('obt');
    const tokenExpires = new Date();
    tokenExpires.setMinutes(tokenExpires.getMinutes() + 15);

    await this.db.onboardingSession.update({
      where: { id: session.id },
      data: {
        primary_color: primaryColor,
        logo_url: logoUrl,
        step: 'LOCATION_PENDING',
        onboarding_token: newToken,
        onboarding_token_expires_at: tokenExpires,
      },
    });

    return {
      logo_url: logoUrl,
      primary_color: primaryColor,
      onboarding_token: newToken,
    };
  }

  async saveLocation(
    token: string,
    name: string,
    address: string,
    city: string,
    state: string,
    country: string,
  ) {
    const session = await this.verifyOnboardingToken(token);

    if (!name || !address || !city || !state || !country) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'All fields (name, address, city, state, country) are required.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.db.onboardingSession.update({
      where: { id: session.id },
      data: {
        location_name: name,
        address,
        city,
        state,
        country,
        step: 'COMPLETE',
      },
    });

    return {
      location_id: this.generateId('loc'),
      is_hq: true,
    };
  }

  async completeOnboarding(token: string, ip: string, ua: string) {
    const session = await this.verifyOnboardingToken(token);

    if (session.step !== 'COMPLETE') {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Onboarding is not yet in complete state.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const orgId = this.generateId('org');
    const locId = this.generateId('loc');
    const userId = this.generateId('usr');
    const pinHash = this.hash(session.pin || '1234');

    const result = await this.db.$transaction(async (tx) => {
      // 1. Create Organization
      await tx.organization.create({
        data: {
          id: orgId,
          name: session.organization_name || 'My Organization',
          subdomain: session.subdomain || `org-${orgId}`,
          primary_color: session.primary_color,
          logo_url: session.logo_url,
          createdAt: new Date(),
        },
      });

      // 2. Create Location (HQ)
      await tx.location.create({
        data: {
          id: locId,
          organization_id: orgId,
          name: session.location_name || 'Headquarters',
          address: session.address || '',
          city: session.city || '',
          state: session.state || '',
          country: session.country || 'NG',
          is_hq: true,
          createdAt: new Date(),
        },
      });

      // 3. Create User (Admin)
      const user = await tx.user.create({
        data: {
          id: userId,
          name: session.admin_name || 'Admin User',
          phone: session.phone,
          pin_hash: pinHash,
          pin_history: [pinHash],
          role: 'organization_admin',
          organization_id: orgId,
          branch_id: locId,
          credits: 500,
          failed_attempts: 0,
          locked_until: null,
          suspended: false,
          createdAt: new Date(),
        },
      });

      // 4. Delete OnboardingSession
      await tx.onboardingSession.delete({
        where: { id: session.id },
      });

      return user;
    });

    // Audit Log
    await this.audit(userId, ip, ua, 'ONBOARDING_COMPLETE', {
      organization_id: orgId,
      location_id: locId,
    });

    // Issue Session
    return this.issueSession(result, false, ip, ua);
  }

  // --- Session & JWT Utilities ---

  private async issueSession(
    user: User,
    remember: boolean,
    ip: string,
    ua: string,
  ) {
    const access_token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        organization_id: user.organization_id,
        branch_id: user.branch_id,
      },
      this.jwtSecret,
      { expiresIn: this.accessTtl as jwt.SignOptions['expiresIn'] },
    );

    const familyId = this.generateId('fam');
    const tokenId = this.generateId('tok');
    const refreshTTL = remember
      ? 30 * 24 * 3600
      : this.refreshTtlDays * 24 * 3600;
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshTTL);

    const refresh_token = jwt.sign(
      { sub: user.id, familyId, tokenId },
      this.refreshSecret,
      { expiresIn: refreshTTL },
    );

    await this.db.refreshTokenFamily.create({
      data: {
        id: tokenId,
        user_id: user.id,
        family_id: familyId,
        token_hash: this.hash(refresh_token),
        is_revoked: false,
        expires_at: expiresAt,
      },
    });

    await this.audit(user.id, ip, ua, 'LOGIN_SUCCESS', {
      family_id: familyId,
      token_id: tokenId,
    });

    return {
      access_token,
      refresh_token,
      expires_in: 900,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        organization_id: user.organization_id,
        branch_id: user.branch_id,
        credits: user.credits,
      },
    };
  }

  // --- Login Logic ---

  async login(
    phone: string,
    pin: string,
    remember = false,
    ip: string,
    ua: string,
  ) {
    const user = await this.db.user.findUnique({
      where: { phone },
    });
    if (!user) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Invalid credentials.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.suspended) {
      throw new HttpException(
        {
          error: {
            code: 'ACCOUNT_SUSPENDED',
            message: 'Account suspended / pending payment.',
          },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (user.locked_until && user.locked_until > new Date()) {
      throw new HttpException(
        {
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account locked. Try again later.',
          },
        },
        HttpStatus.LOCKED,
      );
    }

    const pinHash = this.hash(pin);
    if (user.pin_hash !== pinHash) {
      const failedAttempts = user.failed_attempts + 1;
      let lockedUntil: Date | null = null;
      if (failedAttempts >= 5) {
        lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + 10);
      }

      await this.db.user.update({
        where: { id: user.id },
        data: {
          failed_attempts: failedAttempts >= 5 ? 0 : failedAttempts,
          locked_until: lockedUntil,
        },
      });

      if (failedAttempts >= 5) {
        await this.audit(user.id, ip, ua, 'LOGIN_LOCKED', {});
        throw new HttpException(
          {
            error: {
              code: 'ACCOUNT_LOCKED',
              message: 'Account locked due to too many failed attempts.',
            },
          },
          HttpStatus.LOCKED,
        );
      }

      await this.audit(user.id, ip, ua, 'LOGIN_FAIL', {
        attempts: failedAttempts,
      });
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Invalid credentials.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Reset failure counter
    await this.db.user.update({
      where: { id: user.id },
      data: {
        failed_attempts: 0,
        locked_until: null,
      },
    });

    return this.issueSession(user, remember, ip, ua);
  }

  // --- Refresh Token Logic ---

  async refresh(refreshTokenStr: string, ip: string, ua: string) {
    let payload: { sub: string; familyId: string; tokenId: string };
    try {
      payload = jwt.verify(refreshTokenStr, this.refreshSecret) as {
        sub: string;
        familyId: string;
        tokenId: string;
      };
    } catch {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Invalid or expired refresh token.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { sub: userId, familyId, tokenId } = payload;

    const tokenRecord = await this.db.refreshTokenFamily.findUnique({
      where: { id: tokenId },
    });

    if (!tokenRecord) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Refresh token not recognized.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Reuse Detection
    if (tokenRecord.is_revoked) {
      await this.db.refreshTokenFamily.updateMany({
        where: { family_id: familyId },
        data: { is_revoked: true },
      });

      await this.audit(userId, ip, ua, 'REFRESH_REUSE_DETECTED', {
        family_id: familyId,
        token_id: tokenId,
      });

      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Compromised session. Please re-authenticate.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (tokenRecord.expires_at < new Date()) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Refresh token expired.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Consume token
    await this.db.refreshTokenFamily.update({
      where: { id: tokenId },
      data: { is_revoked: true },
    });

    const user = await this.db.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.suspended) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'User not found or suspended.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const access_token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        organization_id: user.organization_id,
        branch_id: user.branch_id,
      },
      this.jwtSecret,
      { expiresIn: this.accessTtl as jwt.SignOptions['expiresIn'] },
    );

    const newTokenId = this.generateId('tok');
    const newRefreshToken = jwt.sign(
      { sub: user.id, familyId, tokenId: newTokenId },
      this.refreshSecret,
      {
        expiresIn: Math.floor(
          (tokenRecord.expires_at.getTime() - Date.now()) / 1000,
        ),
      },
    );

    await this.db.refreshTokenFamily.create({
      data: {
        id: newTokenId,
        user_id: user.id,
        family_id: familyId,
        token_hash: this.hash(newRefreshToken),
        is_revoked: false,
        expires_at: tokenRecord.expires_at,
      },
    });

    return {
      access_token,
      refresh_token: newRefreshToken,
      expires_in: 900,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        organization_id: user.organization_id,
        branch_id: user.branch_id,
        credits: user.credits,
      },
    };
  }

  // --- Logout Logic ---

  async logout(
    refreshTokenStr: string | undefined,
    everywhere: boolean,
    user: { sub: string } | undefined,
    ip: string,
    ua: string,
  ) {
    if (everywhere && user) {
      await this.db.refreshTokenFamily.updateMany({
        where: { user_id: user.sub },
        data: { is_revoked: true },
      });

      await this.audit(user.sub, ip, ua, 'LOGOUT_EVERYWHERE', {});
      return;
    }

    if (refreshTokenStr) {
      let payload: { sub: string; familyId: string };
      try {
        payload = jwt.verify(refreshTokenStr, this.refreshSecret) as {
          sub: string;
          familyId: string;
        };
        const { familyId } = payload;

        await this.db.refreshTokenFamily.updateMany({
          where: { family_id: familyId },
          data: { is_revoked: true },
        });

        await this.audit(payload.sub, ip, ua, 'LOGOUT_FAMILY', {
          family_id: familyId,
        });
      } catch {
        // ignore
      }
    }
  }

  // --- PIN Reset Logic ---

  async forgotPin(phone: string) {
    const user = await this.db.user.findUnique({
      where: { phone },
    });
    if (!user) {
      return { onboarding_token: this.generateId('obt') };
    }

    const onboardingId = this.generateId('ob_reset');
    const token = this.generateId('obt');
    const tokenExpires = new Date();
    tokenExpires.setMinutes(tokenExpires.getMinutes() + 15);

    await this.db.onboardingSession.create({
      data: {
        id: onboardingId,
        phone,
        verified: true,
        onboarding_token: token,
        onboarding_token_expires_at: tokenExpires,
        step: 'ACCOUNT_PENDING',
        createdAt: new Date(),
      },
    });

    return {
      onboarding_token: token,
    };
  }

  async resetPin(
    onboardingToken: string,
    newPin: string,
    ip: string,
    ua: string,
  ) {
    const session = await this.verifyOnboardingToken(onboardingToken);

    const user = await this.db.user.findUnique({
      where: { phone: session.phone },
    });
    if (!user) {
      throw new HttpException(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'User not found.',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!isValidPinFormat(newPin)) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'PIN must be 4 to 6 digits.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { pinHash: newHash, newHistory } = validatePinPolicy(
      { pin_hash: user.pin_hash, pin_history: user.pin_history },
      newPin,
    );

    await this.db.user.update({
      where: { id: user.id },
      data: {
        pin_hash: newHash,
        pin_history: newHistory,
        failed_attempts: 0,
        locked_until: null,
      },
    });

    await this.db.onboardingSession.delete({
      where: { id: session.id },
    });

    await this.audit(user.id, ip, ua, 'PIN_RESET', {});

    return { success: true };
  }

  // --- Audit Utility ---

  async audit(
    userId: string | null,
    ip: string,
    ua: string,
    event: string,
    metadata: Record<string, any>,
  ) {
    await this.db.auditLog.create({
      data: {
        id: this.generateId('aud'),
        user_id: userId,
        ip,
        ua,
        event,
        metadata: metadata,
        createdAt: new Date(),
      },
    });
  }

  verifyAccessToken(token: string): Record<string, any> | null {
    try {
      return jwt.verify(token, this.jwtSecret) as Record<string, any>;
    } catch {
      return null;
    }
  }

  async setupPin(
    userId: string,
    newPin: string,
    currentPin: string | undefined,
    ip: string,
    ua: string,
  ) {
    if (!isValidPinFormat(newPin)) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'PIN must be 4 to 6 digits.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        {
          error: { code: 'NOT_FOUND', message: 'User not found.' },
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (currentPin !== undefined) {
      const currentHash = this.hash(currentPin);
      if (currentHash !== user.pin_hash) {
        throw new HttpException(
          {
            error: {
              code: 'UNAUTHENTICATED',
              message: 'Current PIN is incorrect.',
            },
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
    const newHash = this.hash(newPin);
    if (user.pin_history?.includes(newHash)) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'New PIN must be different from your last PINs.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const newHistory = [newHash, ...(user.pin_history ?? [])].slice(0, 5);
    await this.db.user.update({
      where: { id: userId },
      data: {
        pin_hash: newHash,
        pin_history: newHistory,
        failed_attempts: 0,
        locked_until: null,
      },
    });
    await this.audit(userId, ip, ua, 'PIN_SETUP', {});
    return { success: true };
  }

  async updateMe(
    userId: string,
    patch: { name?: string; email?: string },
    ip: string,
    ua: string,
  ) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        {
          error: { code: 'NOT_FOUND', message: 'User not found.' },
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (patch.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(patch.email)) {
      throw new HttpException(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email address.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const updated = await this.db.user.update({
      where: { id: userId },
      data: {
        name: patch.name ?? undefined,
        email: patch.email ?? undefined,
      },
    });
    await this.audit(userId, ip, ua, 'PROFILE_UPDATE', { patch });
    return {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      role: updated.role,
      organization_id: updated.organization_id,
      branch_id: updated.branch_id,
      credits: updated.credits,
    };
  }
}
