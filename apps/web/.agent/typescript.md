# TypeScript Rules

`tsconfig.json` runs with `strict: true`. Treat that as a floor, not a ceiling. The goal is types that catch real bugs, not types that compile and lie.

## Hard rules

1. **`any` is banned.** Use `unknown` + narrowing, generics, or a precise type. ESLint should fail the build on `any`.
2. **`as` is a last resort.** Prefer type guards and generics. If you must cast, narrow the cast: `data as Event` is suspect; `(data as Event).id` after a runtime check is acceptable.
3. **No non-null assertions (`!`) on values you do not control.** API responses, env vars, and `localStorage` are all `T | null` until proven otherwise.
4. **No `@ts-ignore` / `@ts-expect-error` without a comment** explaining why and a TODO to remove it.
5. **Do not loosen `strict` settings** to make a third-party library compile. Declare a local interface for the parts you use.

## Modeling API data

Define request and response types in `types/api/`, one file per resource.

```ts
// types/api/events.ts
export interface Event {
  id: string;
  title: string;
  startsAt: string; // ISO 8601 — keep raw; format at the edge
  hostId: string;
}

export interface ListEventsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateEventInput {
  title: string;
  startsAt: string;
}
```

Conventions:

- **IDs are `string`.** Branded types (`type EventId = string & { __brand: "EventId" }`) are fine for high-value domains, but do not sprinkle them everywhere.
- **Dates are `string` (ISO) on the wire.** Convert to `Date` only in the UI layer where you need to format.
- **Discriminated unions for variants.** `type EventStatus = "draft" | "published" | "cancelled";`
- **No `null` + `undefined` mix for "missing".** Pick one per field and document it. Prefer `undefined` for optional; `null` only when the API explicitly returns it.

## Typing hooks and queries

Let TypeScript infer what it can. Annotate only at the boundary.

```ts
export function useEventsList(params: ListEventsParams) {
  return useQuery(eventsQueries.list(params));
}
// `data` is inferred as Event[] | undefined — correct.
```

If you need a non-nullable projection:

```ts
const { data, isPending } = useEventsList(params);
if (isPending) return <Spinner />;
return <List items={data} />; // `data: Event[]` here
```

Do not write `useQuery<MyType>` and pass the result type as a generic unless you are intentionally overriding — the option factory already sets the type.

## Typing functions

- **Inputs:** explicit object types for >1 arg, or a single typed parameter. Do not use positional tuples for unrelated data.
- **Outputs:** let inference work. Annotate return type only when it is part of the public contract (exported function) or when inference is too wide.
- **Generics** when a helper is genuinely polymorphic. Default them when there is a clear common case.

```ts
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json() as Promise<T>;
}
```

## Discriminated unions over optional fields

```ts
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "success"; data: T };
```

Force consumers to handle every case; the compiler will not let them forget `loading`.

## Narrowing `unknown`

Most common offender: data parsed from `JSON.parse`, `localStorage`, or query strings.

```ts
function parseEvent(raw: unknown): Event {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Event payload must be an object");
  }
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.title !== "string") {
    throw new Error("Event payload missing required fields");
  }
  return { id: r.id, title: r.title /* ... */ };
}
```

For larger shapes, use a runtime validator (Zod, Valibot) and infer the TS type from the schema. Do not hand-roll validators for >3 fields.

## Typing third-party libraries

When a library has no types or weak types:

```ts
// types/third-party/qrcode-react.d.ts (or augment the module)
declare module "qrcode.react" {
  export interface QRCodeCanvasProps {
    value: string;
    size?: number;
    level?: "L" | "M" | "Q" | "H";
  }
  export const QRCodeCanvas: React.FC<QRCodeCanvasProps>;
}
```

Keep these shims narrow — only the surface you actually use.

## React-specific typing

- **Component props:** `interface Props { ... }` with `export type`. Do not use `React.FC` — it adds implicit `children` and hurts inference.
- **Children:** declare them explicitly when you need them: `children: React.ReactNode`.
- **Refs:** `useRef<HTMLInputElement>(null)` and guard with `if (!ref.current) return;`.
- **Event handlers:** use the specific type: `React.ChangeEvent<HTMLInputElement>`, not `React.SyntheticEvent`.
- **Forwarded refs:** `React.forwardRef<HTMLButtonElement, ButtonProps>(...)`.

## Lint reinforcement

Add to `eslint.config.mjs`:

```js
"@typescript-eslint/no-explicit-any": "error",
"@typescript-eslint/no-non-null-assertion": "error",
"@typescript-eslint/consistent-type-imports": "error",
"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
```

## What to avoid

- `any` "to unblock the build" — the blocker usually lives in a missing type, not in a type system.
- `// eslint-disable-next-line` without an explanation comment.
- `as unknown as Foo` chains — they are two lies stacked.
- `Record<string, any>` for "object with stuff". Define the shape.
- Hand-typing re-exports of library types instead of importing the canonical type.
