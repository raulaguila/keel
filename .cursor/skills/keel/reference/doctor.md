# doctor

Report (and optionally repair) **drift between Keel artifacts and application reality**.

Doctor is a **meta** check. It is **not** a code critique, architecture review, or detector pass over the app — and it must **never** treat Keel-generated docs as application source to “analyze for quality.”

## In scope (artifacts under check)

Only these Keel-owned paths (and the skill install used by this project):

| Artifact | Role |
|----------|------|
| `PRODUCT.md` | Exists? schema stamp? |
| `ARCHITECTURE.md` | Exists when backend code exists? schema stamp? **path names** in Boundaries still present on disk? |
| `.keel/config.json` | Exists? valid JSON? known keys? |
| `.keel/surfaces/*.md` | Optional; broken links only |
| `.keel/critique/*.md` | Snapshots whose **target path** no longer exists |
| Hook install | `.cursor/hooks.json` (or harness equivalent) points at an existing `scripts/hook.js` / `detect.js` |

## Out of scope (do not analyze as app code)

Do **not** open these for quality/scoring/smell review during `doctor`:

- Prose body of `PRODUCT.md` / `ARCHITECTURE.md` (except: extract **path-like** tokens from ARCHITECTURE Boundaries to verify they exist)
- `.keel/critique/**` report bodies
- Installed skill trees: `.cursor/skills/keel/**`, `.claude/skills/keel/**`, `.agents/skills/keel/**`, `skill/**` (when this repo *is* Keel)
- `docs/` of the Keel package, templates under `assets/templates/`
- Detector findings inside the skill’s own `scripts/` or `tests/fixtures/`

Application source (`src/`, `app/`, `services/`, …) is used only as **evidence** for drift checks (e.g. “ARCHITECTURE names `billing/worker` but folder missing”). Do not run `/keel critique`, full `detect`, or eng-floor on the whole tree as part of doctor unless the user asked for that separately.

## Checks

| Check | Severity | Auto-fix? |
|-------|----------|-----------|
| Missing PRODUCT.md | high | no — suggest `init` |
| Missing ARCHITECTURE.md while **application** backend code exists | high | no — suggest `document` |
| Schema stamp missing/outdated (`keel:product-schema` / `keel:architecture-schema`) | med | yes — add stamp if content otherwise OK |
| ARCHITECTURE Boundaries list packages/paths that no longer exist | med | no — list stale paths |
| `.keel/config.json` missing or invalid | low | yes — write defaults |
| Critique snapshots whose target path is gone | low | report only |
| Hook installed but skill `scripts/hook.js` / `detect.js` missing | high | suggest `keel install` |
| `detector.ignoreRules` referencing unknown rule ids | low | report |
| Doctor accidentally scoped to skill/fixture trees only | — | abort and re-root on the app |

“Backend code exists” means application languages under normal app dirs — **not** the presence of `PRODUCT.md` / skill markdown alone.

## Flow

1. Resolve project root (app), not the skill package root unless the user opened Keel itself to dogfood.
2. List only the artifact checks above. For path-drift: parse ARCHITECTURE Boundaries for path-like tokens; `fs`/list dirs to verify.
3. Print a table: check · status · evidence · action. Evidence cites **app paths** or **missing artifacts**, not “PRODUCT.md tone is vague.”
4. Apply only auto-fixes when the user said repair / `doctor --fix`. Never rewrite product principles or invent SLOs.
5. Do **not** spawn critique/audit/detect-all as a side effect.

## Output

Table of checks. Pending doctor issues only (failed/warn rows).

## Language

User’s language for the table and explanations (SKILL.md).

---

## Close

If this run left **pending issues** (failed/warn checks), end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)) — typically `init`, `document`, `hooks`, or `keel install`.
If all checks pass, do **not** suggest commands (optional: `No pending issues — no next commands.`).
Do **not** suggest `critique` / `harden` / `optimize` from doctor unless a check explicitly requires them.
