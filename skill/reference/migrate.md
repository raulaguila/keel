# migrate

**Does:** safe schema/API expand-contract + rollback.  
**Does not:** multi-env/tenant matrix alone (→ `adapt`).

Plan and implement **safe schema/API evolution**.

## Flow

1. State current vs desired schema/contract. Name online traffic assumptions.
2. Prefer expand/contract:
   - Expand (add nullable/new topic/new field) → deploy readers/writers → backfill → contract (remove old)
3. Call out lock risks, long backfills, and dual-running versions.
4. Implement migration files + application dual-read/write as needed; keep steps shippable independently.
5. Document rollback: what is safe to revert at each step.
6. Update ARCHITECTURE.md Delivery section ([doc-sync.md](doc-sync.md)). Align Make/CI/Docker migrate targets with reality ([ops-surfaces.md](ops-surfaces.md)).

## Refuse

- Big-bang renames on hot tables without a window
- Destructive contract deploys without a consumer inventory
- Inventing downtime windows the user did not approve
