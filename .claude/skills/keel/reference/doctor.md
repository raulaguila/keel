# doctor

Report (and optionally repair) drift between Keel artifacts and repository reality.

## Checks

| Check | Severity | Auto-fix? |
|-------|----------|-----------|
| Missing PRODUCT.md | high | no — run `init` |
| Missing ARCHITECTURE.md while backend code exists | high | no — offer `document` |
| Schema stamp missing/outdated (`keel:product-schema` / `keel:architecture-schema`) | med | yes — add stamp if content otherwise OK |
| ARCHITECTURE boundaries that name packages/paths which no longer exist | med | no — list stale paths |
| `.keel/config.json` missing | low | yes — write defaults |
| Critique snapshots reference deleted targets | low | report only |
| Hook installed but `scripts/keel` missing | high | point to `npx keel install` |
| `detect` ignore rules referencing unknown rule ids | low | report |

## Flow

1. Scan project root (and monorepo app roots if obvious).
2. Print a table: check · status · evidence · action.
3. Apply only fixes marked auto when user said “repair” / `doctor --fix` / equivalent. Otherwise report only.
4. Never rewrite PRODUCT principles or invent SLOs while doctoring.

## Output

End with recommended commands (`init`, `document`, `critique`, `hooks`).

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
