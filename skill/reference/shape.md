# shape

Plan the **implementation of a new module/feature** before writing code: short ADR + trade-offs + surface brief.

## Flow

1. Read PRODUCT.md (+ ARCHITECTURE.md if present). Resolve mode (Serve / Process / Store / Integrate / Control).
2. Restate job-to-be-done and non-goals (3–5 bullets). Confirm if ambiguous.
3. Run the **trade-off checklist** (below). Prefer the **smallest** topology that meets PRODUCT constraints.
4. Draft the design note using the ADR template (chat + file).
5. After user acceptance, write `.keel/surfaces/<slug>.md` from [../assets/templates/surface.md](../assets/templates/surface.md). Do not implement until accepted (unless user said “shape and build”).
6. Load [eng-floor.md](eng-floor.md) only when starting code.

## Trade-off checklist (answer explicitly)

| Question | Options to consider |
|----------|---------------------|
| Sync vs async? | In-request work vs queue/worker |
| Module vs new service? | Package in-process vs new deployable |
| Who owns the data? | Single writer aggregate; no shared DB by default |
| Consistency need? | Strong / eventual / read-your-writes |
| Failure mode? | Fail closed vs degrade; timeout; retry; idempotency; DLQ |
| Contract surface? | HTTP / events / both; versioning; errors |
| Cost hotspots? | Fan-out, large lists, chatty deps |
| Observability? | Metrics/logs/traces on the critical path |

Justify every **new** moving part (extra service, DB, topic). Default is **no**.

## ADR template (output)

Write in the **user’s language**:

```markdown
# ADR: <feature title>
Status: proposed | accepted | superseded
Mode: Serve | Process | Store | Integrate | Control
Date: <ISO date>

## Context
…

## Decision
…

## Alternatives considered
1. … — rejected because …
2. … — rejected because …

## Consequences
- Positive: …
- Negative / follow-ups: …

## Contracts (sketch)
- Endpoints/events: …
- Errors / idempotency: …

## Failure & ops
- Timeouts / retries / DLQ: …
- Metrics / logs: …

## Open questions
- …
```

## Surface file

After acceptance, save under `.keel/surfaces/<slug>.md` (slug = kebab feature name). Keep PRODUCT/ARCHITECTURE updated only if boundaries change globally — prefer surface-local truth for the feature.

## Language

All prose in the user’s language. Keep API field names and status codes as in the contract.

## Scope

Do not smell-analyze Keel-owned paths ([analysis-scope.md](analysis-scope.md)).
