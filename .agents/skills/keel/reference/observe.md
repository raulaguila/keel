# observe

Close observability gaps on a target path: logs, metrics, traces, cardinality, and on-call usefulness.

## Flow

1. Read ARCHITECTURE.md Observability section + PRODUCT scale/SLO (Unknown stays Unknown).
2. Map the critical path (request or job). Note existing log/metric/trace usage.
3. Gap checklist:
   - Correlation / request / trace ids on the path
   - Success/error/latency metrics with low-cardinality labels
   - Span or equivalent around outbound I/O
   - Structured logs (no secrets/PII)
   - Saturation signals (queue depth, pool wait)
   - Runbook-worthy error messages
4. Add the smallest instrumentation consistent with existing stack (OpenTelemetry, statsd, etc.). Do not introduce a second observability vendor without asking.
5. Load eng-floor before edits. Document new metric names in ARCHITECTURE.md.

## Refuse

- High-cardinality labels (user id, email, full URL) on metrics
- Logging bodies that may contain secrets/PII
- Inventing SLO targets not in PRODUCT.md

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`).
