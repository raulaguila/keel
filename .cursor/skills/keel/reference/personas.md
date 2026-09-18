# Personas — backend critique

Use during `/keel critique`. Each persona catches failure modes a single “staff engineer” voice misses.

**How:** select **2–3** personas via the table below. Walk the target’s primary path as each. Report **specific red flags** (paths/symbols), not biographies.

If PRODUCT.md has real Users / Operating Context, add **1 project-specific persona**. Never invent audience details.

---

## 1. On-call SRE: "Mira"

**Profile:** Owns the pager. Cares about blast radius, signal quality, and whether 3 a.m. is diagnosable.

**Behaviors:**
- Follows one failing request/job from log → cause
- Checks timeouts, retries, and saturation defaults
- Distrusts “should never happen” without metrics
- Asks what breaks when a dependency is slow, not only down

**Test questions:**
- Can Mira find a correlation id on the critical path?
- Are outbound calls bounded (timeout + deadline)?
- Do errors name the dependency and the recovery?
- Is there a safe degrade or do all failures look identical?

**Red flags:** empty catches; no timeouts; logs without ids; retries without budget; one bad tenant can take the process down; alerts that need a human to SSH and guess.

---

## 2. Security engineer: "Kai"

**Profile:** Threat-models the change. Assumes callers are hostile and colleagues paste secrets into tickets.

**Behaviors:**
- Tries IDOR / missing authz on every sensitive read/write
- Checks webhooks, admin, jobs, and internal RPC — not only public HTTP
- Looks for secrets in env samples, logs, and fixtures
- Probes injection and SSRF on URL/file builders

**Test questions:**
- Is authz enforced where data is loaded, not only in the UI gateway?
- Are denials tested?
- Are secrets out of the repo and out of logs?
- Do service identities have least privilege?

**Red flags:** open admin; trust of client-supplied user ids; secrets in git; verbose errors leaking internals; unsigned webhooks; overly broad DB credentials.

---

## 3. Staff engineer: "Samir"

**Profile:** Guards evolvability. Hates false microservices and premature platforms.

**Behaviors:**
- Draws the real dependency graph from imports/deployables
- Counts writers per data store
- Deletes abstractions with one call site in their head
- Asks “what breaks when we change this contract?”

**Test questions:**
- Is there a clear ownership boundary for the target data?
- Do dependencies point the right way?
- Would a new engineer find the right package in 5 minutes?
- Is complexity essential or fashionable?

**Red flags:** cyclic domains; shared DB across “services”; god `utils`; event bus with one producer/consumer; ARCHITECTURE.md that lies.

---

## 4. FinOps / cost owner: "Lena"

**Profile:** Pays the bill. Optimizes for $ and waste, not microbenchmarks.

**Behaviors:**
- Traces hot paths for N+1, full scans, chatty fan-out
- Checks retention TTLs, log volume, egress across AZ/regions
- Asks for evidence before “we’ll scale horizontally”
- Flags unbounded exports and admin queries on prod primary

**Test questions:**
- What’s the most expensive operation in this target, and how do we know?
- Are list endpoints bounded?
- Do background jobs backoff and batch?
- Are we storing or shipping bytes nobody reads?

**Red flags:** `SELECT *`; unbounded `findMany`; no pagination; per-row remote calls in a loop; huge payloads logged; always-on large instances with no utilization story.

---

## 5. Downstream consumer: "Devon"

**Profile:** Integrates via API/events. Needs stable contracts and honest errors.

**Behaviors:**
- Implements against docs/OpenAPI/proto first
- Handles 4xx vs 5xx differently; needs idempotent POST/PUT guidance
- Versions carefully; hates silent field meaning changes
- Retries with backoff when the contract says it’s safe

**Test questions:**
- Do error bodies tell Devon what to fix?
- Is pagination/cursor behavior documented and stable?
- Are breaking changes detectable?
- Is idempotency specified for unsafe methods?

**Red flags:** undocumented fields; changing types without version bump; “200 + error in body”; missing idempotency keys; event payloads that can’t be evolved.

---

## 6. Chaos / edge tester: "Riley"

**Profile:** Breaks happy paths on purpose — poison messages, double delivery, partial writes, clock skew.

**Behaviors:**
- Replays webhooks and duplicate messages
- Crashes mid-transaction mentally
- Sends huge payloads, empty lists, unicode, old clients
- Watches for stuck queues and poison without DLQ

**Test questions:**
- What happens on at-least-once double delivery?
- Is there a DLQ / poison strategy?
- Do migrations and deploys allow dual-running versions?
- Are partial failures recoverable?

**Red flags:** non-idempotent consumers; no poison handling; assuming exactly-once; migrations that lock forever; state machines that deadlock on unexpected events.

---

## Selecting personas

| Surface mode / situation | Primary personas | Why |
|--------------------------|------------------|-----|
| Serve (HTTP/API) | Devon, Kai, Mira | Contracts, authz, latency failures |
| Process (workers/queues) | Mira, Riley, Lena | Pager, poison, cost of retries |
| Store (data plane) | Samir, Lena, Riley | Ownership, query cost, migration safety |
| Integrate (webhooks/partners) | Devon, Kai, Riley | Contracts, trust, replay |
| Control (admin/orchestration) | Kai, Mira, Samir | Privilege, audit, blast radius |
| “Whole repo” / unclear | Samir, Mira, Kai | Topology, operability, security baseline |
| Cost complaint | Lena + Mira | Waste + saturation |
| Pre-launch hardening | Kai, Mira, Riley | Authz + pager + edges |

---

## Project-specific persona template

Only when PRODUCT.md has real audience/ops facts:

```markdown
### [Role]: "[Name]"

**Profile**: … (from PRODUCT.md)
**Behaviors**: …
**Red flags for this target**: …
```
