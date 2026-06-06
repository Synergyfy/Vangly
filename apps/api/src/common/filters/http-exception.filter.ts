import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();

      let code: string;
      let message: string | string[];

      if (typeof raw === 'string') {
        message = raw;
        code = status >= 500 ? 'INTERNAL_ERROR' : 'ERROR';
      } else if (typeof raw === 'object' && raw !== null) {
        const obj = raw as Record<string, unknown>;
        const inner = obj.error as Record<string, unknown> | undefined;
        if (
          inner &&
          typeof inner.code === 'string' &&
          typeof inner.message !== 'undefined'
        ) {
          code = inner.code;
          message = inner.message as string | string[];
        } else if (typeof obj.message !== 'undefined') {
          message = obj.message as string | string[];
          code = (obj.code as string) || this.defaultCodeForStatus(status);
        } else {
          code = this.defaultCodeForStatus(status);
          message = exception.message;
        }
      } else {
        code = this.defaultCodeForStatus(status);
        message = exception.message;
      }

      response.status(status).json({
        error: {
          code,
          message,
        },
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
      });
      return;
    }

    this.logger.error(
      `Unhandled error on ${request.method} ${request.originalUrl}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }

  private defaultCodeForStatus(status: number): string {
    switch (status) {
      case 400:
        return 'VALIDATION_ERROR';
      case 401:
        return 'UNAUTHENTICATED';
      case 402:
        return 'INSUFFICIENT_CREDITS';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 413:
        return 'PAYLOAD_TOO_LARGE';
      case 422:
        return 'UNPROCESSABLE_ENTITY';
      case 429:
        return 'RATE_LIMITED';
      case 423:
        return 'LOCKED';
      default:
        return 'ERROR';
    }
  }
}
