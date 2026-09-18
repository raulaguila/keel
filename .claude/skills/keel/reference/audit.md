# audit

**Does:** broad correctness/security/reliability/observability checklist.  
**Does not:** deep authz matrix (→ `secure`); deep telemetry design (→ `observe`); close critique backlog (→ `ship`).

Technical quality pass — not a full product redesign.

## Scope

Resolve target paths using [analysis-scope.md](analysis-scope.md) — skip Keel-owned / harness trees unless the user named them. Read PRODUCT.md / ARCHITECTURE.md for constraints. Load [eng-floor.md](eng-floor.md) when you will edit. Optional: `detect.js --json [--explain] <app-target>` for deterministic signals.

## Checklist (batch findings, then fix if asked)

1. **Authn/z** — middleware gaps, IDOR risks, admin routes, service-to-service trust
2. **Input** — validation bounds, size limits, SSRF/open redirects on outbound URL builders
3. **Reliability** — timeouts, retries (with jitter/budget), circuit breaking where appropriate, poison/DLQ
4. **Data** — transaction boundaries, lost updates, migration safety, tenancy filters
5. **Observability** — logs/metrics/traces on critical paths; high-cardinality label risks
6. **Dependencies** — pinned versions, abandoned libs on the request path, secret handling
7. **Concurrency** — races, lock scope, at-least-once double effects

## Rules

- Prefer actionable findings with file paths.
- Do not expand into greenfield architecture unless the audit proves the topology is unsafe.
- Security P0s: report before cosmetic nits.
- If the user only asked for report, do not edit.
