# new-work

**Not a `/keel` command** — routing playbook only. Use when the user asks to build a greenfield feature **without** naming a command.

Synonyms: “build this feature”, “add a module”, “new service slice”, “implement X from scratch”.

If a named command fits (`harden`, `migrate`, …), load that playbook instead.

## Intent

Sequence planning and craft so new work lands with contracts, eng-floor, detection, and docs — not a drive-by dump of files.

## Flow

1. **Init if needed** — If `PRODUCT.md` is missing and the work defines product constraints, run [init.md](init.md) (or ask once). Scoped additions to an existing product may skip.
2. **Shape** — Load [shape.md](shape.md): mode, trade-offs, ADR, surface brief. Do not implement until accepted unless the user said “shape and build” / “just build it”.
3. **Eng-floor build** — Immediately before code, load [eng-floor.md](eng-floor.md). Implement the accepted design at the narrowest correct boundary.
4. **Detect** — Run detector on touched app paths ([analysis-scope.md](analysis-scope.md)):
   ```bash
   node <skill-base-dir>/scripts/detect.js --json [--stack=<lang>] <target>
   ```
   Clear new primary findings in the same batch when cheap.
5. **Doc-sync** — Patch ARCHITECTURE / surfaces / PRODUCT facts if boundaries, contracts, data, failure, observe, or delivery changed ([doc-sync.md](doc-sync.md)).
6. **Optional critique** — Offer `/keel critique <target>` only when the user wants a scored baseline or when P0-class risks remain after build — not as filler ([next-commands.md](next-commands.md)).

## Rules

- Prefer package-in-process over new deployable unless shape justified it.
- Refinement preserves contracts; redesign requires an updated ADR.
- Bound passes: change → inspect once → fix once → confirm once → stop.
- Do not smell-analyze Keel-owned paths ([analysis-scope.md](analysis-scope.md)).

## When not to use

- Named command already fits (`harden`, `migrate`, `optimize`, …) → load that playbook instead.
- Pure eval (`critique`, `audit`, `doctor`) → no build path.
- Tiny bugfix with known root cause → eng-floor + fix; skip full shape if topology unchanged.
