# distill

Strip accidental complexity. Behavior and contracts stay; ceremony goes.

## Targets

- Abstractions with one call site
- Premature event buses / CQRS / generic repositories
- Config flags that never flip
- Duplicate types / mappers that only rename fields
- Indirection added “for testability” that tests don’t use

## Flow

1. Name the essential complexity (what PRODUCT.md requires).
2. List candidates to delete/inline with blast radius.
3. Prefer delete → inline → merge packages over adding a new “simplified” framework.
4. Verify with existing tests; add only where you remove coverage.

## Refuse

- Distilling by rewriting into a new architecture fashion
- Removing error handling or authz as “noise”

---

## Close

End with **Next commands** per [next-commands.md](next-commands.md). Never finish silent.
