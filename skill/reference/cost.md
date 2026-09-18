# cost

Find and rank **cost drivers**: query, compute, storage, egress, third-party APIs, idle capacity. No invented cloud bills.

## Flow

1. Read PRODUCT.md for budget / scale assumptions (or mark Unknown).
2. Map the target’s runtime path: who calls what, how often (evidence from code, jobs schedules, metrics if present).
3. Inspect:
   - DB: N+1, missing filters, SELECT *, large offsets, unbounded exports, chatty ORM
   - Compute: hot loops, unnecessary serialization, oversized payloads, sync work on request path
   - Storage: retained logs/events without TTL, duplicate blobs, fat rows
   - Egress: cross-AZ chatter, oversize responses, webhook fan-out
   - Vendors: per-seat/per-call APIs without caching or batching
4. Rank by **likely $ impact × confidence**. Label confidence Low/Med/High.
5. Propose changes with expected effect direction (not fake % savings). Note measurement method (EXPLAIN, metrics, staging load).

## Refuse

- “Move to microservices to save money” without evidence
- Premature sharding
- Invented unit prices — ask for rate card or use relative comparisons only

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
