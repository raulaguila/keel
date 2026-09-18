# mode-store

**Lazy-load only** from full `/keel critique` (or shape) when mode is Store — not on every command.

Depth for **Store**: migrations, tenancy, consistency, query bounds.

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
