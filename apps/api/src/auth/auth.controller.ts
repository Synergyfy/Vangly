import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  Patch,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  HttpException,
} from '@nestjs/common';
import * as express from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import {
  OnboardingStartDto,
  OnboardingAccountDto,
  OnboardingSubdomainDto,
  OnboardingBrandDto,
  OnboardingLocationDto,
  LoginDto,
  ForgotPinDto,
  ResetPinDto,
  SetupPinDto,
  UpdateMeDto,
} from './dto';
import { UserEntity } from './entities/user.entity';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from './roles.guard';
import { ConfigService } from '@nestjs/config';

interface MulterFile {
  mimetype: string;
  size: number;
  originalname: string;
}

interface AuthenticatedRequest extends express.Request {
  user?: AuthUser;
}

/** Cookie names used for httpOnly token storage */
const COOKIE_ACCESS = 'harvite_access';
const COOKIE_REFRESH = 'harvite_refresh';

@Controller('api/auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  private readonly isProd: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {
    this.isProd = this.config.get<string>('NODE_ENV') === 'production';
  }

  private getIpAndUa(req: express.Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return { ip, ua };
  }

  /**
   * Sets httpOnly auth cookies on the response.
   * accessTtlSec  — lifetime of the access cookie (seconds)
   * refreshTtlSec — lifetime of the refresh cookie (seconds)
   */
  private setAuthCookies(
    res: express.Response,
    accessToken: string,
    refreshToken: string,
    accessTtlSec: number,
    refreshTtlSec: number,
  ): void {
    const base = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: this.isProd,
      path: '/',
    };
    res.cookie(COOKIE_ACCESS, accessToken, {
      ...base,
      maxAge: accessTtlSec * 1000,
    });
    res.cookie(COOKIE_REFRESH, refreshToken, {
      ...base,
      maxAge: refreshTtlSec * 1000,
    });
  }

  /** Clears both auth cookies. */
  private clearAuthCookies(res: express.Response): void {
    const base = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: this.isProd,
      path: '/',
    };
    res.clearCookie(COOKIE_ACCESS, base);
    res.clearCookie(COOKIE_REFRESH, base);
  }

  // --- Onboarding Endpoints ---

  @Post('onboarding/start')
  @HttpCode(HttpStatus.OK)
  async startOnboarding(@Body() body: OnboardingStartDto) {
    return this.authService.startOnboarding(body.phone);
  }

  @Post('onboarding/account')
  @HttpCode(HttpStatus.OK)
  async saveAccount(@Body() body: OnboardingAccountDto) {
    return this.authService.saveAccount(
      body.onboarding_token,
      body.organization_name,
      body.admin_name,
      body.pin,
    );
  }

  @Post('onboarding/subdomain')
  @HttpCode(HttpStatus.OK)
  async saveSubdomain(@Body() body: OnboardingSubdomainDto) {
    return this.authService.saveSubdomain(
      body.onboarding_token,
      body.subdomain,
    );
  }

  @Post('onboarding/brand')
  @UseInterceptors(FileInterceptor('logo'))
  @HttpCode(HttpStatus.OK)
  async saveBrand(
    @Body() body: OnboardingBrandDto,
    @UploadedFile() file?: MulterFile,
  ) {
    if (file) {
      const allowedMimeTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/svg+xml',
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid file type. Only PNG, JPG, and SVG are allowed.',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (file.size > 1024 * 1024) {
        throw new HttpException(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'File size exceeds 1 MB limit.',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return this.authService.saveBrand(
      body.onboarding_token,
      body.primary_color,
      file ? file.originalname : undefined,
    );
  }

  @Post('onboarding/location')
  @HttpCode(HttpStatus.OK)
  async saveLocation(@Body() body: OnboardingLocationDto) {
    return this.authService.saveLocation(
      body.onboarding_token,
      body.name,
      body.address,
      body.city,
      body.state,
      body.country,
    );
  }

  @Post('onboarding/complete')
  @HttpCode(HttpStatus.OK)
  async completeOnboarding(
    @Body() body: { onboarding_token: string },
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { ip, ua } = this.getIpAndUa(req);
    const result = await this.authService.completeOnboarding(
      body.onboarding_token,
      ip,
      ua,
    );

    const refreshTtlSec = (this.config.get<number>('JWT_REFRESH_TTL_DAYS') ?? 7) * 86400;
    this.setAuthCookies(res, result.access_token, result.refresh_token, 900, refreshTtlSec);

    return {
      user: UserEntity.fromUser(result.user),
    };
  }

  // --- Login Endpoints ---

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { ip, ua } = this.getIpAndUa(req);
    const result = await this.authService.login(
      body.phone,
      body.pin,
      body.remember || false,
      ip,
      ua,
    );

    // remember=true → 30 days, else default refresh TTL
    const refreshTtlSec = body.remember
      ? 30 * 86400
      : (this.config.get<number>('JWT_REFRESH_TTL_DAYS') ?? 7) * 86400;

    this.setAuthCookies(res, result.access_token, result.refresh_token, 900, refreshTtlSec);

    // Return only the user — raw tokens stay in httpOnly cookies
    return {
      user: UserEntity.fromUser(result.user),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { ip, ua } = this.getIpAndUa(req);

    // Read the refresh token from the httpOnly cookie.
    const cookies = (req.cookies as Record<string, string>) ?? {};
    const cookieRefresh = cookies[COOKIE_REFRESH];

    if (!cookieRefresh) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Refresh token cookie missing.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.authService.refresh(cookieRefresh, ip, ua);

    // Calculate remaining TTL from the new token's expiry (service preserves it)
    const refreshTtlSec = (this.config.get<number>('JWT_REFRESH_TTL_DAYS') ?? 7) * 86400;
    this.setAuthCookies(res, result.access_token, result.refresh_token, 900, refreshTtlSec);

    return {
      user: UserEntity.fromUser(result.user),
    };
  }

  @Get('me')
  async getMe(@Req() req: express.Request) {
    const authReq = req as AuthenticatedRequest;
    const userPayload = authReq.user;
    if (!userPayload) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.db.user.findUnique({
      where: { id: userPayload.sub },
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

    return UserEntity.fromUser({
      id: user.id,
      name: user.name,
      role: user.role,
      organization_id: user.organization_id,
      branch_id: user.branch_id,
      credits: user.credits,
    });
  }

  // --- Logout Endpoint ---

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { ip, ua } = this.getIpAndUa(req);
    const authReq = req as AuthenticatedRequest;
    const userPayload = authReq.user;

    // Read the refresh token from the httpOnly cookie.
    const cookies = (req.cookies as Record<string, string>) ?? {};
    const cookieRefresh = cookies[COOKIE_REFRESH];

    // Revoke the refresh token family (best-effort — always clear cookies)
    await this.authService.logout(
      cookieRefresh,
      false,
      userPayload,
      ip,
      ua,
    );

    this.clearAuthCookies(res);
  }

  // --- PIN Reset Endpoints ---

  @Post('forgot-pin')
  @HttpCode(HttpStatus.OK)
  async forgotPin(@Body() body: ForgotPinDto) {
    return this.authService.forgotPin(body.phone);
  }

  @Post('reset-pin')
  @HttpCode(HttpStatus.OK)
  async resetPin(@Body() body: ResetPinDto, @Req() req: express.Request) {
    const { ip, ua } = this.getIpAndUa(req);
    return this.authService.resetPin(body.onboarding_token, body.pin, ip, ua);
  }

  // --- Authenticated Profile Endpoints ---

  @Post('setup-pin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Set or change the caller\u2019s PIN' })
  @UseGuards(RolesGuard)
  async setupPin(@Body() body: SetupPinDto, @Req() req: express.Request) {
    const authReq = req as AuthenticatedRequest;
    const userPayload = authReq.user;
    if (!userPayload) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const { ip, ua } = this.getIpAndUa(req);
    return this.authService.setupPin(
      userPayload.sub,
      body.new_pin,
      body.current_pin,
      ip,
      ua,
    );
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update the caller\u2019s profile' })
  @ApiOkResponse({ type: UserEntity })
  @UseGuards(RolesGuard)
  async updateMe(@Body() body: UpdateMeDto, @Req() req: express.Request) {
    const authReq = req as AuthenticatedRequest;
    const userPayload = authReq.user;
    if (!userPayload) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const { ip, ua } = this.getIpAndUa(req);
    return this.authService.updateMe(userPayload.sub, body, ip, ua);
  }
}
