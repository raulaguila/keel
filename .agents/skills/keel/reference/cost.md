# cost

**Does:** rank cost drivers with confidence (no fake bills).  
**Does not:** rewrite hot paths (→ `optimize`); invent unit prices.

Find and rank **cost drivers**: query, compute, storage, egress, vendors, idle capacity.

## Flow

1. Read PRODUCT.md for budget / scale assumptions (or mark Unknown). Scope to app paths only ([analysis-scope.md](analysis-scope.md)).
2. Map the target’s runtime path: who calls what, how often (evidence from code, jobs schedules, metrics if present). Optional detector: `--json` on the app target for unbounded queries / fan-out rules.
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
