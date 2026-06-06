import { ThrottlerModuleOptions } from '@nestjs/throttler';

export function throttlerOptions(): ThrottlerModuleOptions {
  return [
    {
      name: 'short',
      ttl: 1_000,
      limit: 5,
    },
    {
      name: 'medium',
      ttl: 60_000,
      limit: 120,
    },
    {
      name: 'long',
      ttl: 3_600_000,
      limit: 1_000,
    },
  ];
}

export const THROTTLE_AUTH_NAME = 'auth' as const;
export const THROTTLE_PUBLIC_SUBMIT_NAME = 'public-submit' as const;
