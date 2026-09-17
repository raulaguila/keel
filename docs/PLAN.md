# Keel — Backend craft skill (plan)

Impeccable for frontend → **Keel** for backend: shared vocabulary, durable context, engineering floor, dual critique, and (later) deterministic detectors + hooks.

Working name: **Keel** (structural backbone). Rename anytime before publish.

Site analog later: `keel.dev` / `keel.systems` — not in MVP.

---

## Phase 0 — Documentation Discovery (done)

### Allowed patterns (copy, don’t invent)

| Source | What to reuse |
|--------|----------------|
| Cursor Skills | `.cursor/skills/<name>/SKILL.md`; `name` + `description` required; playbooks in `references/` or `reference/`; `scripts/` for CLIs; thin router SKILL |
| Impeccable `skill/SKILL.src.md` | One skill, Commands table, routing rules, Setup → load context → load playbook → floor before edits |
| Impeccable `PRODUCT.md` / `DESIGN.md` | Split durable product truth vs extracted system truth |
| Impeccable `craft-floor.md` | Verify (result checks) + Refuse (absolute / default bans) |
| Impeccable `critique.md` | Assessment A (judgment) ∥ B (deterministic evidence); degraded banner if single-context |
| Cursor Hooks | Separate from skills: `.cursor/hooks.json`; `afterFileEdit` / `preToolUse`; no true before-write in docs (Impeccable’s Cursor hook is custom engine) |

### Anti-patterns to avoid

- Inventing Cursor frontmatter fields not in docs (`paths`/`description`/`name` are safe)
- Shipping a Rust engine in MVP (Impeccable spent years on that)
- Mixing product SLOs into architecture tokens files
- Open-ended “keep optimizing” loops — bound verify passes like Impeccable

### Confidence

High on skill layout and Impeccable shell. Medium on first detector rule set (language-agnostic heuristics need iteration).

---

## Product thesis

Agents trained on the same backend tutorials ship the same tells: fat controllers, N+1 queries, missing timeouts, god packages, invented SLOs, “microservices” with shared DB, cost ignored until the bill.

Keel gives builders:

1. **Durable truth** — `PRODUCT.md` (who, scale, SLOs, budget, compliance) + `ARCHITECTURE.md` (boundaries, data, contracts, ops conventions)
2. **Shared verbs** — `/keel audit`, `/keel cost`, `/keel distill`, …
3. **Engineering floor** — mechanical Verify + Refuse before code changes
4. **Later:** deterministic `keel detect` + edit hooks (Semgrep/regex/AST), without an LLM

---

## Context model

| File | Owns | Does not own |
|------|------|--------------|
| `PRODUCT.md` | Users, purpose, platform/stack, scale assumptions, SLOs, cost budget, compliance, principles, evidence | Layer diagrams, ORM choices, folder layout |
| `ARCHITECTURE.md` | Boundaries, domains, data model, API/error taxonomy, consistency, observability conventions, ADRs index | Marketing voice, user personas |
| `.keel/surfaces/*.md` | Per-service / API / worker brief (mode, invariants, owners) | Global product truth |
| `.keel/config.json` | Workflow prefs, detect ignores, hook settings | Secrets |

**Modes** (pick per surface, like Impeccable’s Persuade/Operate):

| Mode | Success looks like |
|------|-------------------|
| **Serve** | Request/response APIs — latency, correctness, authz |
| **Process** | Jobs/queues/batch — throughput, idempotency, poison pills |
| **Store** | Data plane — consistency, migrations, query cost |
| **Integrate** | Webhooks/partners/events — contracts, retries, poison |
| **Control** | Admin/config/orchestration — auditability, least privilege |

---

## Command vocabulary (MVP → full)

### MVP (Phase 1)

| Command | Category | Job |
|---------|----------|-----|
| `init` | Build | Interview + write `PRODUCT.md` |
| `document` | Build | Extract `ARCHITECTURE.md` from code |
| `shape` | Build | Plan API/data/boundaries before code |
| `critique` | Evaluate | Architecture/UX-of-API review (A ∥ B) |
| `audit` | Evaluate | Correctness, security, observability, reliability |
| `cost` | Evaluate | Query/compute/storage/egress cost drivers |
| `organize` | Refine | Package boundaries, layering, dependency direction |
| `distill` | Refine | Remove accidental complexity / over-abstraction |
| `harden` | Refine | Timeouts, retries, idempotency, authz, failure modes |
| `optimize` | Fix | Hot paths, N+1, allocations, lock contention |
| `clarify` | Fix | Naming, contracts, error messages, docs |

### Later (Phase 2+)

| Command | Job |
|---------|-----|
| `observe` | Telemetry gaps, SLOs, tracing, cardinality |
| `secure` | Threat model, secrets, authn/z deep pass |
| `migrate` | Schema/API compatibility, rollout plans |
| `load` | Capacity, load-test design, backpressure |
| `extract` | Promote shared platform libs / modules |
| `polish` | Ship-readiness pass (closes critique backlog) |
| `doctor` | Drift between PRODUCT/ARCHITECTURE/config and reality |
| `hooks` | Enable/ignore detector rules |

---

## Engineering floor (`eng-floor.md`)

### Verify (on the built result)

- Authz on every mutating and sensitive-read path
- Timeouts + cancellation on every outbound I/O
- Idempotency for retries / at-least-once consumers
- Pagination / bounds on every list query
- Migrations forward + documented rollback (or expand/contract)
- Structured logs without PII; correlation ids
- Tests cover failure paths named in the brief
- Cost-sensitive queries have an explain/plan story

### Refuse (defaults; brief can override most)

- God package / cyclic domain deps
- Shared DB across “microservices” without an owning team
- Catch-all that swallows errors
- Unbounded `SELECT` / fan-out / in-memory load of tables
- Invented SLOs or scale numbers not in `PRODUCT.md`
- Secrets / tokens in source or logs
- Sync blocking on async request path (language-specific)
- New abstraction layers without two concrete call sites
- Chatty cross-service loops in a single user action

---

## Detector roadmap (Phase 2, not MVP)

Language-first packs (start with one stack the user cares about):

**Universal smells (regex/AST-friendly):** missing pagination markers, `SELECT *`, empty `catch`, TODO security, hardcoded credentials patterns, missing `timeout` near HTTP clients, N+1 loops (`for` + await query), unbounded `Promise.all` fan-out.

**Cost smells:** full table scans hints, missing index comments on hot paths, chatty cache misses, large payload logging.

Ship as `npx keel detect` only after 15–20 high-precision rules; false positives kill trust.

---

## Implementation phases

### Phase 1 — Skill MVP (this repo)

**What:** Router skill + playbooks + templates + eng-floor. No engine binary.

**Deliverables:**

- `skill/SKILL.md` (or `SKILL.src.md`) + `reference/*.md` for MVP commands
- `assets/templates/PRODUCT.md` + `ARCHITECTURE.md`
- Install path: copy/link into `.cursor/skills/keel/`
- README with `/keel init` walkthrough

**Verify:**

- [ ] `/keel` with no args shows routing menu text
- [ ] Each command reference exists and is linked from the Commands table
- [ ] `init` template matches schema stamp `keel:product-schema 1`
- [ ] Cursor loads skill from `.cursor/skills/keel/SKILL.md`

**Anti-pattern guards:** Do not add Rust/Node detector yet; do not claim CI integration.

### Phase 2 — Critique + signals quality

**What:** Dual-assessment critique playbook; optional `scripts/keel` stub that prints context/signals from filesystem only.

**Verify:** Critique requires A∥B and degraded banner; `document` refuses to invent PRODUCT facts.

### Phase 3 — Detect + hooks (one language)

**What:** Semgrep or tree-sitter rules + `afterFileEdit` hook; `keel detect --json`.

**Verify:** Golden fixtures for each rule; ignore admin; exit codes documented.

### Phase 4 — Multi-harness + polish product

**What:** Claude/Codex/Gemini distributions; doctor; polish; website; npm package.

---

## MVP file tree

```text
keel/
├── README.md
├── docs/PLAN.md
├── skill/
│   ├── SKILL.md
│   ├── reference/
│   │   ├── routing.md
│   │   ├── eng-floor.md
│   │   ├── init.md
│   │   ├── document.md
│   │   ├── shape.md
│   │   ├── critique.md
│   │   ├── audit.md
│   │   ├── cost.md
│   │   ├── organize.md
│   │   ├── distill.md
│   │   ├── harden.md
│   │   ├── optimize.md
│   │   └── clarify.md
│   ├── agents/
│   │   └── keel-documenter.md
│   └── assets/templates/
│       ├── PRODUCT.md
│       └── ARCHITECTURE.md
└── .cursor/skills/keel/   # linked or copied install for Cursor
```

---

## Open decisions (defaults chosen)

| Decision | Default | Change if… |
|----------|---------|------------|
| Name | Keel | Brand conflict / preference |
| Language focus MVP | Stack-agnostic playbooks | You want TS/Go/Python-first detectors sooner |
| PRODUCT vs SERVICE | Keep `PRODUCT.md` | Multi-product monorepo → per-app PRODUCT |
| Cost command | First-class in MVP | Prefer folding into `audit` |

---

## Phase final — Verification

1. Skill discovers under `.cursor/skills/keel`
2. Run `/keel init` mentally against a sample API repo; PRODUCT fields fill without inventing SLOs
3. Run `/keel document` checklist against same repo; ARCHITECTURE sections map to real folders
4. Grep for invented Cursor APIs / hook events not in docs
5. Confirm no detector claims without fixtures
