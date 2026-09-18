# Engineering floor

Load after direction is settled, before implementation edits. Do not announce the checklist. A pinned brief overrides category defaults; your habit does not.

## Verify

Checks on the **built** result (or the concrete change set), not intentions. Batch them in one inspection round.

- **Authz:** every mutating path and sensitive read enforces authorization; tests or explicit review cover denial.
- **Bounds:** list endpoints and queries are paginated or hard-capped; no unbounded in-memory table loads.
- **I/O discipline:** outbound calls have timeouts, cancellation, and explicit error mapping; no fire-and-forget on the request path without a documented owner.
- **Idempotency:** retried producers/consumers and user-safe retries are idempotent (keys, upserts, or dedupe store).
- **Failure naming:** errors distinguish client vs server vs dependency; no empty catch / swallow.
- **Data changes:** migrations are expand/contract or have a documented rollback; dual-write windows are explicit.
- **Observability:** structured logs with correlation ids; no secrets/PII in logs; critical paths have metrics or traces named in ARCHITECTURE.md conventions.
- **Evidence:** claims about latency, QPS, or cost cite PRODUCT.md, measurements, or are labeled assumptions.
- **Doc sync:** if boundaries, contracts, data, failure, observe, or delivery changed, patch `ARCHITECTURE.md` / surface briefs / PRODUCT facts in this same pass — [doc-sync.md](doc-sync.md). Structural change with no doc update = incomplete batch.
- **Ops surfaces:** when Makefile, Dockerfile/Compose, or migrations exist for the touched path, confirm Delivery still matches how the change is built/migrated/run — [ops-surfaces.md](ops-surfaces.md).

## Refuse

Category defaults — rewrite the element if you reached for one with a free axis. The brief can earn exceptions; inventing numbers cannot.

- God packages, circular domain imports, or “utils” that import the world.
- New microservice (or new data store) without an ownership and failure story in ARCHITECTURE.md.
- Shared database across independently deployable services without a single owning boundary.
- Catch-all handlers that hide root causes.
- `SELECT *`, unbounded fan-out (`Promise.all` over whole tables), or N+1 query loops left as-is on hot paths.
- Invented SLOs, scale, or budget figures not in PRODUCT.md / evidence.
- Secrets, tokens, or private keys in source, fixtures committed as real, or logs.
- Abstraction layers (generic repository, DI ceremony, event bus) with fewer than two real call sites.
- Chatty cross-service request chains for one user action when an in-process or async boundary would do.
- Silent schema changes that break consumers without a compatibility plan.
