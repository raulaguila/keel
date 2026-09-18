# shape

Plan UX-of-the-system: APIs, data, boundaries, and failure modes **before** writing implementation code.

## Flow

1. Read PRODUCT.md (+ ARCHITECTURE.md if present). Resolve mode (Serve / Process / Store / Integrate / Control).
2. Restate the job to be done and non-goals in 3–5 bullets; confirm with the user if ambiguous.
3. Propose:
   - Boundary placement (in-process module vs service vs async worker)
   - Data ownership and consistency needs
   - External contracts (API/events) including error model
   - Failure & backlog behavior (timeouts, retries, DLQ, idempotency)
   - Observability and cost hotspots expected
4. Prefer the **smallest** topology that meets PRODUCT constraints. Justify every new moving part.
5. Only after user acceptance: write/update a surface brief under `.keel/surfaces/` and then implement (or hand off). Load [eng-floor.md](eng-floor.md) before code.

## Output shape

Use a short design note (not a novel): Context → Options (2 max) → Recommendation → Contracts → Risks → Open questions.

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`).
