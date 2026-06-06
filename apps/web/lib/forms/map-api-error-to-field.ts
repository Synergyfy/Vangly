import { ApiError } from "@/lib/api/client";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mapApiErrorToField(
  err: unknown,
  hints: readonly string[],
): string | null {
  if (!(err instanceof ApiError)) return null;

  const details: unknown = err.body.details;
  if (isPlainObject(details)) {
    const direct = details["field"];
    if (typeof direct === "string" && hints.includes(direct)) {
      return direct;
    }
    const fields = details["fields"];
    if (Array.isArray(fields)) {
      for (const item of fields) {
        if (
          isPlainObject(item) &&
          typeof item["field"] === "string" &&
          hints.includes(item["field"])
        ) {
          return item["field"];
        }
      }
    }
  }

  const code: unknown = err.body.code;
  if (typeof code === "string") {
    const matched = hints.find((hint) => hint.toLowerCase() === code.toLowerCase());
    if (matched) return matched;
  }

  const message = err.body.message.toLowerCase();
  for (const hint of hints) {
    const needle = hint.toLowerCase();
    if (message.includes(needle)) return hint;
  }

  return null;
}
