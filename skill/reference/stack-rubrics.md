# stack-rubrics.md

Optional depth for Assessment B / category scoring. Use when the stack is clear; never force.

## TypeScript / Node (Nest, Express, Fastify)

- HTTP clients without `AbortSignal` / timeout → Reliability −
- `prisma.findMany` / `repo.find` without `take`/`limit` on list endpoints → Cost/Perf −
- `for (… of …) await prisma.` → N+1 smell
- `catch (e) {}` / `catch { return null }` on request path → Reliability −
- Nest modules importing across domain modules cyclically → Boundaries −

## Python (Django, FastAPI, Flask)

- ORM `.all()` on request path without slicing → Cost −
- `except Exception: pass` → Reliability −
- `requests.get` without timeout → Reliability −
- Missing `select_related`/`prefetch_related` in loops → Cost −
- `settings` secrets committed → Security P0

## Go

- `http.Client` without `Timeout` → Reliability −
- Ignoring `ctx` on outbound calls → Reliability −
- `SELECT *` in raw SQL → Cost −
- Shared `database/sql` global without limits → Operability −

## Ruby on Rails

- N+1 (`has_many` without `includes`) → Cost −
- `rescue StandardError` swallow → Reliability −
- `update_attribute` bypassing validation on money paths → Data −

## Java / Kotlin (Spring)

- `RestTemplate`/`WebClient` without timeouts → Reliability −
- `@Transactional` on huge request scopes → Data/Perf −
- Open `actuator` without auth → Security P0
