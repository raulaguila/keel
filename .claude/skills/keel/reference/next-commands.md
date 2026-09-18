# Next commands (issue-driven close-out)

Next commands exist to **act on issues already reported in this run** — not to invent busywork.

## Hard rules

1. Build the candidate list only from **pending issues** found in *this* command’s deliverable (Priority Issues, audit findings, detector primaries, doctor failures, ship checklist gaps, etc.).
2. Emit **Next commands** only when that list is non-empty.
3. If there are **no pending issues**, do **not** suggest next commands. Optionally one quiet line: `No pending issues — no next commands.` Do not recommend `critique` / `doctor` / `ship` just to fill space.
4. When emitting, list **2–3** items max (or fewer if fewer issues). Priority order = severity then user preference.
5. Each line must cite the issue it closes, in the **user’s language** for the reason text:
   ```
   1. `/keel <command> [scope]` — fecha [P1] <título da issue>
   ```
   Command names stay English (`harden`, `ship`, …).
6. Only recommend commands from the SKILL.md Commands table (plus `hooks`).
7. **Never auto-run** unless the user explicitly asks to continue / run all / run #1.
8. After the list (only when non-empty), a short close line **in the user’s language**, e.g.:
   > Você pode pedir para eu rodar um por um, todos de uma vez, ou em outra ordem.

## What counts as a pending issue

| Command | Pending issue sources |
|---------|----------------------|
| `critique` | Priority Issues P0–P3 still open (after user scope, if they answered) |
| `audit` / `cost` / `secure` / `observe` | Findings not marked false-positive / deferred |
| `doctor` | Checks with status fail/warn that need a command |
| `detect` (via scripts) | Primary findings (p0/p1) |
| `ship` / `harden` / `optimize` / … | Remaining gaps you did **not** fix this turn, or new detector primaries still open |
| `init` / `document` / `shape` | Only concrete follow-ups implied by gaps you named (e.g. “no ARCHITECTURE.md” → `document`). If setup completed cleanly with no gaps, no next commands. |

## Mapping issues → commands

Pick the command that best **closes that issue**, for example:

| Issue kind | Command |
|------------|---------|
| Timeouts, retries, idempotency, empty catch | `harden` |
| Authz, secrets, IDOR, webhook trust | `secure` |
| N+1, unbounded query, hot path | `optimize` or `cost` |
| Missing metrics/logs/traces | `observe` |
| Package cycles, god module | `organize` or `distill` |
| Duplicate helpers ≥2 call sites | `extract` |
| Schema/API evolve risk | `migrate` |
| Capacity / backpressure | `load` |
| Unclear errors/contracts/names | `clarify` |
| Release-blocking leftovers after fixes | `ship` |
| Need refreshed score after fixes | `critique` (only if issues were fixed and user should re-score — still an explicit follow-up to closed work, not filler) |

Do **not** add `/keel ship` or `/keel critique` unless they close a named pending item (e.g. “P0s remain → ship” or “fixes landed → critique to refresh trend”).

## Critique-specific flow

1. Full scored report first.
2. **Ask the user** (same message, questions last) when ≥3 Priority Issues — priority, scope, constraints. If <3: `Questions skipped: <n> priority issues`.
3. **After answers** (or immediately if questions skipped): filter Priority Issues to the chosen scope. If none remain → no Next commands. If some remain → Next commands, one-to-one with those issues (bundle only when one command truly closes several).

## Anti-patterns

- Suggesting commands when the run found nothing actionable
- Generic “you might also like `doctor`” with no finding
- Recommendations that don’t reference an issue title/path/severity
- Auto-running the list
