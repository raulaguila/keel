# extract

Promote duplicated backend patterns into a shared module/platform library without building a framework for one call site.

## Flow

1. Find ≥2 real call sites of the same pattern (retry helper, authz guard, outbox, pagination, error mapper).
2. Design the smallest extracted API that preserves behavior.
3. Move code; update imports; keep old path as thin re-export only if needed for a short migrate window.
4. Add tests at the extracted boundary.
5. Update ARCHITECTURE.md Boundaries / conventions.

## Refuse

- Extracting with a single call site
- Abstracting before the second use exists
- New DI/container ceremony unless the stack already uses it
