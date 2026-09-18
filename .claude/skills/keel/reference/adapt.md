# adapt

Adapt the backend for **multi-env**, **multi-region**, **multi-tenant**, or **alternate consumers** (e.g. mobile BFF vs public web API) without a concealed rewrite.

Synonyms: “env matrix”, “region split”, “tenant isolation pass”, “BFF vs API”, “config per stage”.

## Intent

Make one codebase honest about **where it runs and who calls it**: config matrices, contract versioning, feature flags, and expand/contract migrations — aligned with ops reality ([ops-surfaces.md](ops-surfaces.md)).

## Flow

1. Name the adaptation axis: env (dev/stage/prod), region, tenant, or consumer surface (mobile BFF / web API / partner).
2. Inventory current contracts, config sources, and deploy entrypoints ([ops-surfaces.md](ops-surfaces.md)).
3. Prefer **config + flags + versioned contracts** over forking the domain. New deployable only when ownership/failure story demands it (shape first).
4. Contract rules:
   - Additive fields / new versions over silent breaks
   - Consumer-specific facades stay thin; shared domain owns invariants
   - Deprecation window explicit when removing
5. Data / schema changes: expand → dual-read/write → contract ([migrate.md](migrate.md)). Tenant filters and region affinity stay at the data edge.
6. Feature flags: default-safe, named owner, no flag soup for permanent topology. Document flag → behavior in ARCHITECTURE or surface brief.
7. Config matrix: required keys per env/region; fail fast on missing prod secrets; never commit real secrets.
8. Doc-sync Delivery / Operating Context / Contracts when the matrix or consumer split lands ([doc-sync.md](doc-sync.md)).
9. Eng-floor Verify on touched paths; detector on dirty files. Bound the pass.

## Checklist

- [ ] Axis named; non-goals clear (what is *not* splitting)
- [ ] Config matrix: env/region keys listed; no secret-in-repo
- [ ] Contracts versioned or explicitly compatible across consumers
- [ ] Tenant / region isolation enforced at query or gateway (not “hope”)
- [ ] Migrations follow expand/contract ([migrate.md](migrate.md))
- [ ] Make/Docker/deploy targets still match Delivery ([ops-surfaces.md](ops-surfaces.md))
- [ ] Flags have owner + removal plan or are documented as durable config

## Refuse

- Copy-paste service per env “for clarity”
- Breaking wire contracts for one consumer without inventory
- Shared DB across independently deployable services without a single owner
- Inventing multi-region active-active without PRODUCT evidence

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
