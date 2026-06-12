import { ApiError } from "@/lib/api/client";

export function extractErrorMessage(err: unknown, fallback?: string): string {
  if (err instanceof ApiError && err.body) {
    const msg = err.body.message || err.body.error?.message;
    if (typeof msg === "string") return msg;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback ?? "Something went wrong. Please try again.";
}
