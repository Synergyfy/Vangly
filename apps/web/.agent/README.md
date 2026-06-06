# Agent Rules

Coding rules and best practices for this codebase. Read the relevant file before writing or reviewing code.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript (strict mode)
- TanStack Query for server state
- Axios for HTTP
- Tailwind CSS for styling

## Rule files

| File | Covers |
| --- | --- |
| [folder-structure.md](./folder-structure.md) | Where files live, layering, naming |
| [api-integration.md](./api-integration.md) | Axios client, TanStack Query setup and usage |
| [custom-hooks.md](./custom-hooks.md) | Custom hook patterns, encapsulation |
| [typescript.md](./typescript.md) | Type safety, no `any`, generics, narrowing |
| [code-quality.md](./code-quality.md) | General quality rules, anti-patterns |

## Quick principles

1. **No `any`.** Use `unknown` + narrowing, generics, or proper types.
2. **Server state via TanStack Query, never in `useState` + `useEffect` fetches.**
3. **HTTP goes through the Axios client in `lib/api`.** Components never call `axios.get(...)` directly.
4. **One responsibility per file.** Hooks in `hooks/`, types in `types/`, services in `lib/api/`.
5. **Strict TS is on.** Do not weaken it. If a library is missing types, declare a local interface instead of disabling checks.
6. **Components are dumb.** Data fetching, mutation side-effects, and derived state live in hooks.
