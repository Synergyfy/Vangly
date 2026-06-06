# API Integration

All HTTP traffic flows through a single Axios client and is consumed via TanStack Query. Components never call Axios directly.

## 1. The Axios client

`lib/api/client.ts` is the only place that constructs an Axios instance.

```ts
// lib/api/client.ts
import axios, { AxiosError, type AxiosInstance } from "axios";

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(body.message);
    this.name = "ApiError";
  }
}

function createClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorBody>) => {
      const status = error.response?.status ?? 0;
      const body = error.response?.data ?? { message: error.message };
      return Promise.reject(new ApiError(status, body));
    },
  );

  return instance;
}

export const api = createClient();
```

Rules:

- Export the instance as `api`. Do not re-instantiate per request.
- Inject auth via request interceptor, not at call sites.
- Normalize errors to `ApiError` in the response interceptor so consumers can `instanceof`-check it.
- Never log tokens or full request bodies in interceptors.

## 2. Endpoint functions

One file per resource. Functions are pure transport — no React, no caching, no side effects.

```ts
// lib/api/endpoints/events.ts
import { api } from "../client";
import type { Event, CreateEventInput, ListEventsParams } from "@/types/api/events";

export async function listEvents(params: ListEventsParams): Promise<Event[]> {
  const { data } = await api.get<Event[]>("/events", { params });
  return data;
}

export async function getEventById(id: string): Promise<Event> {
  const { data } = await api.get<Event>(`/events/${id}`);
  return data;
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const { data } = await api.post<Event>("/events", input);
  return data;
}
```

Rules:

- Type the generic on the request method (`api.get<Event[]>(...)`). Do not cast the result.
- Return the unwrapped data, not the Axios response. Callers do not need `.data`.
- Throw on non-2xx. Let the interceptor normalize; do not swallow errors here.
- No try/catch in endpoints. Bubbling `ApiError` is the contract.

## 3. Query keys

Centralize keys so invalidation is correct. Use a factory keyed by resource.

```ts
// lib/api/queries/events.keys.ts
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params: ListEventsParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};
```

Use `as const` tuples. Hierarchical keys let `queryClient.invalidateQueries({ queryKey: eventKeys.lists() })` nuke all list queries in one call.

## 4. Query option factories

Build `queryOptions` objects so the same config is reused by prefetch, hydration, and the hook.

```ts
// lib/api/queries/events.options.ts
import { queryOptions } from "@tanstack/react-query";
import { listEvents, getEventById } from "../endpoints/events";
import { eventKeys } from "./events.keys";

export const eventsQueries = {
  list: (params: ListEventsParams) =>
    queryOptions({
      queryKey: eventKeys.list(params),
      queryFn: () => listEvents(params),
      staleTime: 30_000,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: eventKeys.detail(id),
      queryFn: () => getEventById(id),
      staleTime: 60_000,
    }),
};
```

## 5. Mutation option factories

```ts
// lib/api/mutations/events.mutations.ts
import { mutationOptions } from "@tanstack/react-query";
import { createEvent } from "../endpoints/events";
import { eventKeys } from "../queries/events.keys";

export const eventsMutations = {
  create: () =>
    mutationOptions({
      mutationFn: (input: CreateEventInput) => createEvent(input),
      onSuccess: () => {
        // Invalidate in the consumer, not here. Factories stay pure.
      },
    }),
};
```

## 6. Provider setup

```tsx
// providers/query-provider.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: (count, err) => !(err instanceof ApiError) && count < 2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

Wrap once in `app/layout.tsx`. Always create the client inside `useState` so HMR does not blow it away.

## 7. Where the data actually gets used

See [custom-hooks.md](./custom-hooks.md) — components call `useXxxQuery()` / `useXxxMutation()` hooks; hooks call the option factories; option factories call the endpoints.

## What to avoid

- `useEffect` + `fetch`/`axios` inside a component. That is what TanStack Query replaces.
- A `globalData` / `appState` store for server data. Use the query cache.
- Stringly-typed query keys spread across files. Always go through the `xxxKeys` factory.
- Disabling `retry` globally. Default to retrying non-`ApiError` failures only.
