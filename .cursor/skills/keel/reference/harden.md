# harden

Production readiness for failure: timeouts, retries, idempotency, authz edges, degradation.

## Flow

1. Enumerate the target’s dependency graph (DB, cache, HTTP, queues, disk).
2. For each edge: timeout, retry policy, idempotency, what the user/caller sees on failure.
3. Close gaps with the **smallest** mechanism already in the stack (don’t add a mesh to fix one client).
4. Cover denial paths and dependency-down paths with tests where cheap; document the rest in ARCHITECTURE.md.
5. Load [eng-floor.md](eng-floor.md).

## Checklist

- [ ] Timeouts on all outbound I/O
- [ ] Retry budgets + jitter; no retry on non-idempotent calls without keys
- [ ] Authz denials are explicit and tested for sensitive routes
- [ ] Poison messages / DLQ story for consumers
- [ ] Partial failure behavior is defined (fail closed vs degraded)
- [ ] Backpressure or shedding under overload (at least a plan)

---

## Close

End with **Next commands** per [next-commands.md](next-commands.md). Never finish silent.
