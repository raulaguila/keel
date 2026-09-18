# migrate

Plan and implement **safe schema/API evolution**: expand/contract, dual-write windows, rollback.

## Flow

1. State current vs desired schema/contract. Name online traffic assumptions.
2. Prefer expand/contract:
   - Expand (add nullable/new topic/new field) → deploy readers/writers → backfill → contract (remove old)
3. Call out lock risks, long backfills, and dual-running versions.
4. Implement migration files + application dual-read/write as needed; keep steps shippable independently.
5. Document rollback: what is safe to revert at each step.
6. Update ARCHITECTURE.md Delivery section.

## Refuse

- Big-bang renames on hot tables without a window
- Destructive contract deploys without a consumer inventory
- Inventing downtime windows the user did not approve

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
