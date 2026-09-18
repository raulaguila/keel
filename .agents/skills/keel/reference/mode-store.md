# mode-store

Depth guide for **Store** mode: data plane concerns — migrations, tenancy, consistency, and query bounds.

Use when the target is schemas, repositories, migration trees, or a data service (PRODUCT platform `data`), or when critique categories Data / Cost dominate.

## Soft floors (critique)

From [baselines.md](baselines.md) — state “Store soft-floor applied”:

| Category | Soft floor (Good) | Block-merge if… |
|----------|-------------------|-----------------|
| Data integrity & migrations | ≥3 | Data ≤1 (unsafe migrations / no tenancy) |
| Performance & cost | ≥2 | — |

## Focus areas

### Migrations

- Expand/contract; no big-bang drops on hot tables ([migrate.md](migrate.md)).
- Lock risk and long backfills called out; rollback story per step.
- Make/CI/deploy actually run migrations ([ops-surfaces.md](ops-surfaces.md)).

### Tenancy

- Tenant (or equivalent) filter enforced at query construction or RLS — not only at the HTTP edge.
- Cross-tenant tests or explicit review on sensitive reads/writes.
- Shared DB across services only with a single owning boundary.

### Consistency

- Transaction boundaries match invariants; lost-update story (version, serializable, or explicit last-write).
- Dual-write windows named when cache/search/outbox lag the primary store.
- Read-your-writes vs eventual: document which APIs promise what.

### Query bounds

- Hard caps / pagination on list and export paths; no `SELECT *` on wide hot rows without need.
- Indexes match filter/join patterns on critical paths; N+1 closed or justified.
- Unbounded admin/report queries isolated or async (Process).

## Eng-floor emphasis

Data changes, Bounds, Authz (tenant isolation), Evidence (no invented QPS) from [eng-floor.md](eng-floor.md).

## Critique category tilt

Deep on **Data**, **Performance & cost**, **Security** (isolation); Contracts soft-weight if no external API (`n/a` only when truly no consumers).

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
