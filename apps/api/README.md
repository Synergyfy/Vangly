# Harvite Backend

REST API for the Harvite church-management platform.

## Stack

- NestJS 11 + Express
- Prisma 7 + PostgreSQL
- Pino structured logging
- Joi env validation
- Helmet, Throttler, ThrottlerModule
- Swagger at `/docs`

## Project setup

```bash
pnpm install
cp .env.example .env   # then edit secrets
pnpm exec prisma migrate dev
```

## Run

```bash
# development
pnpm start

# watch mode
pnpm start:dev

# production
pnpm start:prod
```

## Test

```bash
pnpm test          # unit + integration (uses real DB)
pnpm test:e2e      # e2e suite
pnpm test:cov      # coverage
pnpm lint          # eslint --fix
```

## Environment

All env vars are validated against `src/config/env.validation.ts`. The server
aborts on boot if a required secret is missing or too short (JWT secrets must
be ≥ 32 chars).

| Var | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | yes | – | Postgres connection string |
| `JWT_ACCESS_SECRET` | yes | – | min 32 chars |
| `JWT_REFRESH_SECRET` | yes | – | min 32 chars |
| `JWT_ACCESS_TTL` | no | `15m` | access-token TTL |
| `JWT_REFRESH_TTL_DAYS` | no | `7` | refresh-token TTL in days |
| `PORT` | no | `3000` | HTTP port |
| `CORS_ORIGINS` | no | `http://localhost:3000` | comma-separated allowlist |
| `LOG_LEVEL` | no | `info` | `trace|debug|info|warn|error|fatal` |
| `NODE_ENV` | no | `development` | `production` enables stricter CORS |

## API surface

All endpoints (except `/f/*`, `/auth/*`, `/docs`) require a Bearer access
token. The auth middleware also exempts `POST /f/:publicId` and
`POST /f/:publicId/track` for public form interaction.

See the full surface in [`docs/manage-organization.md`](docs/manage-organization.md)
and the live Swagger at <http://localhost:3000/docs>.

### Quick links

- **Auth** – `/api/auth/start-onboarding`, `/api/auth/save-account`, … (existing)
- **Locations** – `GET/POST/PATCH/DELETE /api/locations[/:id]`, `GET /api/locations/:id/dashboard`
- **Teams** – `POST /api/locations/:locationId/teams`, `GET /api/teams/:teamId`
- **Members** – `GET/POST /api/locations/:locationId/members`, `POST /api/members/:memberId/transfer`
- **Forms** – `POST /api/teams/:teamId/forms`, `GET /api/forms/:formId/responses`
- **Public forms** – `GET /f/:publicId`, `POST /f/:publicId`, `POST /f/:publicId/track`
- **Jobs** – `GET /api/jobs/:jobId` (poll long-running imports)

## Architecture

- `src/auth/` – JWT + onboarding + RBAC
- `src/common/` – filters, guards, decorators, utils (PIN policy, hash, nano-id, paginated response, field validators, request helpers)
- `src/infra/` – cross-cutting services (audit log, mocked SMS, in-memory job queue, storage URL resolver, throttler config, logger config, swagger config)
- `src/modules/` – feature modules (`locations`, `teams`, `members`, `forms`, `public-forms`, `jobs`)
- `src/config/` – Joi validation schema
- `prisma/` – schema + migrations

## Production TODOs (deliberately deferred)

- Replace in-memory throttler storage and job queue with Redis + BullMQ
- Replace mocked SMS with a real Twilio/Africa's-Talking client
- Replace mocked scan-token store with Redis (TTL)
- Migrate PIN storage from sha256 to argon2id
- Move file uploads off the frontend CDN into signed-URL multipart endpoints if usage requires
