# doctor

Report (and optionally repair) **drift between Keel artifacts and application reality**.

Doctor is a **meta** check. It is **not** a code critique, architecture review, or detector pass over the app — and it must **never** treat Keel-generated docs as application source to “analyze for quality.”

## CLI

```bash
node <skill-base-dir>/scripts/doctor.js [--json] [--fix]
# or: keel doctor [--json] [--fix]
```

- `--json` — structured findings `{ id, severity, status, summary, fix, auto? }`
- `--fix` — apply only **auto** fixes (schema stamps, missing `.keel/config.json`)

Exit: `0` clean · `2` open findings · `1` error.

## In scope (artifacts under check)

| Artifact | Role |
|----------|------|
| `PRODUCT.md` | Exists? schema stamp? |
| `ARCHITECTURE.md` | Exists when backend code exists? schema stamp? **path names** in Boundaries still present on disk? |
| `.keel/config.json` | Exists? valid JSON? known ignore rule ids? |
| `.keel/surfaces/*.md` | Optional; broken links only |
| `.keel/critique/*.md` | Snapshots whose **target path** no longer exists |
| Hook install | `.cursor/hooks.json` (or harness equivalent) points at an existing `scripts/hook.js` / `detect.js` |
| Ops vs Delivery | migrations/ or Makefile/Dockerfile without Delivery coverage ([ops-surfaces.md](ops-surfaces.md), [doc-sync.md](doc-sync.md)) |

## Out of scope

Do **not** open PRODUCT/ARCHITECTURE prose for quality scoring; do not smell skill trees or fixtures. App source is **evidence** for path drift only.

## Checks

| Check | Severity | Auto-fix? |
|-------|----------|-----------|
| Missing PRODUCT.md | high | no — suggest `init` |
| Missing ARCHITECTURE.md while **application** backend code exists | high | no — suggest `document` |
| Schema stamp missing (`keel:product-schema` / `keel:architecture-schema`) | med | yes with `--fix` |
| ARCHITECTURE Boundaries paths that no longer exist | med | no |
| migrations present but Delivery empty | med | no — `document` / doc-sync |
| Makefile/Dockerfile present but Delivery silent on ops | low | no |
| `.keel/config.json` missing or invalid | low | yes missing defaults |
| Unknown `detector.ignoreRules` ids | low | report |
| Hook installed but script missing / no Keel entry | high | suggest `keel install` |

## Flow

1. Prefer the CLI above; or run the same checklist manually.
2. Print table / JSON. Apply `--fix` only when asked.
3. Do **not** spawn critique/audit/detect-all as a side effect.

## Language

User’s language for the table and explanations (SKILL.md).

---

## Close

If this run left **pending issues** (failed/warn checks), end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)) — typically `init`, `document`, `hooks`, or `keel install`.
If all checks pass, do **not** suggest commands (optional: `No pending issues — no next commands.`).
Do **not** suggest `critique` / `harden` / `optimize` from doctor unless a check explicitly requires them.
