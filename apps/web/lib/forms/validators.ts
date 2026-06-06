export const E164_REGEX = /^\+\d{8,15}$/;
export const PIN_REGEX = /^\d{4,6}$/;
export const SUBDOMAIN_REGEX = /^[a-z0-9-]{3,30}$/;
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
export const ISO_COUNTRY_REGEX = /^[A-Z]{2}$/;
export const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
export const MAX_LOGO_BYTES = 1_000_000;

export const RESERVED_SUBDOMAINS = new Set([
  "admin",
  "www",
  "api",
  "app",
  "dashboard",
  "vangly",
  "support",
  "help",
  "auth",
  "login",
  "signup",
]);

export function isE164(value: string): boolean {
  return E164_REGEX.test(value);
}

export function toE164(countryCode: string, nationalNumber: string): string {
  const cc = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
  const digits = nationalNumber.replace(/\D/g, "");
  return `${cc}${digits}`;
}

export function isValidPin(value: string): boolean {
  return PIN_REGEX.test(value);
}

export function isValidSubdomain(value: string): boolean {
  if (!SUBDOMAIN_REGEX.test(value)) return false;
  return !RESERVED_SUBDOMAINS.has(value);
}

export function isHexColor(value: string): boolean {
  return HEX_COLOR_REGEX.test(value);
}

export function isIsoCountryCode(value: string): boolean {
  return ISO_COUNTRY_REGEX.test(value);
}

export function isAllowedLogo(file: File | null | undefined): boolean {
  if (!file) return true;
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) return false;
  if (file.size > MAX_LOGO_BYTES) return false;
  return true;
}

export function logoErrorMessage(file: File | null | undefined): string | null {
  if (!file) return null;
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    return "Logo must be a PNG, JPG, or SVG file.";
  }
  if (file.size > MAX_LOGO_BYTES) {
    return "Logo must be 1MB or smaller.";
  }
  return null;
}
