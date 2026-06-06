import {
  Controller,
  Post,
  Get,
  Body,
  Req,
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
  RefreshDto,
  LogoutDto,
  ForgotPinDto,
  ResetPinDto,
} from './dto';
import { UserEntity } from './entities/user.entity';
import { AuthUser } from '../common/decorators/current-user.decorator';

interface MulterFile {
  mimetype: string;
  size: number;
  originalname: string;
}

interface AuthenticatedRequest extends express.Request {
  user?: AuthUser;
}

@Controller('api/auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly db: DatabaseService,
  ) {}

  private getIpAndUa(req: express.Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    return { ip, ua };
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
  ) {
    const { ip, ua } = this.getIpAndUa(req);
    const result = await this.authService.completeOnboarding(
      body.onboarding_token,
      ip,
      ua,
    );
    return {
      ...result,
      user: UserEntity.fromUser(result.user),
    };
  }

  // --- Login Endpoints ---

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto, @Req() req: express.Request) {
    const { ip, ua } = this.getIpAndUa(req);
    const result = await this.authService.login(
      body.phone,
      body.pin,
      body.remember || false,
      ip,
      ua,
    );
    return {
      ...result,
      user: UserEntity.fromUser(result.user),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: RefreshDto, @Req() req: express.Request) {
    const { ip, ua } = this.getIpAndUa(req);
    const result = await this.authService.refresh(body.refresh_token, ip, ua);
    return {
      ...result,
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
  async logout(@Body() body: LogoutDto, @Req() req: express.Request) {
    const { ip, ua } = this.getIpAndUa(req);
    const authReq = req as AuthenticatedRequest;
    const userPayload = authReq.user;
    await this.authService.logout(
      body.refresh_token,
      body.everywhere || false,
      userPayload,
      ip,
      ua,
    );
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
}
