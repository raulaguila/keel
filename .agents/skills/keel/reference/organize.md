# organize

Improve package/module boundaries and dependency direction without changing product behavior.

## Flow

1. Map current import graph / folder roles (handlers, domain, adapters, infra).
2. Identify: cycles, upward deps, dump packages (`utils`, `helpers`, `common` that import everything), feature folders that reach across domains.
3. Propose a target dependency rule (e.g. `domain ← application ← adapters`) fitted to **this** repo’s language and layout — not a generic clean-architecture sermon.
4. Move code in small PR-sized steps; keep public contracts stable; update ARCHITECTURE.md boundaries section.
5. Load [eng-floor.md](eng-floor.md) before edits.

## Done when

- Dependency rule is stated and greppable
- No new cycles introduced
- Entrypoints stay thin; domain logic is not buried in transport adapters

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`).
