import { Request } from 'express';

export function getIpAndUa(req: Request): { ip: string; ua: string } {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  const ua = (req.headers['user-agent'] as string) || 'unknown';
  return { ip, ua };
}
