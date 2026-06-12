// Tokens are now stored as httpOnly cookies set by the API server.
// The browser sends them automatically — no JavaScript access is needed or possible.
// These stubs are kept so existing call-sites compile without changes.

/** @deprecated Tokens live in httpOnly cookies; always returns null. */
export function getAccessToken(): string | null {
  return null;
}

/** @deprecated Tokens live in httpOnly cookies; always returns null. */
export function getRefreshToken(): string | null {
  return null;
}

/** @deprecated Tokens live in httpOnly cookies; this is a no-op. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setTokens(_access: string, _refresh: string): void {
  // no-op: cookies are set by the API via Set-Cookie headers
}

/** @deprecated Tokens live in httpOnly cookies; this is a no-op. */
export function clearTokens(): void {
  // no-op: cookies are cleared by POST /api/auth/logout
}

