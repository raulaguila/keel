# Case study: smelly-api → scored critique → polish loop

## Before

Fixture `tests/fixtures/smelly-api` triggers detector rules: empty-catch, SELECT *, hardcoded secret, unbounded findMany, fetch without timeout.

Example critique (illustrative):

| Category | Score |
|----------|-------|
| Boundaries | 2 |
| Contracts | 1 |
| Reliability | 0 |
| Data | 1 |
| Security | 0 |
| Cost | 0 |
| Operability | 1 |
| Organization | 2 |
| **Total** | **7/32 Critical** |

Personas Mira/Kai/Lena all raise P0s on secrets + empty catch + unbounded lists.

## After (target after `/keel polish` + harden)

- Secrets in env
- Timeouts + AbortSignal on fetch
- Pagination on list
- Authz + structured errors
- No empty catches

Target band: **Acceptable→Good (16–24/32)** depending on remaining observability.

## Loop

```
/keel critique tests/fixtures/smelly-api
node skill/scripts/detect.js --json tests/fixtures/smelly-api
/keel polish
/keel critique   # trend should rise
```
