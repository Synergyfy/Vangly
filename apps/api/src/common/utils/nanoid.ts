import { customAlphabet } from 'nanoid';

const PUBLIC_ID_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

const generate = customAlphabet(PUBLIC_ID_ALPHABET, 9);

export function newPublicId(): string {
  return generate();
}
