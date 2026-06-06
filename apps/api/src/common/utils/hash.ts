import * as crypto from 'crypto';

export function hashSecret(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}
