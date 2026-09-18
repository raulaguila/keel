# ship

Final **production-readiness** pass that closes a critique backlog and clears the path to release. Backend analog of a launch checklist — not visual polish.

Synonyms the user may say: “ship it”, “ready for prod”, “preflight”, “release gate”, “stabilize for launch”. Deprecated alias: `polish` → load this playbook.

## Intent

Make the target **safe to deploy**: close P0/P1 from critique, confirm failure modes and contracts, leave P3 for later. Refinement only — never concealed redesign.

## Flow

1. Load PRODUCT.md / ARCHITECTURE.md / eng-floor.md.
2. Read latest critique snapshot in `.keel/critique/` for this target slug.
   - If none: offer `critique` first, or proceed with a scoped ship checklist the user names.
3. Triage **P0 → P1 → P2**. Skip P3 unless explicitly requested.
4. Fix in one batch at the narrowest correct level.
5. Run `scripts/keel detect` / `detect.js` on touched paths; clear new primary findings.
6. Re-score lightly only the categories you changed; do not invent a full second critique unless asked.
7. Persist a short note (or frontmatter `closed_by: ship`) on the snapshot when possible.
8. Recommend `/keel critique <target>` to refresh the official score + trend before merge/deploy.

## Ship checklist (batch)

- [ ] Critique P0/P1 addressed or explicitly deferred with owner
- [ ] Authz denials on sensitive paths still hold
- [ ] Timeouts / idempotency on changed I/O edges
- [ ] Migrations expand/contract or rollback documented
- [ ] No new detector primary findings on touched files
- [ ] Observability still enough for on-call on this path
- [ ] Wire contracts unchanged unless user approved

## Rules

- Preserve behavior and contracts outside the backlog.
- Ask before changing wire contracts or PRODUCT facts.
- If topology/concept is wrong → stop; recommend `shape` / redesign — do not “ship” a discarded design.
- Bound the pass: one inspect → one fix batch → one confirm → stop.
- Language: prefer *ship*, *release gate*, *preflight*, *production-ready* — avoid *polish*, *pixel*, *visual*.

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
