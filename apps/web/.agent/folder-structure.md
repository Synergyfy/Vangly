# Folder Structure

Keep the project predictable. New code should always land in one of the folders below — never invent a new top-level directory without a good reason.

## Top-level layout

```
app/                Next.js App Router pages, layouts, route handlers
components/         Reusable presentational components
  ui/               Atomic primitives (Button, Input, Modal, ...)
  layout/           Header, Sidebar, Footer, ...
  features/         Feature-scoped composites (EventCard, InviteForm, ...)
contexts/           React contexts (Auth, Theme, Brand, ...)
hooks/              Custom React hooks
lib/                Framework-agnostic utilities
  api/              Axios client + endpoint functions
  utils/            Pure helpers (formatters, validators)
  constants.ts      App-wide constants
types/              Shared TS types and interfaces
providers/          App-level providers (QueryClient, Theme, ...)
```

## `app/` rules

- One folder per route segment. Co-locate route-private components in `_components/` (private folder, not routable).
- Server components by default. Add `"use client"` only when you need state, effects, or browser APIs.
- Route handlers (`route.ts`) only for true BFF work. Otherwise call external APIs from `lib/api/`.

## `lib/api/` layout

```
lib/api/
  client.ts         Axios instance (interceptors, base config)
  endpoints/        One file per resource (events.ts, users.ts, ...)
    events.ts
    users.ts
  queries/          Query keys + query-option factories
    events.keys.ts
    events.options.ts
  mutations/        Mutation option factories
    events.mutations.ts
```

- `client.ts` configures base URL, auth header injection, refresh logic, and global error normalization.
- `endpoints/<resource>.ts` exports typed functions that call the client. **No React, no hooks here.**
- `queries/` and `mutations/` build TanStack Query option objects consumed by custom hooks.

## `hooks/` layout

```
hooks/
  queries/          useXQuery() — read hooks
  mutations/        useXMutation() — write hooks
  use-debounce.ts   Generic primitives
```

- One file per hook. Default export the hook; named export its argument types if reused.
- Hooks own the React side-effects; they call into `lib/api/queries` and `lib/api/mutations`.

## `types/`

- `types/api/` for request/response shapes, one file per resource.
- `types/domain/` for business entities shared across layers.
- Never define API types inside components or hooks.

## Naming

- Files: `kebab-case.ts` for non-component files, `PascalCase.tsx` for components.
- Hooks: `useXxx.ts`. The exported symbol matches the file name.
- Endpoint functions: verb-noun (`listEvents`, `getEventById`, `createEvent`).
- Query keys: resource-first, segment-by-scope (see `api-integration.md`).

## What to avoid

- `utils/` dumping ground — split into `lib/utils/` by concern.
- A `services/` folder that mixes HTTP calls with business logic. Keep transport in `lib/api/`, business logic in hooks or `lib/`.
- Per-feature top-level folders that re-implement the structure above. Use the `features/` subfolder of `components/` instead.
