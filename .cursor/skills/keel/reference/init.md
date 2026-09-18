# init

Capture durable product/system truth in `PRODUCT.md`. Do **not** invent architecture topology and do **not** write `ARCHITECTURE.md` (offer `document` after).

## Flow

1. Scan the repo lightly: languages, deploy targets, existing READMEs, infra folders, OpenAPI/proto, queue names. Form a hypothesis; do not treat guesses as facts.
2. Ask only for **material gaps** — short rounds, not a questionnaire dump. Prefer confirming hypotheses over blank prompts.
3. Write `PRODUCT.md` using [../assets/templates/PRODUCT.md](../assets/templates/PRODUCT.md). Keep the schema stamp.
4. Never invent SLOs, QPS, cost budgets, compliance regimes, or customer counts. If unknown, write `Unknown — confirm before designing to that constraint.`
5. Recommend next step: usually `document` if code exists, else `shape` for greenfield.

## Rules

- PRODUCT.md is strategic. No folder trees, ORM picks, or sequence diagrams here.
- If PRODUCT.md already exists, show a diff of proposed updates and ask before overwriting.
- Platform may be `web-api`, `worker`, `data`, `mobile-bff`, `adaptive`, or a short custom label — record what evidence supports.

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`).
