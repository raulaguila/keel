---
name: keel
description: "Use when designing, reviewing, scoring, or improving backends: APIs, workers, data, reliability, security, cost, migrations, ship readiness. Not for frontend/UI-only work."
---

Backend craft skill. Prefer evidence over vibes. Invent no SLOs/QPS/budgets.

## Laws (always)

1. **Correctness & operability** — incomplete error paths are not MVP.
2. **Evidence** — code, schemas, detector, ops files (Make/Docker/migrations). No invented numbers.
3. **Bounded passes** — change → inspect once → fix once → confirm → stop.
4. **Doc sync** — structural code change → patch ARCHITECTURE/surfaces/PRODUCT same turn ([doc-sync.md](reference/doc-sync.md)).
5. **User language** — reports/docs in the user’s language; command names stay English (`/keel ship`).
6. **App ≠ Keel trees** — do not smell-score PRODUCT/ARCHITECTURE/`.keel/**`/skill installs ([analysis-scope.md](reference/analysis-scope.md)). `doctor` = artifact drift only.

## Load discipline (tokens)

- Load **only** `reference/<command>.md` for the invoked command.
- Load [eng-floor.md](reference/eng-floor.md) **only** when editing app code.
- Load personas / scoring guide / mode depth **only** for full `critique` (see critique.md).
- Do **not** preload critique+personas+modes+ops together on unrelated commands.
- Shared close-out: [next-commands.md](reference/next-commands.md) — do not paste Close footers from playbooks.

## Setup (short)

1. Cwd = user project. `<skill>` = folder with this SKILL.md.
2. Read PRODUCT.md / ARCHITECTURE.md / matching `.keel/surfaces/` if present — do not invent sections.
3. Route via Commands. Missing PRODUCT on new boundary → `init` (or ask once). Greenfield feature → `shape` then build ([new-work.md](reference/new-work.md) only if no command fits).
4. Alias: `polish` → `ship`.

## Modes (name only; depth on demand)

Serve · Process · Store · Integrate · Control — depth files load from critique when scoring deep, not by default.

## Commands

| Command | Does | Does not | Ref |
|---|---|---|---|
| `init` | Write PRODUCT.md | Rewrite ARCHITECTURE | [init.md](reference/init.md) |
| `document` | Generate/refresh ARCHITECTURE from code | Patch one section after a fix (use doc-sync) | [document.md](reference/document.md) |
| `shape` | ADR + surface before code | Implement the feature | [shape.md](reference/shape.md) |
| `extract` | Promote ≥2 call-site dupes | Invent frameworks | [extract.md](reference/extract.md) |
| `onboard` | Activation path (tenant/keys/webhooks) | UI onboarding | [onboard.md](reference/onboard.md) |
| `adapt` | Multi-env/region/tenant/consumer | Schema expand/contract alone → `migrate` | [adapt.md](reference/adapt.md) |
| `critique` | Score /32 + backlog + trend | Fix code (unless asked) | [critique.md](reference/critique.md) |
| `audit` | Broad quality checklist | Deep authz matrix → `secure`; deep telemetry → `observe` | [audit.md](reference/audit.md) |
| `secure` | Threat sketch + authz matrix | General reliability pass → `harden` | [secure.md](reference/secure.md) |
| `observe` | Telemetry gaps on a path | HTTP probing → `live` | [observe.md](reference/observe.md) |
| `cost` | Rank $ drivers (no fake bills) | Rewrite hot path → `optimize` | [cost.md](reference/cost.md) |
| `doctor` | Artifact drift (`--json/--fix`) | App smell critique | [doctor.md](reference/doctor.md) |
| `status` | Score/P0 pulse from snapshots | Drift checks → `doctor` | [status.md](reference/status.md) |
| `ship` | Close critique P0/P1 + snapshot | Redesign topology → `shape` | [ship.md](reference/ship.md) |
| `harden` | Timeouts/retries/idempotency/authz edges | Close whole critique backlog → `ship` | [harden.md](reference/harden.md) |
| `organize` | Package/dep direction | Delete accidental complexity → `distill` | [organize.md](reference/organize.md) |
| `distill` | Strip accidental complexity | Move shared helpers → `extract` | [distill.md](reference/distill.md) |
| `migrate` | Safe schema/API evolve | Env/tenant matrix → `adapt` | [migrate.md](reference/migrate.md) |
| `optimize` | Fix hot path / N+1 | Only rank costs → `cost` | [optimize.md](reference/optimize.md) |
| `clarify` | Names/contracts/errors/docs | Behavior changes | [clarify.md](reference/clarify.md) |
| `load` | Capacity / backpressure model | Micro-optimize one query → `optimize` | [load.md](reference/load.md) |
| `live` | Probe running HTTP API | Add metrics → `observe` | [live.md](reference/live.md) |
| `hooks` | Detector hook admin | | [hooks.md](reference/hooks.md) |
| `pin` | `/audit` shim → `/keel audit` | | `scripts/pin.js` |

Bare `/keel`: [routing.md](reference/routing.md) — recommend 2–3, never auto-run.

## Scripts

```bash
node <skill>/scripts/detect.js [--json] [--explain] [--stack=node|ops] [path]
node <skill>/scripts/doctor.js [--json] [--fix]
node <skill>/scripts/status.js [--json] [--detect] [path]
node <skill>/scripts/live-api.js --base=URL [--path=/health]
```

## Close

Pending issues from **this** run → [next-commands.md](reference/next-commands.md) (2–3 max, issue-mapped).  
None → no suggestions (optional: `No pending issues — no next commands.`).
