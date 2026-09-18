# onboard

Backend **product onboarding / activation** — first tenant, API keys, webhook registration, empty data-plane states, time-to-first-success. Not UI onboarding, wizards, or frontend empty screens.

Synonyms the user may say: “activation path”, “first success”, “bootstrap tenant”, “get first API call working”, “empty state for the API”.

## Intent

Make a new integrator or tenant reach **one successful production-shaped action** fast: authenticate, register callbacks if needed, see honest empty-vs-error data responses, and leave with a clear next call. Modes **Serve** and **Integrate** dominate.

## Flow

1. Read PRODUCT.md Users / Operating Context and ARCHITECTURE.md Contracts + Delivery. Respect [analysis-scope.md](analysis-scope.md).
2. Map the **activation path** end-to-end (backend only):
   - Create or provision first tenant / workspace / project
   - Issue and store API keys or OAuth client credentials (rotation, scope, display-once)
   - Webhook / callback registration (URL verify, secret, event filter)
   - First write or first meaningful read against the data plane
3. Define **empty states** for list/get surfaces: empty collection vs missing tenant vs unauthorized — distinct status/body shapes, never opaque 500s for “no rows yet”.
4. Instrument **time-to-first-success**: what metric or log proves the first successful call (tenant id + route + outcome). Do not invent SLOs; name the signal only.
5. Close gaps with the smallest stack-native mechanism (seed endpoint, admin CLI, documented curl sequence). Prefer one happy-path script over a new service.
6. If activation path, Users, or Delivery changed → [doc-sync.md](doc-sync.md) on PRODUCT.md **Users** / Delivery and matching surfaces.
7. Load [eng-floor.md](eng-floor.md) before code edits. Bound: one inspect → one fix batch → one confirm → stop.

## Checklist

- [ ] First-tenant / project creation path exists and is owned
- [ ] API key (or equivalent) issue + revoke + scope documented in Contracts
- [ ] Webhook registration + verification + failure signal (Integrate)
- [ ] Empty list/get ≠ error; authz denial ≠ empty
- [ ] First-success signal named (log/metric), not invented as SLO
- [ ] Docs: PRODUCT Users / Delivery updated if path changed ([doc-sync.md](doc-sync.md))

## Refuse

- Frontend tour / UI empty-state redesign framed as “onboarding”
- Inventing multi-step product marketing funnels
- Storing plaintext secrets in repo or returning full key on every list call
- Collapsing unauthorized and empty into the same response

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`). Prose in the **user's language** (SKILL.md).
