# critique

Resolve one stable target (service, module, API surface, or path). Run two assessments, synthesize, ask what to improve next.

Chat report is the deliverable. Optionally write `.keel/critique/<timestamp>__<slug>.md` as archive.

## Hard invariants

- **Assessment A** (architecture / API judgment) and **Assessment B** (deterministic evidence) are both required.
- Run A and B as **isolated sub-agents** when Task/sub-agent tools exist. Inline = degraded: first line must be `⚠️ DEGRADED: single-context (<reason>)`.
- Finish A before folding B into parent synthesis (detector output anchors judgment if mixed early).
- Viewable/runnable targets: prefer reading traces, tests, OpenAPI, migration history, and one real request path when available.
- End with questions **last** — nothing after the question block.

## Assessment A — Engineering judgment

Without detector dumps, evaluate:

- Boundary clarity and data ownership
- Coupling / cyclic deps / god modules
- Contract quality (errors, versioning, pagination)
- Failure modes and blast radius
- Operability (deploy, migrate, debug)
- Fit to PRODUCT.md constraints and surface mode
- Accidental complexity vs essential complexity

Score heuristically: what’s P0 (wrong/unsafe), P1 (will hurt at modest scale), P2 (craft).

## Assessment B — Evidence

Gather what exists without an LLM detector in MVP:

- Tests: what’s covered / missing on failure paths
- Grep/lint: empty catches, TODO(security), SELECT *, missing timeout near HTTP clients (language-aware heuristics)
- Dependency direction (who imports whom)
- Config: pool sizes, timeouts, retry defaults
- Infra: single DB shared across deployables, missing indexes on obvious FK filters (when schema visible)

If a future `keel detect` exists, run it here. If not, say so — do not pretend.

## Synthesis

Merge A+B into a ranked backlog. Distinguish **evidence** vs **judgment**. Recommend 2–3 concrete next `/keel` commands (`harden`, `organize`, `optimize`, `cost`, …).
