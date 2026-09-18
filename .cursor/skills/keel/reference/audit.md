# audit

Technical quality pass: correctness, security posture, reliability, observability — not a full product redesign.

## Scope

Resolve target paths. Read PRODUCT.md / ARCHITECTURE.md for constraints. Load [eng-floor.md](eng-floor.md) when you will edit.

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

---

## Close

End with **Next commands** per [next-commands.md](next-commands.md). Never finish silent.
