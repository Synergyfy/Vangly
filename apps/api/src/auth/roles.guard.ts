import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    interface CustomRequest {
      user?: {
        role: string;
        sub: string;
      };
    }
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const user = request.user; // populated by AuthMiddleware

    if (!user) {
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required for this resource.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Treat branch_admin and location_admin as equivalent
    const normalizedUserRole =
      user.role === 'branch_admin' ? 'location_admin' : user.role;
    const normalizedRequiredRoles = requiredRoles.map((role) =>
      role === 'branch_admin' ? 'location_admin' : role,
    );

    const hasRole = normalizedRequiredRoles.includes(normalizedUserRole);

    if (!hasRole) {
      throw new HttpException(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions.',
          },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
