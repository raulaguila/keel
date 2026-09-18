# polish

Final production-readiness pass that **closes a critique backlog**. Refinement only — never concealed redesign.

## Flow

1. Load PRODUCT.md / ARCHITECTURE.md / eng-floor.md.
2. Read latest critique snapshot:
   - Prefer `.keel/critique/` newest file matching the target slug.
   - If none: offer to run `critique` first, or proceed with an independent polish scoped by the user.
3. Triage open P0 → P1 → P2 from that snapshot. Skip P3 unless time remains.
4. Fix in one batch at the narrowest correct level (local defect vs shared convention vs missing token in ARCHITECTURE).
5. Run `scripts/keel detect` on touched paths when available; fix new primary findings.
6. Re-score lightly: update the same 8 categories for areas you changed; do not invent a full second critique unless asked.
7. Persist a short polish note under `.keel/critique/` or append “Closed by polish” to the snapshot metadata if present.
8. Recommend `/keel critique <target>` to refresh the official score + trend.

## Rules

- Preserve contracts and behavior outside the backlog.
- Ask before changing wire contracts or PRODUCT facts.
- If the concept/topology is wrong, stop and recommend `shape` / redesign — do not polish a discarded design.
- Bound the pass: one inspect → one fix batch → one confirm → stop.
