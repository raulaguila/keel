# mode-serve

Depth guide for **Serve** mode: request/response APIs where latency, authz, idempotency keys, pagination, and timeouts dominate.

Use when critique/shape/harden targets a synchronous HTTP/gRPC/GraphQL edge, or PRODUCT platform is `web-api` / `mobile-bff`.

## Soft floors (critique)

From [baselines.md](baselines.md) — state “Serve soft-floor applied” in the critique header:

| Category | Soft floor (Good) | Block-merge if… |
|----------|-------------------|-----------------|
| Reliability | ≥2 | — |
| Security | ≥2 | Security 0–1 on sensitive data |
| Contracts | ≥2 | — |

## Focus areas

### Latency

- Bound handler work; push heavy work to Process with an explicit handoff.
- Timeouts on every outbound dependency; cancellation propagated where the stack allows.
- No unbounded fan-out on the request path (`Promise.all` over whole tables, sync N+1).

### Authz

- Enforce at handler **and** at sensitive data access; denial tested for mutating and sensitive reads.
- Distinguish 401 / 403 / 404 policy; never leak existence via inconsistent empties on private resources without a deliberate choice.

### Idempotency keys

- User-safe retries on POST/PUT that create side effects: key header or natural idempotency (upsert).
- Document key TTL and conflict behavior in Contracts / surface brief.

### Pagination

- All list endpoints paginated or hard-capped; stable cursors preferred over brittle offsets on hot lists.
- Total counts optional; do not force full scans for `X-Total-Count` on large tables.

### Timeouts

- Server read/write deadlines; client timeouts ≤ server budget with margin.
- Dependency timeout < request budget; fail with named dependency errors (not empty catch).

## Eng-floor emphasis

Prioritize Authz, Bounds, I/O discipline, Idempotency, Failure naming from [eng-floor.md](eng-floor.md).

## Critique category tilt

When scoring Serve, dig deepest on **Contracts**, **Reliability**, **Security**; skim Organization only unless the handler graph is tangled.

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
