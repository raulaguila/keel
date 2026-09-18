---
name: keel
description: "Use when the user wants to design, review, score, or improve backend systems: APIs, services, workers, data models, architecture, performance, cost, reliability, organization, security, observability, migrations, capacity, and production readiness. Covers scored critique with engineering personas, ship/trend loops, doctor drift checks, deterministic detect, hooks, shape-before-build, harden, distill, extract, observe, secure, migrate, load. Not for frontend/UI-only design work."
---

This skill gives you permission and procedure to practice out-of-distribution **backend craft**: production-grade systems with clear boundaries, honest scale assumptions, bounded failure modes, and cost awareness — not tutorial-shaped microservices or hopeful architecture diagrams.

Core principles:
- Go all out on correctness and operability. Incomplete error paths are not “MVP.”
- Prefer evidence over vibes: code, schemas, traces, plans, bills — invent no SLOs, QPS, or budgets.
- Verify in bounded passes: change → inspect once (tests + static signals + one runtime path) → fix in one batch → confirm once → stop. Open-ended self-QA burns money.

## Setup

1. Run `node <skill-base-dir>/scripts/detect.js --json .` once when evaluating or shipping if the tree is not huge; keep cwd at the user’s project. `<skill-base-dir>` is the folder containing this SKILL.md.
2. If `PRODUCT.md` exists, read it. If `ARCHITECTURE.md` exists, read it. If `.keel/surfaces/` has a matching brief, read it. Do not invent missing sections.
3. Load the request’s playbook from the Commands table. For undescribed new systems: **shape** then build. Narrow fixes may proceed; offer `init` if PRODUCT.md is missing.
4. Immediately before editing implementation code, read [reference/eng-floor.md](reference/eng-floor.md). Skip for planning-only (`shape`, pure `critique`/`doctor` reporting).

**Missing context:** New service/boundary/replacement architecture without PRODUCT.md → `init` first (or ask once). Scoped bugfixes may proceed.

## How to engineer

- **The brief wins.** Honor pinned constraints even against fashionable patterns.
- **Refinement preserves; redesign replaces.** Never ship-fix a discarded topology.
- **Architecture authority is evidence, not a filename.**

## Modes

- **Serve** — request/response; latency, authz, correctness
- **Process** — jobs/queues/batch; throughput, idempotency, poison
- **Store** — data plane; consistency, migrations, query cost
- **Integrate** — webhooks/partners/events; contracts, retries
- **Control** — admin/orchestration; audit, least privilege

## Commands

| Command | Category | Description | Reference |
|---|---|---|---|
| `init` | Build | Capture durable product truth in PRODUCT.md | [reference/init.md](reference/init.md) |
| `document` | Build | Generate ARCHITECTURE.md from code | [reference/document.md](reference/document.md) |
| `shape [feature]` | Build | Plan APIs/data/boundaries before code | [reference/shape.md](reference/shape.md) |
| `extract [target]` | Build | Promote duplicated patterns to shared libs | [reference/extract.md](reference/extract.md) |
| `critique [target]` | Evaluate | Scored review: 8 grades /32, personas, trend | [reference/critique.md](reference/critique.md) · [personas.md](reference/personas.md) · [baselines.md](reference/baselines.md) |
| `audit [target]` | Evaluate | Correctness, security, reliability, observability | [reference/audit.md](reference/audit.md) |
| `cost [target]` | Evaluate | Cost drivers | [reference/cost.md](reference/cost.md) |
| `secure [target]` | Evaluate | Threat sketch + authz matrix | [reference/secure.md](reference/secure.md) |
| `observe [target]` | Evaluate | Telemetry gaps, cardinality, on-call signals | [reference/observe.md](reference/observe.md) |
| `doctor` | Evaluate | Drift between Keel artifacts and repo | [reference/doctor.md](reference/doctor.md) |
| `ship [target]` | Refine | Close critique backlog; production release gate | [reference/ship.md](reference/ship.md) |
| `organize [target]` | Refine | Package boundaries, dependency direction | [reference/organize.md](reference/organize.md) |
| `distill [target]` | Refine | Strip accidental complexity | [reference/distill.md](reference/distill.md) |
| `harden [target]` | Refine | Timeouts, retries, idempotency, authz | [reference/harden.md](reference/harden.md) |
| `migrate [target]` | Refine | Safe schema/API expand-contract | [reference/migrate.md](reference/migrate.md) |
| `optimize [target]` | Fix | Hot paths, N+1, contention | [reference/optimize.md](reference/optimize.md) |
| `clarify [target]` | Fix | Naming, contracts, errors, docs | [reference/clarify.md](reference/clarify.md) |
| `load [target]` | Fix | Capacity, load model, backpressure | [reference/load.md](reference/load.md) |
| `hooks …` | System | Detector hook admin | [reference/hooks.md](reference/hooks.md) |

Routing:

- **No argument:** [reference/routing.md](reference/routing.md); never auto-run.
- **Explicit/implied command:** load its reference. Alias: `polish` → `ship`.
- **Otherwise:** general backend work under Setup + eng-floor.

**Detect:** `node <skill-base-dir>/scripts/detect.js [--json] [path]` — exit 0 clean, 2 findings, 1 error.
