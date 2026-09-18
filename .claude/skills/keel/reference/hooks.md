# hooks

Manage the Keel detector hook for this project.

## Usage

```
/keel hooks on|off|status|ignore-rule|ignore-file|reset
```

## Two tiers

| Tier | When | What |
|------|------|------|
| **Immediate** | after file edit (`afterFileEdit` / PostToolUse) | Primary findings (p0–p1) on the touched file |
| **Deep (Stop)** | session Stop / `hook.js --stop` | Full scan of files touched this session; deduped vs already reported |

Cursor Stop dispatch is best-effort; Claude Code / Copilot get a more reliable Stop. Always fail-open (exit 0).

Session state: `.keel/session-touched.json` (gitignored).

## Config

Shared: `.keel/config.json` → `hook.enabled`, `hook.quiet`, `hook.auditLog`  
Local (gitignored): `.keel/config.local.json` → `hook.consent`, per-dev quiet  

Env overrides: `KEEL_HOOK_DISABLED=1`, `KEEL_HOOK_QUIET=1`, `KEEL_HOOK_LOG=path`.

## Behavior

- **on** — `hook.enabled: true`, record local consent, repair provider manifests via `keel install`.
- **off** — `hook.enabled: false`.
- **status** — print enabled/quiet/paths/ignores.
- **ignore-rule `<id>`** — add to `detector.ignoreRules`.
- **ignore-file `<glob>`** — add to `detector.ignoreFiles`.
- **reset** — clear detector ignores (ask once).

Mechanical findings only. Judgment stays in eng-floor + critique.

Installer wires Cursor `afterFileEdit` + `stop`, and Claude `PostToolUse` + `Stop` when those providers are selected.

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
