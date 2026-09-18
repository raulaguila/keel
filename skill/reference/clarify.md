# clarify

Improve names, API contracts, error messages, and operator docs so humans and agents can navigate the system.

## Flow

1. Inventory confusing names, overloaded terms, and errors that say “failed” without cause/recovery.
2. Align vocabulary with PRODUCT.md / domain language.
3. Tighten contracts: required fields, error codes, pagination cursors, idempotency headers — document in OpenAPI/proto/ARCHITECTURE as appropriate.
4. Ask before changing external wire contracts that callers depend on; prefer additive changes.

## Refuse

- Renaming everything in one PR
- Clever internal jargon that doesn’t match the domain

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
