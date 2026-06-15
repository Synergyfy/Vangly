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

    // --- Resolve token from Cookie or Authorization header ---
    // Web browsers send the httpOnly harvite_access cookie automatically.
    // Mobile/Swagger clients send Authorization: Bearer <token>.
    const cookieToken = (req.cookies as Record<string, string>)?.harvite_access;
    const authHeader = req.headers['authorization'];

    let token: string | null = null;

    if (cookieToken) {
      // Cookie takes precedence when present (web browser flow)
      token = cookieToken;
    } else if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        if (isPublic) return next();
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
      token = parts[1];
    }

    if (!token) {
      if (isPublic) return next();
      throw new HttpException(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authorization required.',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = this.authService.verifyAccessToken(token);

    if (!payload) {
      if (isPublic) return next();
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
    // Swagger UI + raw OpenAPI JSON (dev only; gated by SWAGGER_ENABLED in main.ts)
    if (
      path === '/api/docs' ||
      path === '/api/docs/' ||
      path === '/api/docs-json' ||
      path.startsWith('/api/docs-json/') ||
      path === '/api/docs-yaml' ||
      path.startsWith('/api/docs-yaml/')
    ) {
      return true;
    }
    // Public form surface: GET, POST submit, POST track-scan all bypass auth
    if (path.startsWith('/f/')) {
      return true;
    }
    if (method === 'GET' && path.startsWith('/api/invites/track/')) {
      return true;
    }

    return false;
  }
}
