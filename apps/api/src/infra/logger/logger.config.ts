import { Params } from 'nestjs-pino';
import { Request } from 'express';
import { IncomingMessage, ServerResponse } from 'http';

export function loggerOptions(): Params {
  return {
    pinoHttp: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      autoLogging: true,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.pin',
          'req.body.refresh_token',
          'req.body.newPin',
          'req.body.otp',
          'res.headers["set-cookie"]',
        ],
        remove: true,
      },
      customLogLevel: (
        _req: IncomingMessage,
        res: ServerResponse,
        err?: Error,
      ) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customProps: (req: Request) => ({
        actor: (req as Request & { user?: { sub?: string } }).user?.sub ?? null,
      }),
      transport:
        process.env.NODE_ENV === 'production'
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                translateTime: 'HH:MM:ss.l',
                ignore:
                  'pid,hostname,req.remoteAddress,req.remotePort,res.headers',
                colorize: true,
              },
            },
    },
  };
}
