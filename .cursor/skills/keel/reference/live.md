# live

**Does:** probe running HTTP API (status/body).  
**Does not:** add instrumentation (→ `observe`); browser live mode.

HTTP-only live iteration against a running service. Synonyms: “probe the API”, “curl loop”, “hit /health”.

## Intent

Validate wire behavior with a **bounded** request pass against a real base URL the user (or local stack) provides. Fail-open: if the service is down or the script missing, report and continue — do not block the whole session inventing a browser path.

## Flow

1. Confirm **base URL** (user-supplied or local compose/Make run). Do not guess production hosts.
2. Prefer the skill script when present:
   ```bash
   node <skill-base-dir>/scripts/live-api.js --base=URL --path=/health
   ```
   Optional flags as implemented by the script (e.g. method, headers, body file). Fall back to `curl -sS -D-` if the script is absent — say so.
3. Record: HTTP status, content-type, top-level body shape (keys / error envelope), latency ballpark. Compare to Contracts / OpenAPI / surface brief.
4. Fix contract or handler gaps in one batch; eng-floor on touched code ([eng-floor.md](eng-floor.md)).
5. Re-run the same probe once to confirm. **Stop** — no open-ended probe loops.
6. Doc-sync if status/body shapes or paths changed ([doc-sync.md](doc-sync.md)).

## Bound passes

- Default: **one** probe set (≤5 paths) → one fix batch → one confirm probe → stop.
- Expand only if the user names more paths or a failing contract remains.
- Do not keep hammering a down service; after 1–2 connection failures → fail-open and report.

## Fail-open

| Condition | Behavior |
|-----------|----------|
| No base URL | Ask once or skip live; continue with code/docs work |
| Script missing | Use curl or skip; note degraded |
| Connection refused / timeout | Report; do not invent success; optional next: start via Make/compose ([ops-surfaces.md](ops-surfaces.md)) |
| Auth required and no token | Probe public/health only; list auth-gated paths as pending |

## Refuse

- Browser/Puppeteer “live” checks for a pure API task
- Load-testing or fuzzing framed as live iteration (`load` instead)
- Writing real secrets into command history or committed fixtures

## Rules

- Application targets only ([analysis-scope.md](analysis-scope.md)).
- Prefer evidence (status + body) over vibes; do not invent SLOs from a single probe.
