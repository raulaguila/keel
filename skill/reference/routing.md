# Command guidance

## Workflow questions

Advise without executing; the menu below is only for bare `/keel` invocations.

## No-argument routing

When the user runs `/keel` with no argument, recommend **2–3** next commands with one-line reasons, then list the full Commands table from SKILL.md. **Never auto-run.**

Signals (filesystem only in MVP):

| Signal | Lead with |
|--------|-----------|
| No `PRODUCT.md` | `init` |
| `PRODUCT.md` yes, no `ARCHITECTURE.md`, but substantial backend code | `document` |
| Never critiqued / large recent backend churn | `critique <target>` |
| Hot path or slow endpoint complaint | `optimize` or `cost` |
| Tangled packages / unclear layers | `organize` or `distill` |
| Shipping soon / reliability gaps | `harden` then `audit` |
| New feature, no design yet | `shape` |

If git dirty files point at one service or module, scope recommendations to that path.
