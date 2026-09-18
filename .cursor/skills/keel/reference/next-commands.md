# Next commands (issue-driven close-out)

**Single close-out** for all Keel commands (SKILL.md). Do not duplicate this footer in playbooks.

1. Candidates = **pending issues from this run only** (Priority Issues, findings, doctor fails, ship gaps, detector primaries, forgotten doc-sync).
2. Emit **Next commands** only if non-empty. Else nothing (optional: `No pending issues — no next commands.`).
3. Max **2–3** lines. Severity then user preference.
4. Each line cites the issue, reason in **user’s language**; command names English:
   `1. `/keel harden checkout` — fecha [P0] timeout ausente`
5. Only commands from the SKILL table (+ `hooks`).
6. **Never auto-run** unless the user asks to continue / run all / run #1.
7. After a non-empty list, one short close line in the user’s language.

## Mapping (pick what **closes** the issue)

| Issue | Command |
|-------|---------|
| Timeouts / empty catch / retries | `harden` |
| Authz / secrets / IDOR | `secure` |
| N+1 / unbounded query | `optimize` or `cost` |
| Missing telemetry | `observe` |
| God module / cycles | `organize` / `distill` |
| Dup helpers ≥2 sites | `extract` |
| Schema/API evolve | `migrate` |
| Env/tenant/consumer matrix | `adapt` |
| Activation / empty tenant | `onboard` |
| Docs stale after structural change | `document` or `clarify` |
| Release leftovers | `ship` |
| Need fresh score after fixes | `critique` (only if that is the named follow-up) |
| Artifact drift | `init` / `document` / `hooks` / install — never critique of PRODUCT prose |

## Critique

Report → Ask (if ≥3 issues) → filter scope → Next commands only for remaining issues.
