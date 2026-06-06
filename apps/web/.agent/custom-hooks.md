# Custom Hooks

Hooks are the boundary between React and the rest of the app. They own data fetching, derived state, and side effects. Components stay presentational.

## Layering

```
component
  -> useXxxQuery() / useXxxMutation()   (hooks/)
       -> xxxQueries / xxxMutations    (lib/api/queries|mutations)
            -> endpoint function       (lib/api/endpoints)
                 -> api (Axios)        (lib/api/client)
```

Hooks are the only place that calls `useQuery` / `useMutation`.

## Read hook pattern

```ts
// hooks/queries/use-events-list.ts
import { useQuery } from "@tanstack/react-query";
import { eventsQueries } from "@/lib/api/queries/events.options";

export function useEventsList(params: ListEventsParams) {
  return useQuery(eventsQueries.list(params));
}
```

That is the whole file for simple cases. Add a wrapper only when you need:

- extra `select` derivation,
- conditional enabling based on props,
- composition with other hooks.

### Conditional fetching

```ts
export function useEventDetail(id: string | undefined) {
  return useQuery({
    ...eventsQueries.detail(id ?? ""),
    enabled: Boolean(id),
  });
}
```

Never conditionally call the hook — always call it and use `enabled`. This keeps hook order stable.

### Derived / transformed data

```ts
export function useEventCount() {
  return useQuery({
    ...eventsQueries.list({ pageSize: 1 }),
    select: (data) => data.length,
  });
}
```

`select` is memoized inside TanStack Query; prefer it over `useMemo` on the result.

## Mutation hook pattern

```ts
// hooks/mutations/use-create-event.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsMutations } from "@/lib/api/mutations/events.mutations";
import { eventKeys } from "@/lib/api/queries/events.keys";
import type { CreateEventInput } from "@/types/api/events";

export function useCreateEvent() {
  const qc = useQueryClient();

  return useMutation({
    ...eventsMutations.create(),
    onSuccess: (event) => {
      qc.invalidateQueries({ queryKey: eventKeys.lists() });
      qc.setQueryData(eventKeys.detail(event.id), event);
    },
  });
}
```

Rules:

- Invalidate the smallest scope that is now stale (`lists()` is fine; `all` is rarely needed).
- Use `setQueryData` to seed detail caches so a follow-up detail fetch is instant.
- Surface only the mutation result; do not wrap in a try/catch — TanStack Query already exposes `error`.

## Generic utility hooks

Small reusable hooks live at the top of `hooks/`. Keep them focused.

```ts
// hooks/use-debounce.ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

## Hook contract rules

- **Naming:** `useXxx` where `Xxx` is what it returns or what it does. `useEventsList`, `useCreateEvent`, `useDebounce`.
- **Args:** accept plain typed values, not raw `Request` / Axios objects. Hooks should look the same to callers regardless of transport.
- **Return:** return the TanStack Query result object directly, or a small typed projection of it. Do not destructure away `isLoading` / `error` unless the caller really never needs them.
- **One concern per hook.** Combine hooks in components, not in a mega-hook.
- **No side effects outside the React lifecycle.** No `window` writes at module top level, no `setInterval` outside `useEffect`.

## What to avoid

- `const [data, setData] = useState(); useEffect(() => { axios.get(...).then(setData) }, []);` — replace with `useQuery`.
- Passing the entire query result as a prop. Destructure in the parent so children stay simple.
- Hooks that swallow errors and return a default value. Let the caller decide what "no data" means.
- Hooks that mutate state of other queries directly. Use `queryClient.setQueryData` / `invalidateQueries`.
- Hooks named `useApi` / `useRequest` — they invite every caller to pass arbitrary URLs.
