# Prisma Migrations

> **Rule of thumb:** schema changes go through **migrations**, never
> `db push`, in any environment that is shared with another human or that
> is used for staging/production.

---

## 1. The golden rule: `migrate dev` is for local, `migrate deploy` is for CI/prod

| Command | When | Why |
| --- | --- | --- |
| `pnpm prisma migrate dev` | Local development, your own DB | Creates a migration file, applies it, regenerates client. **Allowed.** |
| `pnpm prisma migrate dev --name <name>` | Same as above, with a name | **Required** — never let Prisma auto-name migrations. |
| `pnpm prisma migrate deploy` | CI, staging, production | Applies pending migrations. No prompts, no resets, no client regen surprises. |
| `pnpm prisma migrate reset` | Local only, when you actually want a wipe | Requires `--force`. Never in shared envs. |
| `pnpm prisma db push` | **Banned** in any shared env | Skips migration history, drifts schema from source of truth, kills prod parity. |

> If you catch yourself typing `db push` against anything other than your
> local disposable DB, stop. See [§7 Escape hatches](#7-escape-hatches).

---

## 2. Local workflow

```bash
# 1. Edit prisma/schema.prisma
# 2. Create a migration
pnpm prisma migrate dev --name add_user_avatar_url
# 3. Commit:
#    - prisma/schema.prisma
#    - prisma/migrations/<timestamp>_add_user_avatar_url/migration.sql
# 4. Run the app locally and confirm.
```

Things to check before committing the migration:

- [ ] The generated SQL is the SQL you intended (read it!).
- [ ] No `DROP COLUMN` of data you still need.
- [ ] New columns are either `nullable`, have a `DEFAULT`, or the migration
      backfills them in the same file.
- [ ] New indexes exist for any new foreign key or new queryable column
      (see [§6 Indexes](#6-indexes)).
- [ ] The migration is **forward-only**. If you need a rollback, write a
      second migration; do not edit history.

---

## 3. CI / staging / production workflow

```bash
# In the deploy pipeline, before app start:
pnpm prisma migrate deploy
pnpm prisma generate   # only if client types are needed at build time
```

Rules:

- **Never** run `migrate dev` in CI. It is interactive and can reset data.
- **Never** run `migrate reset` outside your local machine.
- Migrations are applied **before** the new app version is rolled out.
- The deploy must fail loudly if a migration fails. Do not swallow errors.
- Keep a `prisma/migrations/` folder in the repo. **Do not** gitignore it.

---

## 4. Naming conventions

- Migration name: `snake_case`, imperative, scoped.
  - Good: `add_user_avatar_url`, `create_post_tag_table`, `drop_legacy_session_index`
  - Bad: `updates`, `fix`, `asdf`, `addedStuff`
- One logical change per migration. Don't bundle a schema rename with a
  data backfill in the same file unless they must be atomic.

---

## 5. Authoring safe migrations

### 5.1 Adding a non-null column to a large table

```sql
-- 1. Add as nullable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
-- 2. Backfill in batches (see snippet below)
-- 3. Then a follow-up migration:
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;
```

Batched backfill example (run in app code, not raw SQL in prod):

```ts
async function backfillPhone(batchSize = 1000) {
  let skip = 0;
  for (;;) {
    const updated = await prisma.$executeRaw`
      UPDATE "User" SET "phone" = '' WHERE "phone" IS NULL
      AND "id" IN (
        SELECT "id" FROM "User" WHERE "phone" IS NULL LIMIT ${batchSize}
      )
    `;
    if (updated < batchSize) break;
    skip += batchSize;
  }
}
```

### 5.2 Renaming a column or table

Prisma will offer to "create + drop" by default. Reject that and tell
Prisma to `create + migrate` so history is preserved:

```bash
pnpm prisma migrate dev --name rename_user_name_to_full_name
# If prompted, choose "Create a migration with my edits" and edit the SQL.
```

### 5.3 Dropping a column / table

Two-step:

1. Migration 1: stop reading from it in code, ship.
2. Migration 2 (later, after a soak): drop the column.

Don't ship a code change and a destructive migration in the same release
unless you control the deploy order 100% (you don't, in most setups).

---

## 6. Indexes

Every new field you query on must have a reason for its index status:

- Foreign keys: index them. Prisma does **not** do this automatically.
- Fields used in `where` / `orderBy` on hot paths: index them.
- Composite indexes: use `@@index([a, b])` in the same order as the query.
- Don't index `Boolean` flags with skewed distributions, `JSON` blobs, or
  low-cardinality text.

If you add an index, justify it in the PR (which query uses it).

---

## 7. Escape hatches

There are exactly two.

1. **Local throwaway DB**: `prisma db push` is fine. Document it in the
   commit message ("local-only schema sync, no migration").
2. **Brand-new project, no prod data yet**: `migrate dev` only, and you
   still commit the generated `migrations/` folder from day one so you
   never have to migrate from `db push` to `migrate` later.

If you think you need a third escape hatch, write the PR first and ask.

---

## 8. What "done" looks like for a schema PR

- [ ] `prisma/schema.prisma` updated
- [ ] `pnpm prisma migrate dev --name <good_name>` run
- [ ] Generated SQL reviewed
- [ ] `prisma/migrations/<timestamp>_*/migration.sql` committed
- [ ] App boots, smoke test passes
- [ ] Indexes added/justified
- [ ] Backfill script included if a non-null column was added to an
      existing table
- [ ] PR description links to this file
