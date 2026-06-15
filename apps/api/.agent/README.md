# .agent — Engineering Rules for harvite-backend

This folder contains the engineering rules every contributor (human or AI agent)
**must follow** when working on this NestJS + Prisma backend.

These are not suggestions. They are guardrails. If a change violates a rule
without a written justification in the PR description, it should be rejected
in review.

## Table of contents

| File | Topic | When to read |
| --- | --- | --- |
| [`prisma-migrations.md`](./prisma-migrations.md) | Prisma schema migrations (`migrate dev`, `migrate deploy`, no `db push` in shared envs) | Touching `prisma/schema.prisma`, shipping a migration, seeding data |
| [`dto-class-validator.md`](./dto-class-validator.md) | DTO conventions with `class-validator` + `class-transformer` | Adding or changing any request/response shape, controller input |
| [`swagger-docs.md`](./swagger-docs.md) | OpenAPI / Swagger documentation rules | Adding/changing any endpoint, DTO, or response envelope |
| [`security.md`](./security.md) | Auth, authorization, input safety, secrets, headers, rate limiting | Anything touching auth, user data, external input, deployments |
| [`prisma-no-n-plus-1.md`](./prisma-no-n-plus-1.md) | Prisma query patterns that avoid N+1 (eager `include`, `select`, batched queries) | Writing or reviewing any service that reads the DB |
| [`redis.md`](./redis.md) | Redis usage, caching, locks, invalidation, key naming | Adding caching, queues, sessions, rate limits, idempotency keys |
| [`performance-optimization.md`](./performance-optimization.md) | General speed/perf rules (pagination, indexes, payload size, async) | Reviewing any hot path, slow query, or new feature |

## How these rules are enforced

1. **PR template** must link to the relevant `.agent/*.md` file(s) in the
   "Rules consulted" section.
2. **Code review**: a rule violation without a justified exception in the PR
   body is a blocker.
3. **Agents / automation**: any code-generation step in CI (codegen, AI
   assistant, scaffolding) must read the relevant file in this folder before
   producing code.
4. **Onboarding**: new engineers read this folder on day one.

## Priority order when rules collide

1. `security.md` (security always wins)
2. `prisma-migrations.md` (data integrity)
3. Everything else, in the order above

If two non-security rules collide, raise it in the PR — do not silently pick
one.
