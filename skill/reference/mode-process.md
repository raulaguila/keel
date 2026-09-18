# mode-process

Depth guide for **Process** mode: queues, workers, batch, and async pipelines where throughput, idempotency, poison/DLQ, and prefetch dominate.

Use when the target is a consumer, cron/batch job, or outbox/relay — or PRODUCT platform is `worker`.

## Soft floors (critique)

From [baselines.md](baselines.md) — state “Process soft-floor applied”:

| Category | Soft floor (Good) | Block-merge if… |
|----------|-------------------|-----------------|
| Reliability | ≥3 | Reliability ≤1 (poison/timeouts missing) |
| Organization | ≥2 | — |

## Focus areas

### Queues & handoff

- Named owner for produce vs consume; payload schema versioned.
- Visibility timeout / ack aligned with max handler duration.
- Backpressure: what happens when the queue deepens (shed, delay, alert).

### Idempotency

- At-least-once is the default assumption — handlers must be safe under duplicate delivery (dedupe key, upsert, or ledger).
- Retries use the same idempotency story; poison after N attempts, not infinite loops.

### Poison / DLQ

- Explicit poison path: DLQ, parking lot, or dead-letter topic with inspect/replay runbook.
- Do not `catch` and ack failures that leave invariants half-applied.

### Prefetch / concurrency

- Prefetch and worker concurrency sized to downstream pools (DB, HTTP), not “max throughput” wishfully.
- Document saturation metrics (queue depth, processing lag, pool wait).

### At-least-once

- Dual-write / outbox if produce must commit with DB state.
- Side effects after durable claim; partial failure named in ARCHITECTURE Failure domains.

## Eng-floor emphasis

Idempotency, I/O discipline, Failure naming, Observability (queue depth / lag), Data changes when the job mutates stores ([eng-floor.md](eng-floor.md)).

## Critique category tilt

Deep on **Reliability**, **Operability**, **Organization** (job module boundaries); Contracts if event payloads are external; Security for privileged workers and webhook-driven enqueue.

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
