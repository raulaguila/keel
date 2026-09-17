---
name: keel
description: "Use when the user wants to design, review, or improve backend systems: APIs, services, workers, data models, architecture, performance, cost, reliability, organization, security posture, observability, and production readiness. Covers shape-before-build, architecture critique, technical audit, cost analysis, package boundaries, hardening (timeouts, retries, idempotency, authz), distill/simplify, optimize hot paths, and clarify contracts. Not for frontend/UI-only design work."
---

This skill gives you permission and procedure to practice out-of-distribution **backend craft**: production-grade systems with clear boundaries, honest scale assumptions, bounded failure modes, and cost awareness — not tutorial-shaped microservices or hopeful architecture diagrams.

Core principles:
- Go all out on correctness and operability. Incomplete error paths are not “MVP.”
- Prefer evidence over vibes: code, schemas, traces, plans, bills — invent no SLOs, QPS, or budgets.
- Verify in bounded passes: change → inspect once (tests + static signals + one runtime path) → fix in one batch → confirm once → stop. Open-ended self-QA burns money.

## Setup

1. If `PRODUCT.md` exists at the project root (or nearest app root), read it. If `ARCHITECTURE.md` exists, read it. If `.keel/surfaces/` has a brief matching the target, read it. Do not invent missing sections.
2. Load the request’s playbook from the Commands table below, or treat undescribed new systems as **shape** then build. For narrow fixes on existing code, proceed on the incumbent design and offer `init` afterward if PRODUCT.md is missing.
3. Immediately before editing implementation code, read [reference/eng-floor.md](reference/eng-floor.md). Skip it for planning-only work (`shape`, pure `critique` reporting).

**Missing context:** If PRODUCT.md is absent and the work is a new service, boundary, or replacement architecture, run `init` first (or ask once to proceed without it). Scoped bugfixes may proceed.

## How to engineer

- **The brief wins.** Honor pinned constraints (compliance, latency budget, single-region, “no new infra”) even when a fashionable pattern conflicts.
- **Refinement preserves; redesign replaces.** Refinement keeps boundaries, contracts, and data ownership. Redesign treats the old topology as evidence/anti-reference and rewrites ARCHITECTURE.md — never “polish” a discarded design into a half-migration.
- **Architecture authority is evidence, not a filename.** Missing ARCHITECTURE.md does not mean greenfield; inspect the repo’s real boundaries first.

## Modes

Pick the mode from the **surface**, not the company:

- **Serve** — request/response; latency, authz, correctness
- **Process** — jobs/queues/batch; throughput, idempotency, poison handling
- **Store** — data plane; consistency, migrations, query cost
- **Integrate** — partners/webhooks/events; contracts, retries, versioning
- **Control** — admin/orchestration; audit trails, least privilege

Persist mode only in the surface brief (`.keel/surfaces/…`), not in PRODUCT.md.

## Commands

| Command | Category | Description | Reference |
|---|---|---|---|
| `init` | Build | Capture durable product/system truth in PRODUCT.md | [reference/init.md](reference/init.md) |
| `document` | Build | Generate ARCHITECTURE.md from existing code | [reference/document.md](reference/document.md) |
| `shape [feature]` | Build | Plan APIs, data, and boundaries before coding | [reference/shape.md](reference/shape.md) |
| `critique [target]` | Evaluate | Architecture / API design review | [reference/critique.md](reference/critique.md) |
| `audit [target]` | Evaluate | Correctness, security, reliability, observability | [reference/audit.md](reference/audit.md) |
| `cost [target]` | Evaluate | Cost drivers: query, compute, storage, egress | [reference/cost.md](reference/cost.md) |
| `organize [target]` | Refine | Package boundaries, layering, dependency direction | [reference/organize.md](reference/organize.md) |
| `distill [target]` | Refine | Strip accidental complexity | [reference/distill.md](reference/distill.md) |
| `harden [target]` | Refine | Timeouts, retries, idempotency, authz, failure modes | [reference/harden.md](reference/harden.md) |
| `optimize [target]` | Fix | Hot paths, N+1, contention, allocations | [reference/optimize.md](reference/optimize.md) |
| `clarify [target]` | Fix | Naming, contracts, errors, docs | [reference/clarify.md](reference/clarify.md) |

Routing:

- **No argument:** read [reference/routing.md](reference/routing.md); present a context-aware menu; never auto-run.
- **Explicit or clearly implied command:** load its reference and follow it. Ask once if two fit equally.
- **Otherwise:** general backend work under Setup + eng-floor. Missing PRODUCT.md on new-system work → `init` then continue.
