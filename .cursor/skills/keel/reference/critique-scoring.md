# Critique scoring guide (lazy-load)

Load **only** for full `/keel critique` when scoring categories — not for ship/harden/audit.

Score each category **0–4**. Prefer evidence over taste.

| Score | Meaning |
|-------|---------|
| 0 | Absent / actively harmful |
| 1 | Rudimentary; will fail under modest stress |
| 2 | Partial; common paths OK, edges missing |
| 3 | Solid for PRODUCT constraints; minor gaps |
| 4 | Exemplary; conventions others can copy |

### 1. Boundaries & ownership
Who owns data/deployable? Dep direction?
- 0: Ball of mud · 2: Folders but cross-domain writes · 4: One writer/aggregate, deps inward

### 2. Contracts & API clarity
Errors, versioning, pagination, idempotency, docs↔code.
- 0: Ad-hoc · 2: Partial OpenAPI · 4: Stable + actionable errors

### 3. Reliability & failure modes
Timeouts, retries, idempotency, DLQ, degradation.
- 0: No timeouts / silent loss · 2: Some clients · 4: Every I/O edge has policy

### 4. Data integrity & migrations
Transactions, tenancy, expand/contract, rollback.
- 0: Unsafe migrations · 2: Forward-only · 4: Safe evolve + invariants

### 5. Security & authorization
Authn/z, secrets, least privilege.
- 0: IDOR/secrets in repo · 2: Main routes only · 4: Consistent + denial tested

### 6. Performance & cost awareness
N+1, bounds, indexes — relative to PRODUCT.md.
- 0: Unbounded hot paths · 2: Happy path OK · 4: Bounded + cost known

### 7. Operability & observability
Logs, metrics, traces, correlation, runbooks.
- 0: console.log only · 2: Some metrics · 4: On-call can act

### 8. Organization & complexity
Package shape, accidental abstraction.
- 0: God packages · 2: Tribal knowledge · 4: Obvious layout

Store may `n/a` Contracts if no external API. Control rarely `n/a` Security.

## Issue severity

| P | Meaning | Action |
|---|--------|--------|
| P0 | Wrong / unsafe / data-losing | Fix now |
| P1 | Hurts at modest scale / on-call | Before next release |
| P2 | Craft gap; workaround exists | Next pass |
| P3 | Polish | If time |

## Scope notes

- Repo root: sample 2–3 critical paths deeply.
- Single module: `n/a` out-of-scope categories with reason.
- Focus mode: full 8-row table; deep only in focus cats.
