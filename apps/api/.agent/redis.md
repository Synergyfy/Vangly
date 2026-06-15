# Redis

> Redis is for **speed, coordination, and ephemeral state** — not for
> primary data. If you delete the Redis cluster, the service must still
> boot and serve correct data; it just becomes slower or loses features
> that are explicitly ephemeral (rate-limit windows, OTP codes).

---

## 1. Client setup

```bash
pnpm add ioredis
```

Single client per process, wrapped in a Nest provider:

```ts
// redis/redis.module.ts
import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: (): Redis =>
        new Redis(process.env.REDIS_URL!, {
          lazyConnect: false,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          // Don't let one bad command stall the app:
          connectTimeout: 5_000,
        }),
      // keep one per Node process; in cluster mode use a single client
      // per worker, not per request
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnApplicationShutdown {
  constructor() {}
  async onApplicationShutdown() {
    // handled by ioredis lifecycle, but be explicit
  }
}
```

Rules:

- One client per process. Not per request, not per service.
- `REDIS_URL` is in env, validated at boot (see `security.md` §1).
- Always set `maxRetriesPerRequest`. An unbounded retry will hang the
  app on a Redis outage.
- Use `tls: { rejectUnauthorized: true }` in any non-dev env.

---

## 2. Key naming

```
<service>:<version>:<domain>:<scope>:<id>
```

Examples:

- `harvite:v1:user:session:{userId}` (hash)
- `harvite:v1:post:hot:zset` (sorted set, no id)
- `harvite:v1:ratelimit:auth:ip:{ip}` (string with TTL)
- `harvite:v1:lock:invoice:create:{invoiceId}` (string with TTL)

Rules:

- Versioned (`v1`) so a future schema migration is just a key prefix
  change, not a code horror.
- Lowercase. Colons for hierarchy, no spaces.
- Never put PII (email, full name, phone) in a key. Use opaque IDs.

---

## 3. Caching

### When to cache

- Read-heavy, slow-to-compute, **tolerantly stale** data.
- The cache hit rate matters more than the cache complexity. If the
  compute is already 5ms, don't cache it.

### When not to cache

- Auth-critical, must-always-be-fresh reads (account balance, KYC
  status). Use a DB read with a short timeout instead.
- Writes. Writes go to the DB; cache invalidation runs after.

### Pattern: read-through with stampede protection

```ts
async function getUserProfile(userId: string) {
  const key = `harvite:v1:user:profile:${userId}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // Use a short lock to prevent the "thundering herd" on a cold key.
  const lockKey = `${key}:lock`;
  const got = await redis.set(lockKey, '1', 'EX', 5, 'NX');
  try {
    if (got) {
      const fresh = await prisma.user.findUnique({ where: { id: userId } });
      if (fresh) {
        await redis.set(key, JSON.stringify(fresh), 'EX', 300);
      }
      return fresh;
    }
    // Another worker is filling it; back off and re-read.
    await sleep(50);
    const refilled = await redis.get(key);
    return refilled ? JSON.parse(refilled) : prisma.user.findUnique({ where: { id: userId } });
  } finally {
    if (got) await redis.del(lockKey);
  }
}
```

### Invalidation

- On write, **invalidate the affected keys explicitly**. Don't try to
  be clever with TTLs alone.
- Prefer `DEL` of a known list of keys over glob-delete (`KEYS`, `SCAN`
  in a loop) in hot paths. `SCAN` is fine for cron/maintenance.
- Use **versioning** for the cheap nuclear option: bump
  `harvite:v1:user:profile:version` and embed the version in the key.
  Old entries become unreachable and TTL-evict themselves.

---

## 4. Distributed locks

For "only one worker does X" use `SET key val NX EX <ttl>`.

```ts
async function withLock<T>(key: string, ttlSec: number, fn: () => Promise<T>): Promise<T> {
  const token = crypto.randomUUID();
  const ok = await redis.set(`harvite:v1:lock:${key}`, token, 'EX', ttlSec, 'NX');
  if (!ok) throw new ConflictException('resource busy');
  try {
    return await fn();
  } finally {
    // Compare-and-delete to avoid releasing someone else's lock.
    const lua = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      end
      return 0`;
    await redis.eval(lua, 1, `harvite:v1:lock:${key}`, token);
  }
}
```

Rules:

- Always set a TTL. A lock without TTL is a lock that survives forever
  after a crash.
- The work inside the lock must be idempotent and **must finish before
  the TTL**.
- Don't `await` user input inside a lock.

For a real system, prefer **Redlock** (multiple independent Redis
nodes) or a proper coordination service (ZooKeeper, etcd, Postgres
advisory locks). Single-Redis locks are best-effort.

---

## 5. Idempotency keys

For non-idempotent operations (payments, webhooks, "create charge"):

- Accept an `Idempotency-Key` header on POST / expensive endpoints.
- Store `{key -> response}` in Redis with a 24h TTL.
- On replay, return the stored response, do not re-execute.

```ts
const cacheKey = `harvite:v1:idem:${route}:${key}`;
const hit = await redis.get(cacheKey);
if (hit) return JSON.parse(hit);
const result = await handler(req);
await redis.set(cacheKey, JSON.stringify(result), 'EX', 86_400);
return result;
```

---

## 6. Rate limiting

Use Redis for cluster-wide throttling. Counter pattern:

```lua
-- INCR + EXPIRE in one round trip
local cur = redis.call("INCR", KEYS[1])
if cur == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
return cur
```

Key: `harvite:v1:ratelimit:<scope>:<id>`. Scope = route family. ID = user
id post-auth, IP pre-auth.

Apply stricter limits on `/auth/*` (see `security.md` §7).

---

## 7. Queues and background work

If you need durable background jobs, use BullMQ on top of Redis:

```bash
pnpm add @nestjs/bullmq bullmq
```

Rules:

- Jobs are **at-least-once**. Handlers must be idempotent (use the
  idempotency key from §5 or a job id).
- Set `attempts`, `backoff`, and a `removeOnComplete`/`removeOnFail`
  policy per queue. Don't let failed jobs pile up forever.
- Never put secrets in the job payload. Pass IDs and re-load from the DB.

---

## 8. Pub/Sub and events

- Redis Pub/Sub is **fire-and-forget**. If a subscriber is down, the
  message is gone. Use it for cache invalidation hints and live
  notifications, not for durability.
- For durable eventing, write to the DB (outbox pattern) and have a
  worker publish from there.

---

## 9. Observability

- Emit metrics: `redis.connections`, `redis.ops{op}`, `redis.latency`,
  `redis.errors{type}`.
- Track key cardinality per prefix; runaway key creation is a common
  leak.
- Track memory (`INFO memory`); set `maxmemory` and a policy
  (`allkeys-lru` is the safe default for caches).
- Log slow commands (`SLOWLOG GET 10`) at boot and on alerts.

---

## 10. Failure modes — what you must handle in code

| Failure | What you must do |
| --- | --- |
| Redis is down at boot | Crash. Do not silently degrade on a config you depend on. |
| Redis is down at runtime (cache use) | Treat as cache miss, fall back to DB. Log a metric. |
| Redis is down at runtime (lock / rate-limit) | Fail closed (reject the request) for sensitive paths. Fail open only with a metric + alert. |
| Redis returns `WRONGTYPE` | Bug in your key naming. Crash in dev; alert and quarantine the key prefix in prod. |
| Clock skew | Don't rely on `TIME`. Use Redis `EXPIRE` and the client's monotonic clock for short windows only. |

---

## 11. Anti-patterns

- Using Redis as a primary datastore for anything you can't lose.
- Storing JWT access tokens in Redis to "make logout work" — store a
  revocation list of token IDs or a per-user `tokenVersion`.
- One Redis client per request (`new Redis()` inside a service method).
- `KEYS *` in any code path that runs per request. Use `SCAN`.
- Long-lived keys with no TTL. Every key must have a TTL or be on a
  data structure that evicts (`ZSET` with `ZREMRANGEBYRANK`, `HASH`
  with a janitor, `STREAM` with `MAXLEN`/`XTRIM`).
- Storing serialized Buffers / huge blobs. Redis is not a blob store.

---

## 12. Checklist for adding Redis to a feature

- [ ] Key name follows `<service>:<version>:<domain>:<scope>:<id>`
- [ ] TTL is set on every key
- [ ] PII is not in keys (use IDs)
- [ ] Failure mode is decided (fail open / fail closed) and documented
- [ ] Invalidation strategy is implemented, not just "hoping for TTL"
- [ ] Idempotency / lock semantics are correct (compare-and-delete,
      unique tokens)
- [ ] Metrics emitted: hit rate, miss rate, latency, errors
- [ ] Tested with Redis disabled in dev to confirm graceful degradation
