import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const url = req.originalUrl || req.url;

    // Check if route is public
    const isPublic = this.isPublicRoute(req.method, url);

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      if (isPublic) {
        return next();
      }
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authorization header is missing.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      if (isPublic) {
        return next();
      }
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Invalid authorization format. Use Bearer <token>.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = parts[1];
    const payload = this.authService.verifyAccessToken(token);

    if (!payload) {
      if (isPublic) {
        return next();
      }
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Invalid or expired access token.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    interface CustomRequest extends Request {
      user?: Record<string, any>;
    }
    // Attach user payload to request
    (req as CustomRequest).user = payload;
    next();
  }

  private isPublicRoute(method: string, url: string): boolean {
    // Clean up url path (e.g. remove query parameters)
    const path = url.split('?')[0];

    // Public patterns
    if (method === 'POST' && path.startsWith('/api/auth/onboarding/')) {
      return true;
    }
    if (method === 'POST' && path === '/api/auth/login') {
      return true;
    }
    if (method === 'POST' && path === '/api/auth/forgot-pin') {
      return true;
    }
    if (method === 'POST' && path === '/api/auth/reset-pin') {
      return true;
    }
    if (method === 'POST' && path === '/api/auth/refresh') {
      return true;
    }
    if (method === 'GET' && path === '/api/health') {
      return true;
    }
    // Public form surface: GET, POST submit, POST track-scan all bypass auth
    if (path.startsWith('/f/')) {
      return true;
    }

    return false;
  }
}
