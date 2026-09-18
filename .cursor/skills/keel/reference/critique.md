# critique

Resolve one stable target (repo root, service, module, API surface, or path). Produce a **scored engineering critique** with category grades, persona red flags, and a concrete improvement backlog — the backend analog of Impeccable’s design critique.

Chat report is the primary deliverable. Also write `.keel/critique/<timestamp>__<slug>.md` when the filesystem allows.

## Hard invariants

- **Assessment A** (persona + category judgment) and **Assessment B** (deterministic evidence) are both required.
- Run A and B as **isolated sub-agents** when Task/sub-agent tools exist. Inline = degraded: first line must be `⚠️ DEGRADED: single-context (<reason>)`.
- Finish A before folding B into parent synthesis.
- Prefer reading code, tests, OpenAPI/proto, migrations, configs, and one real request/job path. Invent no SLOs, QPS, or bills.
- Load [personas.md](personas.md) for persona definitions and selection.
- End with questions **last** — nothing after the question block.

## Assessment A — Engineering judgment (+ personas)

Without detector dumps:

1. Infer surface **mode** (Serve / Process / Store / Integrate / Control).
2. Auto-select **2–3 personas** from [personas.md](personas.md) using the selection table. If PRODUCT.md has real Users / Operating Context, add **1 project-specific persona** (do not invent audience).
3. For each selected persona, walk the primary path of the target and list **specific red flags** (file/symbol when possible) — not generic advice.
4. Score all **8 categories** 0–4 using the [Category Scoring Guide](#category-scoring-guide). Use `n/a` only when the category cannot apply to this surface; renormalize the total.

Return: mode, personas used, category scores with one-line key issue each, 2–3 strengths, 3–5 priority issues (P0–P3), persona red flags, open questions.

## Assessment B — Evidence

Gather without pretending a detector exists unless `keel detect` is installed:

- Tests covering failure / authz denial / idempotency
- Grep heuristics: empty catches, `TODO(security)`, `SELECT *`, missing timeout near HTTP clients, unbounded `findAll` / `Promise.all` fan-out
- Import / package direction (cycles, god packages)
- Config: pool sizes, timeouts, retry defaults
- Infra/schema: shared DB across deployables, missing indexes on obvious FK filters

Return: evidence bullets with paths, counts, and false-positive notes.

## Synthesis — report structure

Do not concatenate A+B. Weave agreement/disagreement. Present this structure in chat:

### 1. Header provenance

- Dual-agent: `Method: dual-agent (A: … · B: …)`
- Or: `⚠️ DEGRADED: single-context (<reason>)`
- Target, mode, personas selected

### 2. Engineering Health Score

| # | Category | Score | Key Issue |
|---|----------|-------|-----------|
| 1 | Boundaries & ownership | ?/4 | … |
| 2 | Contracts & API clarity | ?/4 | … |
| 3 | Reliability & failure modes | ?/4 | … |
| 4 | Data integrity & migrations | ?/4 | … |
| 5 | Security & authorization | ?/4 | … |
| 6 | Performance & cost awareness | ?/4 | … |
| 7 | Operability & observability | ?/4 | … |
| 8 | Organization & complexity | ?/4 | … |
| **Total** | | **??/[applicable max]** | **[Rating band]** |

Applicable max = 4 × scored categories (usually **/32**). Be honest: a 4 is rare. Most real backends land **18–26 / 32**.

**Bands** (use % when any `n/a`): 90%+ Excellent · 70%+ Good · 50%+ Acceptable · 30%+ Poor · below Critical.

### 3. Overall impression

2–4 sentences: what works, what doesn’t, single biggest opportunity.

### 4. What’s working

2–3 specific strengths with why they matter.

### 5. Priority issues

3–5 items, ordered by impact. Each:

- **[P?] Title**
- **What** — concrete location
- **Why it matters** — blast radius / user or cost impact
- **Fix** — smallest correct change
- **Suggested command** — one of: `harden`, `organize`, `distill`, `optimize`, `cost`, `clarify`, `audit`, `shape`, `document`

### 6. Persona red flags

One short subsection per selected persona. Specific failures only (see personas.md). Example tone:

> **Mira (On-call SRE):** No timeout on `payments/client.ts` outbound call. Error swallowed in `catch (e) {}` at `webhooks/handler.ts:88`. Will page with no actionable log field.

### 7. Evidence notes

What Assessment B confirmed / contradicted. Missing detector = say so.

### 8. Recommended next commands

2–3 `/keel …` lines the user can run next, tied to the lowest scores.

### 9. Ask the user (LAST)

One focused question: which issue to fix first, or whether to deep-dive a weak category (`/keel cost`, `/keel harden`, …).

---

## Persistence

When possible:

```text
.keel/critique/<ISO-ish-timestamp>__<slug>.md
```

Include the full score table, `total_score`, `max_score`, `p0_count`, `p1_count`, personas, and priority issues. Skip “Ask the user”. If `.keel/` cannot be written, say so and continue — chat still delivers the report.

---

## Category Scoring Guide

Score each **0–4**. Prefer evidence over taste.

| Score | Meaning |
|-------|---------|
| 0 | Absent / actively harmful |
| 1 | Rudimentary; will fail under modest stress |
| 2 | Partial; common paths OK, edges missing |
| 3 | Solid for the stated PRODUCT constraints; minor gaps |
| 4 | Exemplary; clear conventions others can copy |

### 1. Boundaries & ownership

Who owns which data and deployable? Dependency direction clear?

- 0: Ball of mud; any package imports any other; no ownership
- 2: Folders exist but cross-domain writes / shared DB without owner
- 4: Explicit boundaries, one writer per aggregate, deps point inward

### 2. Contracts & API clarity

Errors, versioning, pagination, idempotency keys, docs match code.

- 0: Ad-hoc payloads; opaque errors; breaking changes silently
- 2: Some OpenAPI/proto; inconsistent error shapes
- 4: Stable contracts, explicit compatibility rules, actionable errors

### 3. Reliability & failure modes

Timeouts, retries, idempotency, DLQ/poison, degradation.

- 0: No timeouts; retries on non-idempotent calls; silent loss
- 2: Some clients hardened; many paths still best-effort
- 4: Every I/O edge has policy; failures are named and tested

### 4. Data integrity & migrations

Transactions, tenancy filters, expand/contract, rollback story.

- 0: Unsafe migrations; lost updates; missing tenant isolation
- 2: Forward-only migrations; weak dual-write windows
- 4: Safe evolve story; invariants enforced close to data

### 5. Security & authorization

Authn/z on sensitive paths, secrets handling, least privilege.

- 0: IDOR / open admin / secrets in repo
- 2: Auth on main routes; gaps on jobs, webhooks, admin
- 4: Consistent authz model; secrets elsewhere; denial tested

### 6. Performance & cost awareness

N+1, bounds, indexes, hot-path waste, egress — relative to PRODUCT.md.

- 0: Unbounded queries; obvious N+1 on hot paths
- 2: Happy path fine; exports/admin/reporting dangerous
- 4: Hot paths measured or clearly bounded; cost hotspots known

### 7. Operability & observability

Logs, metrics, traces, correlation ids, runbooks, deploy/rollback.

- 0: `console.log` only; no correlation; can’t debug prod
- 2: Some metrics; missing high-cardinality discipline or traces
- 4: Critical paths observable; on-call can act from signals

### 8. Organization & complexity

Package shape, accidental abstraction, discoverability for new engineers.

- 0: God packages; frameworks for one call site
- 2: Navigable with tribal knowledge
- 4: Obvious layout; distillable; ARCHITECTURE.md matches reality

**Mode applicability examples:** Store surfaces may soft-weight Contracts if no external API (`n/a` only if truly no consumers). Control surfaces rarely `n/a` Security.

---

## Issue severity (P0–P3)

| Priority | Meaning | Action |
|----------|---------|--------|
| **P0** | Wrong, unsafe, or data-losing | Fix now |
| **P1** | Will hurt at modest scale / on-call / audit | Fix before next release |
| **P2** | Real craft gap; workaround exists | Next pass |
| **P3** | Polish / clarity | If time |

---

## Narrow vs full-repo

- **Repo root / “the backend”:** score the system as operated; sample 2–3 critical paths deeply rather than every file.
- **Single service/module:** score that boundary; mark categories outside scope `n/a` with reason.
- User said only `security` / `cost` / etc.: still emit the full table, but depth-focus that category and say so in the header.
