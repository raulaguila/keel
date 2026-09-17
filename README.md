# Keel

Backend craft skill for AI coding agents — the Impeccable-shaped counterpart for APIs, workers, data, architecture, performance, cost, and organization.

> **Status:** MVP skill (playbooks + templates). No detector binary yet. See [docs/PLAN.md](docs/PLAN.md).

## Quick start (Cursor)

```bash
# from this repo
mkdir -p .cursor/skills
cp -R skill .cursor/skills/keel
# or symlink:
# ln -s "$(pwd)/skill" .cursor/skills/keel
```

In Cursor Agent chat:

```
/keel init
/keel document
/keel critique payments-api
/keel cost checkout
/keel harden worker/orders
```

Bare `/keel` shows a context-aware menu (never auto-runs).

## What you get

| Layer | MVP |
|-------|-----|
| Router skill | `/keel <command>` |
| Context | `PRODUCT.md` + `ARCHITECTURE.md` templates |
| Floor | `reference/eng-floor.md` (Verify + Refuse) |
| Commands | init, document, shape, critique, audit, cost, organize, distill, harden, optimize, clarify |
| Detector / hooks | Planned (Phase 3) |

## Inspired by

[pbakaus/impeccable](https://github.com/pbakaus/impeccable) — same shell (one skill, durable context, command vocabulary, craft floor, dual critique), different domain (backend systems instead of UI).

## License

Apache-2.0 (intended; add LICENSE before publishing).
