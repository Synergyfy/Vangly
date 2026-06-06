# Code Quality

Patterns to follow and antipatterns to avoid. None of this is novel — it is the baseline that makes the rest of the rules work.

## Components

- **Server components by default.** Add `"use client"` only when the component uses state, effects, or browser APIs.
- **One component per file.** Co-locate small private helpers in the same file; extract when reused.
- **Props are explicit interfaces.** Destructure in the signature; do not pass `props` through blindly.
- **No `useEffect` for derived state.** Compute in render, `useMemo` only when the cost is real and measurable.
- **No `useEffect` for data fetching.** That is what TanStack Query is for.
- **No inline `style` objects** unless dynamic. Tailwind classes belong in the className.
- **No `dangerouslySetInnerHTML` without a sanitizer** and a comment explaining why it is safe.
- **Keys in lists:** stable IDs from the data. Never `key={index}` for lists that can reorder, paginate, or filter.

```tsx
interface EventCardProps {
  event: Event;
  onSelect?: (id: string) => void;
}

export function EventCard({ event, onSelect }: EventCardProps) {
  return (
    <article onClick={() => onSelect?.(event.id)}>
      <h3>{event.title}</h3>
      <time dateTime={event.startsAt}>{formatDate(event.startsAt)}</time>
    </article>
  );
}
```

## State

- **`useState` is for UI state only.** Form values, open/closed, selected tab, draft text.
- **Server state goes through TanStack Query.** Never mirror query data into `useState`.
- **Cross-component state** goes in context (sparingly) or a store. Default to lifting state.
- **URL state** (filters, pagination, search) belongs in the query string. Use `useSearchParams` + a router push, not `useState`.

## Effects

- Effects are escape hatches. Before reaching for one, ask: can a render, an event handler, or a query do this?
- Always return a cleanup function for any subscription, timer, or listener.
- Never put data fetching in an effect. The query client handles it.
- Never update parent state inside a child's effect — derive instead.

```tsx
useEffect(() => {
  const ctrl = new AbortController();
  window.addEventListener("resize", onResize, { signal: ctrl.signal });
  return () => ctrl.abort();
}, [onResize]);
```

## Errors

- Normalize at the boundary (the Axios interceptor). Handle `ApiError` everywhere else.
- Render error UI at the call site, not in a global `window.onerror` handler.
- For form submissions, surface server errors next to the field, not in a toast.
- Never `catch (e) {}`. If you must catch, log and rethrow, or return a typed result.

## Async / promises

- `async` functions return promises. Do not wrap a promise-returning function in another `async` just to call it.
- Use `Promise.all` for independent work, `Promise.allSettled` when partial failure is acceptable.
- Do not `await` in a loop when the calls are independent.

## Naming

- **Variables:** nouns. `eventList`, not `eventsDataVar`.
- **Functions:** verbs. `getEvent`, `formatDate`, `isActive`.
- **Booleans:** `is`/`has`/`can`/`should` prefix. `isLoading`, `hasAccess`.
- **Constants:** `SCREAMING_SNAKE` only for true compile-time constants and env keys. Use `const` + `camelCase` otherwise.
- **Acronyms:** 2 letters uppercase (`UI`), 3+ letters PascalCase (`Api`, `Url`).

## Imports and exports

- Use the `@/...` alias. No `../../../` chains.
- Type-only imports: `import type { Event } from "@/types/api/events";` — enforced by ESLint.
- Default exports only for React components and route files. Named exports everywhere else.
- No barrel files (`index.ts` re-exports) unless they hide genuinely noisy imports; they hurt tree-shaking and cycles.

## Comments and docs

- Comment **why**, not what. Code shows what.
- JSDoc only on exported public utilities. Skip it for self-explanatory component props.
- A `// TODO(name):` line beats an unowned `// TODO`.
- Do not leave commented-out code. Delete it; git remembers.

## Performance

- Do not optimize without a measurement. Prefer readable code; reach for `useMemo`/`useCallback` only when:
  - the value/reference is passed to a memoized child or a dependency list, **and**
  - the computation is non-trivial.
- `next/dynamic` for heavy client components; keep route shells server-rendered.
- Images: always `next/image` with explicit `width`/`height` or `fill` + sized parent.

## Security

- Never `dangerouslySetInnerHTML` untrusted strings.
- Never put secrets in `NEXT_PUBLIC_*` env vars.
- Validate and encode user input at the boundary. URLs, form values, and query params are user input even if "we control the UI".
- CSRF and auth headers belong in the Axios client, not in every call.

## Testing

- Unit-test pure helpers and endpoint wrappers with a mocked `api`.
- Use `@tanstack/react-query`'s test utilities (`createTestQueryClient`) for hook tests.
- Do not snapshot-test entire component trees; assert the behavior, not the markup.

## Code review checklist

Before opening a PR, walk the file through this list:

- [ ] No `any`, no `as` casts, no `!` non-null assertions.
- [ ] No `useEffect` doing what a query, a handler, or a render could do.
- [ ] No data fetched inside the component. It goes through a hook.
- [ ] New files live in the right folder per `folder-structure.md`.
- [ ] Props are typed; the component is presentational; hooks are the only React-aware layer.
- [ ] Errors are normalized to `ApiError`; the UI shows them.
- [ ] `lint` and `tsc --noEmit` pass.
