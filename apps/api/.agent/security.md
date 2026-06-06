# Security

> Security is the **first** rule. When a security rule conflicts with
> any other rule in this repo, security wins. Always.

This file is opinionated and concrete. It is not a complete security
guide; it is the minimum bar for shipping code in this repo.

---

## 1. Secrets and config

- **Never** commit secrets. `.env` is in `.gitignore`. Only `.env.example`
  is in the repo.
- Load config with `@nestjs/config` and validate it at boot with
  `Joi` or `zod`. Crash on boot if a required var is missing or malformed.
- Use distinct, scoped secrets per environment (dev / staging / prod).
  Never reuse the prod secret anywhere else.
- For local dev, use a `Makefile` / `docker-compose` / 1Password CLI.
  Do not paste real secrets into Slack or PRs.
- Rotate on suspicion, not on schedule. Document rotations in
  `docs/secret-rotation.md`.

```ts
// app.module.ts
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').required(),
    DATABASE_URL: Joi.string().uri().required(),
    JWT_ACCESS_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    REDIS_URL: Joi.string().uri().required(),
  }),
});
```

---

## 2. Passwords and tokens

- Hash passwords with **argon2id** (preferred) or **bcrypt** (cost ≥ 12).
  Never MD5/SHA-1/plain.
- Never log tokens, passwords, refresh tokens, or session cookies —
  redact in any logger that might see them.
- Access tokens: short-lived (5–15 min), JWT, signed with HS256/RS256.
- Refresh tokens: long-lived (7–30 days), stored as **hashes** in the
  database, rotatable, single-use or with a `tokenVersion` field on the
  user.
- Always invalidate refresh tokens on:
  - Password change
  - Logout
  - "Log out everywhere" action
  - Suspected compromise

```ts
import * as argon2 from 'argon2';
const hash = await argon2.hash(plain, { type: argon2.argon2id });
const ok = await argon2.verify(hash, plain);
```

---

## 3. AuthN / AuthZ

- **Authentication** goes through a single `JwtAuthGuard` at the
  controller / method level. Don't roll it per-feature.
- **Authorization** is **never** "is logged in". It is "owns the
  resource" or "has the role". Use a `@Roles('admin')` decorator +
  `RolesGuard` and a **resource-level** check in the service.
- Resource ownership check before any read/write. Always load by
  `{ id, ownerId }`, never by `id` alone.

```ts
// bad
const post = await prisma.post.findUnique({ where: { id } });

// good
const post = await prisma.post.findFirst({ where: { id, authorId: user.id } });
if (!post) throw new NotFoundException();
```

- Don't trust `userId` from the request body. Take it from
  `@CurrentUser() user: AuthUser` only.
- Public routes (login, register, health) must be **explicitly**
  decorated with `@Public()` and the guard must read that metadata.
  Default = locked.

---

## 4. Input validation

- `ValidationPipe` is **always on**, globally, with `whitelist` +
  `forbidNonWhitelisted` (see `dto-class-validator.md`).
- Reject unknown query params and body fields. Never silently drop them.
- Use `class-validator` constraints for everything. Don't add custom
  checks in the controller body.
- HTML in user content: store raw, escape on render in the frontend.
  In the backend, never `eval`, `Function(...)`, or `innerHTML` user
  input. If you need sanitization, do it explicitly with a tested lib
  (`sanitize-html`, `dompurify` server build) and document the allowed
  tags.
- File uploads: validate MIME + extension + size. Never trust the
  `Content-Type` header. Store outside the web root. Serve via signed
  URLs.

---

## 5. SQL & ORM safety

- Always go through Prisma's typed API. `$queryRaw` is allowed but:
  - Use tagged templates (`prisma.$queryRaw\`...\``), not string
    concatenation.
  - Every parameter must be a typed binding, not a string-built value.
  - Comment why raw SQL was necessary.
- Never use string concatenation in `$queryRawUnsafe` / `$executeRawUnsafe`.
- Don't use `prisma.$queryRaw` to "fix" something the typed API can do.

---

## 6. HTTP hardening

Install `helmet`:

```ts
import helmet from 'helmet';
app.use(helmet());
```

Default protections cover: HSTS, X-Content-Type-Options, X-Frame-Options,
Referrer-Policy, etc. If you need to relax one, document the reason.

Set explicit CORS:

```ts
app.enableCors({
  origin: config.get<string[]>('CORS_ORIGINS'), // explicit allowlist
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  maxAge: 600,
});
```

- `origin: '*'` + `credentials: true` is **forbidden** (browsers reject
  it anyway — and we won't ship code that relies on browser quirks).
- Reflect on every env change: dev origins are not prod origins.

Body size limits:

```ts
app.use(json({ limit: '100kb' }));
app.use(urlencoded({ limit: '100kb', extended: false }));
```

Set per-route overrides for file uploads.

---

## 7. Rate limiting and abuse

```bash
pnpm add @nestjs/throttler
```

```ts
ThrottlerModule.forRoot([{ name: 'short', ttl: 1000, limit: 5 }]),
```

Rules:

- Global throttle on `/auth/*` (login, register, password reset) — much
  stricter than the rest of the app.
- Per-IP **and** per-user (post-auth) throttling.
- Add a custom guard for high-value endpoints (e.g. password change,
  email change, payment).

---

## 8. Headers, cookies, CORS

- `Set-Cookie`: `HttpOnly; Secure; SameSite=Lax` (or `Strict` for
  highly sensitive flows). `Domain` and `Path` set deliberately.
- Never put JWTs in `localStorage` from a server-rendered response. The
  API returns them in the body, the SPA stores in memory + refresh flow.
- Don't expose internal headers. Don't return stack traces in 500
  responses in production. Use a custom `AllExceptionsFilter` that
  hides internals.

```ts
// main.ts
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## 9. Logging and PII

- Use `pino` (fast, structured) via `nestjs-pino`. Not the default Nest
  logger in hot paths.
- Redact sensitive fields explicitly:

```ts
import { LoggerModule } from 'nestjs-pino';
LoggerModule.forRoot({
  pinoHttp: {
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.refreshToken',
        'res.headers["set-cookie"]',
      ],
      remove: true,
    },
  },
});
```

- Never log full Prisma objects. Pick the fields you need.
- Audit log for security-relevant actions (login, role change, password
  change, payout change). Store `actorId`, `action`, `target`, `ip`,
  `userAgent`, `timestamp`.

---

## 10. Production hardening checklist

- [ ] `helmet` enabled
- [ ] CORS allowlist set (no `*`)
- [ ] `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`
- [ ] Auth guard applied by default; `@Public()` is opt-in
- [ ] Rate limiting on `/auth/*` and other sensitive routes
- [ ] Body size limit set
- [ ] Secrets loaded from env, validated at boot
- [ ] Passwords hashed with argon2id
- [ ] Refresh tokens stored as hashes, rotatable
- [ ] `pino` logger with redaction enabled
- [ ] Errors don't leak stack traces in prod
- [ ] Swagger UI gated or disabled in prod
- [ ] Database connection uses TLS in prod
- [ ] Dependencies pinned (`pnpm.overrides` / `pnpm-lock.yaml` committed)
      and `pnpm audit` is clean or exceptions documented

---

## 11. Dependencies and supply chain

- All deps pinned via the lockfile. Commit `pnpm-lock.yaml`.
- Run `pnpm audit --prod` in CI. Fail the build on `high`/`critical`
  unless an exception is documented with an expiry date.
- Renovate / Dependabot for routine bumps; security advisories trigger
  out-of-band upgrades.
- Never install a package to "just try it" in `main`. Try in a branch.

---

## 12. Incident response

If you suspect a breach:

1. Rotate secrets (`JWT_*`, `DATABASE_URL`, `REDIS_URL`, third-party
   keys).
2. Force-invalidate all sessions (bump a global `tokenVersion` or
   delete the refresh-token table).
3. Pull logs (with redaction) for the relevant window.
4. Write a postmortem. Even if it's a near-miss, the rules get updated.
