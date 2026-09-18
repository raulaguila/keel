# secure

Focused security pass: threat sketch, authz matrix, secrets, and abuse paths — deeper than `audit`’s security slice.

## Flow

1. Identify assets (data classes, admin powers, webhooks, jobs) and trust boundaries.
2. Build a short **authz matrix**: actor × action × enforced-where (gateway / handler / query).
3. Probe: IDOR, missing auth on non-HTTP entrypoints, webhook verification, SSRF on URL fetchers, secret storage, verbose errors.
4. Fix P0/P1 with least privilege and tests for denials where cheap.
5. Record residual risks explicitly; do not claim “secure.”

## Output

- Threat sketch (5–10 bullets)
- Authz matrix (table)
- Findings P0–P3 with paths
- Suggested follow-ups (`harden`, `audit`, `critique`)

## Refuse

- Security theater (random middleware without enforcement at data access)
- Disabling auth “temporarily” in committed code

---

## Close

End with **Next commands** per [next-commands.md](next-commands.md). Never finish silent.
