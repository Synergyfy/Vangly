# Querying Prisma Without N+1

> The N+1 problem in a NestJS+Prisma app is almost always "I iterated in
> TypeScript instead of letting the database join." Every time you see a
> `for (const x of xs)` followed by a Prisma call, treat it as a code
> smell and prove it's not N+1.

---

## 1. What N+1 looks like

```ts
// BAD — 1 + N queries
const users = await prisma.user.findMany();
for (const u of users) {
  u.posts = await prisma.post.findMany({ where: { authorId: u.id } });
}
```

```sql
SELECT * FROM "User";
SELECT * FROM "Post" WHERE "authorId" = $1; -- user 1
SELECT * FROM "Post" WHERE "authorId" = $1; -- user 2
... N more
```

The fix is to let the database do the join in **one** round trip.

---

## 2. Eager loading with `include` / `select`

```ts
// GOOD — 1 query
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

`include` returns the relation in the same shape. Use it when you always
need the relation.

### Be specific about what you include

```ts
// BAD — pulls every column of every comment
const posts = await prisma.post.findMany({
  include: { comments: true },
});

// GOOD — explicit projection
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    createdAt: true,
    author: { select: { id: true, displayName: true } },
    comments: {
      select: { id: true, body: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
});
```

Rules:

- **Always `select`.** Default selects are a footgun in large schemas.
- Cap nested `take` (e.g. latest 5 comments). If the client wants more,
  paginate with a separate query (see §5).
- Cap nested depth. More than 2 levels deep is almost always a design
  smell.

---

## 3. Nested filters with `where`

```ts
const users = await prisma.user.findMany({
  where: { posts: { some: { published: true } } },
  select: { id: true, email: true },
});
```

Useful when "users with at least one published post" is the actual
question.

---

## 4. Loading by parent IDs in one shot (the "2-query" pattern)

Sometimes `include` over-fetches because the relation cardinality is
unbounded. Use a single `findMany` keyed on a list of IDs:

```ts
// 1. Get the parents
const orders = await prisma.order.findMany({
  where: { customerId: customerId },
  select: { id: true, total: true, createdAt: true },
});

// 2. Get all the items in ONE query
const orderIds = orders.map((o) => o.id);
const items = await prisma.orderItem.findMany({
  where: { orderId: { in: orderIds } },
  select: { id: true, orderId: true, sku: true, qty: true, price: true },
});

// 3. Stitch in memory
const itemsByOrderId = new Map(items.map((i) => [i.orderId, [] as typeof items]));
for (const i of items) itemsByOrderId.get(i.orderId)!.push(i);

const result = orders.map((o) => ({ ...o, items: itemsByOrderId.get(o.id) ?? [] }));
```

Two round trips total, regardless of how many orders. This is the
canonical replacement for an N+1.

Helper:

```ts
// common/group-by.ts
export function groupBy<T, K extends keyof any>(
  items: T[],
  key: (item: T) => K,
): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const it of items) {
    const k = key(it);
    const arr = out.get(k);
    if (arr) arr.push(it);
    else out.set(k, [it]);
  }
  return out;
}
```

---

## 5. Cursor / keyset pagination, not `skip`

```ts
// BAD — slow on big tables; one COUNT(*) + one SELECT each time
const page = await prisma.post.findMany({ skip: offset, take: limit });

// GOOD — keyset; O(log n) regardless of page depth
const page = await prisma.post.findMany({
  where: { createdAt: { lt: cursor } },
  orderBy: { createdAt: 'desc' },
  take: limit + 1, // +1 to know if there's a next page
});
```

`take: limit + 1` and slice off the last item to compute `nextCursor`
without a separate count query.

If you must return a total, do it in parallel and don't block the page:

```ts
const [rows, total] = await Promise.all([
  prisma.post.findMany({ /* ... */ }),
  prisma.post.count({ where }),
]);
```

---

## 6. Aggregations in the DB, not in Node

```ts
// BAD
const posts = await prisma.post.findMany();
const total = posts.reduce((s, p) => s + p.viewCount, 0);

// GOOD
const { _sum, _count } = await prisma.post.aggregate({
  _sum: { viewCount: true },
  _count: { _all: true },
  where: { authorId },
});
```

For grouped aggregates:

```ts
const byDay = await prisma.post.groupBy({
  by: ['publishedAtDay'], // use $queryRaw if you need date_trunc
  _count: { _all: true },
  where: { authorId, publishedAt: { gte: from } },
  orderBy: { publishedAtDay: 'asc' },
});
```

---

## 7. Avoiding runaway includes

The classic blow-up: `User { posts { comments { author { posts ... } } } }`.

Hard rules:

- Max 2 levels of `include` by default.
- For deeper reads, use a separate, **explicit** endpoint per level.
- Never `include` a relation whose cardinality is unbounded without a
  `take`.

---

## 8. `findUnique` vs `findFirst`

- `findUnique` requires a unique field and is a single PK/unique lookup.
  Use it when you can.
- `findFirst` is a normal query. Prisma translates it differently and
  sometimes worse. Default to `findUnique` for `where: { id }`.

---

## 9. Transactions when you need consistency, not parallelism

```ts
// BAD — two writes, not atomic; partial failure leaves orphan data
const user = await prisma.user.create({ data: userData });
await prisma.profile.create({ data: { userId: user.id, ... } });

// GOOD — single transaction
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const profile = await tx.profile.create({ data: { userId: user.id, ... } });
  return { user, profile };
});
```

For independent reads (read-only across multiple tables), prefer
`$transaction([...])` (array form) for parallelism, or use
`Promise.all` on the prisma client directly (still on the same connection
pool).

For mixed read/write, the interactive form is the safe default.

Isolation level: only override `isolationLevel` if you actually know you
need SERIALIZABLE — it's a footgun for throughput.

---

## 10. `select` over `include` when you only need counts

```ts
// BAD
const users = await prisma.user.findMany({ include: { _count: { select: { posts: true } } } });

// GOOD if that's the only field
const rows = await prisma.user.findMany({
  select: { id: true, _count: { select: { posts: true } } },
});
```

---

## 11. Detect N+1 in review and in CI

### In review

- Search for `for (const ... of` near `prisma.` calls.
- Search for `.map(async` and `.forEach(async`.
- Any function whose name is `*WithRelations` / `*AndChildren` is
  suspect.

### In dev

- Enable Prisma query logging and read it:

```ts
new PrismaClient({ log: ['query', 'warn', 'error'] });
```

- Add a "warn on > N queries per request" interceptor for dev:

```ts
// prisma/query-counter.interceptor.ts (dev only)
const QUERY_LIMIT = 30;
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV !== 'production' && /* counter > QUERY_LIMIT */) {
    console.warn(`[prisma] ${e.duration}ms ${e.query}`);
  }
});
```

If a single request fires > 30 queries, it has an N+1.

---

## 12. Checklist before merging a service

- [ ] No `for`/`map`/`forEach` around a Prisma call
- [ ] Every `findMany` uses `select` (no default selects)
- [ ] Every nested `include` is bounded by `take`
- [ ] Pagination is keyset or small-offset, not `skip(100000)`
- [ ] Aggregations run in DB
- [ ] Writes that must be atomic are in `$transaction`
- [ ] Dev query log shows ≤ 10 queries per typical request
