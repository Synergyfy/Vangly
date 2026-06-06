import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '../../auth/auth.types';

export interface AuthUser {
  sub: string;
  role: UserRole;
  organization_id: string | null;
  branch_id: string | null;
  iat?: number;
  exp?: number;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | null => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    return req.user ?? null;
  },
);
