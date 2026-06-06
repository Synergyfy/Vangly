import { HttpException, HttpStatus } from '@nestjs/common';
import { hashSecret } from './hash';

export const PIN_HISTORY_LIMIT = 3;
export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 6;

export interface PinPolicyTarget {
  pin_hash: string;
  pin_history: string[];
}

export function isValidPinFormat(pin: string): boolean {
  return (
    typeof pin === 'string' &&
    /^\d+$/.test(pin) &&
    pin.length >= PIN_MIN_LENGTH &&
    pin.length <= PIN_MAX_LENGTH
  );
}

export function validatePinPolicy(
  user: PinPolicyTarget,
  newPin: string,
): { pinHash: string; newHistory: string[] } {
  if (!isValidPinFormat(newPin)) {
    throw new HttpException(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: `PIN must be ${PIN_MIN_LENGTH} to ${PIN_MAX_LENGTH} digits.`,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  const pinHash = hashSecret(newPin);
  if (user.pin_history.includes(pinHash)) {
    throw new HttpException(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'PIN must not be one of your last 3 PINs.',
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  const newHistory = [...user.pin_history, pinHash];
  if (newHistory.length > PIN_HISTORY_LIMIT) {
    newHistory.shift();
  }
  return { pinHash, newHistory };
}
