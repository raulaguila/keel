# Command guidance

## Workflow questions

Advise without executing; the menu below is only for bare `/keel` invocations.

## No-argument routing

Recommend **2–3** next commands with one-line reasons, then list the Commands table. **Never auto-run.**

| Signal | Lead with |
|--------|-----------|
| No `PRODUCT.md` | `init` |
| PRODUCT yes, no ARCHITECTURE, backend code exists | `document` |
| Stale/missing Keel artifacts | `doctor` |
| Never critiqued / “give me a score” | `critique` |
| Critique snapshot with open P0/P1 | `ship` (release gate; alias: `polish`) |
| Hot path / slow / $$$ | `optimize` or `cost` |
| Authz / secrets concern | `secure` |
| Telemetry gaps | `observe` |
| Schema change | `migrate` |
| Capacity question | `load` |
| Tangled packages | `organize` / `distill` / `extract` |
| Shipping soon | `harden` then `audit` |
| New feature, no design | `shape` / follow [new-work.md](new-work.md) |
| Activation / first-run / empty tenant | `onboard` |
| Multi-env / multi-tenant / other consumers | `adapt` |
| Running service to probe | `live` |
| Detector noisy | `hooks status` |
| Want `/audit` shortcut | `pin add audit` |

Optional: run `node <skill>/scripts/detect.js --json` on git-dirty backend files and fold primary hits into recommendations.

If git dirty files point at one module, scope commands to that path.

## After a command finishes

Close per [next-commands.md](next-commands.md): suggest next `/keel` only for **pending issues** from that run; if none, suggest nothing.
