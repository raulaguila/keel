# hooks

Manage the Keel design/engineering detector hook for this project.

## Usage

```
/keel hooks on|off|status|ignore-rule|ignore-file|ignore-value|reset
```

## Behavior

- **on** — ensure `.cursor/hooks.json` (or merge) runs `skill/scripts/keel-hook` / `node …/detect.js --hook` after backend file edits (`afterFileEdit`). Prefer installer: `npx keel install --hooks`.
- **off** — disable Keel entries without deleting unrelated hooks.
- **status** — print whether hook is present, last detect exit, ignore config from `.keel/config.json`.
- **ignore-rule `<id>`** — add to `detector.ignoreRules`.
- **ignore-file `<glob>`** — add to `detector.ignoreFiles`.
- **ignore-value `<rule> <value>`** — value-specific ignore when supported.
- **reset** — clear detector ignores (ask once).

Mechanical findings only. Judgment stays in eng-floor + critique.

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`).
