# Doc sync (after code changes)

Whenever this run **changes application behavior, boundaries, contracts, data, or delivery**, update the matching docs in the **same pass** — do not leave truth only in the diff.

## Why

Stale PRODUCT / ARCHITECTURE / surfaces are worse than none: on-call and the next agent trust them. Keel already treats those files as **authority**; authority must track the code.

## When to update (same turn as the code)

| Change | Update |
|--------|--------|
| New/removed package, service, worker, ownership | `ARCHITECTURE.md` Boundaries (+ dependency rule if changed) |
| New endpoint/event/error shape / pagination / idempotency | `ARCHITECTURE.md` Contracts; matching `.keel/surfaces/<slug>.md` |
| Schema / store / tenancy / consistency | `ARCHITECTURE.md` Data; migrate notes in Delivery |
| Timeouts, retries, DLQ, failure domain | `ARCHITECTURE.md` Failure domains |
| Logs/metrics/traces conventions | `ARCHITECTURE.md` Observability |
| Deploy, Makefile targets, Docker/compose, migration tool | `ARCHITECTURE.md` Delivery ([ops-surfaces.md](ops-surfaces.md)) |
| Product constraint / non-goal / mode / SLO fact | `PRODUCT.md` (ask before inventing) |
| Feature accepted in `shape` | `.keel/surfaces/<slug>.md` status + contracts |

Skip doc edits for pure refactors with **no** external or operational meaning (rename internal helper, formatting).

## How

1. After the fix batch (eng-floor Verify), ask: *did boundaries, contracts, data, failure, observe, or delivery change?*
2. If yes → patch the smallest doc section(s). Prefer surgical edits over full `document` rewrite.
3. If ARCHITECTURE.md is missing and the change is structural → either write a minimal Delivery/Boundaries note or emit a pending issue → `/keel document` ([next-commands.md](next-commands.md)).
4. Language: user’s language for prose; keep paths/symbols as in code.
5. Do **not** invent SLOs, QPS, or bills while syncing docs.

## Hook into commands

Applies to every command that edits app code (`harden`, `ship`, `optimize`, `organize`, `migrate`, `extract`, `clarify`, general eng-floor work).  
`critique` / `audit` / `status` / `doctor` are read-oriented — they **report** doc drift; they do not rewrite unless the user asked to repair.
