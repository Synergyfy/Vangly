const ACCESS_KEY = "vangly_access_token";
const REFRESH_KEY = "vangly_refresh_token";

function readKey(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeKey(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable (private mode, quota). Swallow — auth
    // will simply fall back to in-memory state for the session.
  }
}

function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Same rationale as writeKey.
  }
}

export function getAccessToken(): string | null {
  return readKey(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return readKey(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  writeKey(ACCESS_KEY, access);
  writeKey(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  removeKey(ACCESS_KEY);
  removeKey(REFRESH_KEY);
}
