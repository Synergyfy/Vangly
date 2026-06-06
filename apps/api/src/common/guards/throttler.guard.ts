import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

export const SKIP_THROTTLE_KEY = 'skipThrottle';
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true);

export const THROTTLE_OVERRIDE_KEY = 'throttleOverride';
export interface ThrottleOverride {
  name: string;
  limit: number;
  ttl: number;
}
export const ThrottleOverride = (override: ThrottleOverride) =>
  SetMetadata(THROTTLE_OVERRIDE_KEY, override);

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: import('@nestjs/throttler').ThrottlerModuleOptions,
    storageService: import('@nestjs/throttler').ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;
    return super.shouldSkip(context);
  }

  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const expressReq = req as unknown as {
      ip?: string;
      user?: { sub?: string };
    };
    if (expressReq.user?.sub)
      return Promise.resolve(`user:${expressReq.user.sub}`);
    return Promise.resolve(`ip:${expressReq.ip ?? 'unknown'}`);
  }
}
