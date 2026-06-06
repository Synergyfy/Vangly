# Performance Optimization

> Speed is a feature. But speed comes from **discipline**, not from
> clever one-liners. The rules below are ordered from highest leverage
> (do these first) to lowest.

---

## 1. The performance budget

Every endpoint has a budget. Write it down in the PR or in the code:

| Endpoint class | Target p50 | Target p95 | DB queries |
| --- | --- | --- | --- |
| Health / readiness | < 10 ms | < 50 ms | 0 |
| Auth (login/refresh) | < 150 ms | < 500 ms | 1–3 |
| Read (list with pagination) | < 100 ms | < 300 ms | 1–2 |
| Read (single resource) | < 50 ms | < 150 ms | 1 |
| Write (simple) | < 150 ms | < 400 ms | 1–2 |
| Write (complex, transactional) | < 300 ms | < 800 ms | 2–5 |
| Search | < 250 ms | < 700 ms | 1 + index lookup |

If a PR blows the budget, that's part of the description: how you
measured, what you tried, and what's left.

---

## 2. Measure before you optimize

- Add `nestjs-pino` with request timing. Every request gets a
  `responseTime`.
- Emit per-endpoint p50/p95/p99 to your metrics backend (Prometheus,
  Datadog, OTel).
- Tag with `route`, `method`, `status`, `userAgentFamily`.
- Profile DB queries with `prisma:query` logs in dev; in prod, sample
  the slow ones (`duration > 100ms`).
- Use `clinic.js` or `0x` for CPU profiles when a hot path is
  mysterious.

**Rule: no PR with "made it faster" without a before/after number.**

---

## 3. The database (usually your bottleneck)

### Indexes

- Add an index for **every** field you `WHERE`, `ORDER BY`, or `JOIN` on
  in a hot path.
- Composite indexes: column order = equality first, then range, then
  sort.
- Foreign keys: index them. Prisma doesn't do it for you.
- Don't over-index. Every index slows writes and uses memory.
- Verify with `EXPLAIN ANALYZE` before and after adding the index.

### Query shape

- `select` only the columns you return. No default `SELECT *`.
- Use `findUnique` over `findFirst` when you can.
- Use keyset pagination, not `skip`/`offset` (see
  `prisma-no-n-plus-1.md` §5).
- Aggregate in the DB (`.aggregate`, `.groupBy`).
- Use `$queryRaw` only when the typed API can't express the query
  efficiently, and always with tagged templates.

### Connection pool

- Set `connection_limit` on the Prisma datasource URL sensibly for your
  Postgres sizing. Start at `num_apps_instances * ~10`, tune from
  there.
- Don't `new PrismaClient()` per request.
- Use PgBouncer in **transaction** mode (not session) if you need many
  app instances per DB. Note: prepared statements and `$queryRaw`
  sessions break under session-pooling — use transaction mode.

---

## 4. Caching layers (in order of cost)

| Layer | Use it for | Notes |
| --- | --- | --- |
| HTTP cache headers (`Cache-Control`, `ETag`) | Public, immutable resources | Free. Do this first. |
| In-process LRU (`lru-cache`) | Hot config, per-request hot paths | Per-instance, not shared. |
| Redis | Shared read cache, rate limits, sessions, locks | See `redis.md`. |
| Edge / CDN | Static assets, public GETs | Outside the app, but app must send the right headers. |

Don't put something in Redis if HTTP cache headers would do.

---

## 5. Payload size

- Return small objects. Strip the relations you don't need.
- Use field selection in GraphQL-style APIs; for REST, define a
  `?fields=` allowlist for high-traffic endpoints.
- Compress responses: `compression` middleware with `gzip` (and
  consider `brotli` via a reverse proxy).
- Pagination caps: never let a client ask for `limit=1000000`. Cap at
  100 by default.

```ts
@Get()
list(@Query() q: FindUsersQueryDto) { /* q.limit <= 100 enforced in DTO */ }
```

- For binary payloads, stream from disk/S3 rather than buffering in
  memory. `StreamableFile` in Nest.

---

## 6. Concurrency and async

- For independent I/O, use `Promise.all`. Don't `await` serially.
- For CPU-bound work, offload to a worker thread (`worker_threads` or
  `BullMQ` with a concurrency setting).
- Don't block the event loop with sync crypto, sync FS, or big
  `JSON.parse` of multi-MB strings. If you must, push it to a worker.
- Backpressure: if you consume a stream (S3, Kafka, HTTP), respect
  `highWaterMark` and don't accumulate everything in memory.

---

## 7. Serialization and JSON

- Avoid huge `JSON.stringify` of multi-MB objects on a hot path. Cache
  the stringified form, or stream NDJSON.
- `class-transformer` is fast enough for normal DTOs; don't serialize
  the same object 5 times per request — build the response object once.
- Don't return `Date` as a raw `Date` over the wire without a stable
  format. Use ISO 8601 strings, set globally:

```ts
@SerializeOptions({ })
class AppInterceptor implements NestInterceptor { /* see below */ }
```

Or normalize in the entity layer (see `dto-class-validator.md` §7).

---

## 8. Logging and observability cost

- Use `pino` over the default Nest logger. It is ~5x faster.
- Don't log at `info` level in hot paths; log at `debug` and turn it on
  per-route in prod via sampling.
- Sample slow queries, don't log every query in prod.
- Tracing (OpenTelemetry) is on for spans that matter (HTTP, DB, Redis,
  outbound HTTP). Don't trace `Math.random`.

---

## 9. App config that affects speed

- Run with `node --enable-source-maps` off in prod (or strip with
  `tsc` build). Source maps in prod slow stack frame capture.
- Build with `tsc` and `swc` for fast startup; the Nest CLI default is
  fine but `swc` is faster for watch mode.
- `NODE_ENV=production` in prod. Express's `dev` mode error handler
  is materially slower than the prod one.
- Set `trust proxy` correctly when behind a load balancer so
  `req.ip` and rate limiting work, but don't set it on a server
  exposed directly to the internet.
- Tune `keepAliveTimeout` / `headersTimeout` on the underlying HTTP
  server. Defaults are fine; verify with a load test.

```ts
const app = await NestFactory.create(AppModule, { bufferLogs: true });
const server = await app.listen(process.env.PORT ?? 3000);
server.keepAliveTimeout = 65_000; // > ALB idle timeout
server.headersTimeout = 66_000;
```

---

## 10. Framework-level traps

- Don't call `app.get(...)` inside a hot path to look up a provider.
  Inject it.
- Don't use `@nestjs/config` to read env vars in a request handler;
  read them once at boot, inject the typed config.
- `useGlobalGuards` / `useGlobalPipes` are fine; `useGlobalFilters`
  with a `Reflector` is fine. Don't reflect metadata per request in
  custom decorators without reason.
- Avoid deep `class-validator` chains on huge objects. Validate a
  smaller, focused DTO.

---

## 11. Load testing

- Smoke load test in CI: `autocannon`, `k6`, or `vegeta` against the
  staging URL on every release.
- Real load test before any "we doubled traffic" event: ramp to 2x
  expected peak, hold for 10 minutes, watch p95, error rate, DB CPU,
  Redis CPU, memory.
- Capture flamegraphs for the slowest endpoints quarterly, even if
  nothing is on fire. Trends matter more than snapshots.

---

## 12. Common "fast-looking" mistakes

- "I added `cache: true` to Prisma" without thinking about staleness or
  invalidation. You will serve 30-day-old data to a user.
- "I made the query async" — it was already async. You did nothing.
- "I moved it to a worker thread" without measuring; the new overhead
  can be larger than the work.
- "I added an index" without `EXPLAIN`. Sometimes the planner ignores
  it, or it duplicates an existing one.
- "I used `SELECT *` but limited rows" — `SELECT *` is the slow part on
  wide tables, not `LIMIT`.
- "I batched with a `Promise.all` of 1000 Prisma calls" — you made
  1000 round trips in parallel; you didn't batch the SQL.

---

## 13. Checklist for a new endpoint

- [ ] `pnpm prisma migrate dev` ran if schema changed; index added
- [ ] Query uses `select`, not default
- [ ] No N+1 (see `prisma-no-n-plus-1.md`)
- [ ] Pagination is keyset or small-offset, capped
- [ ] Caching decided: HTTP headers / in-process / Redis / none
- [ ] Cache invalidation implemented
- [ ] Hot-path logging is `debug`, not `info`
- [ ] Independent I/O is `Promise.all`'d
- [ ] p95 measured locally (`autocannon` or equivalent) and noted in PR
- [ ] No new N+1 surfaced in dev query log
