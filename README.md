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
/keel critique              # 8 category scores + personas + backlog
/keel cost checkout
/keel harden worker/orders
```

Bare `/keel` shows a context-aware menu (never auto-runs).

### Critique (Impeccable-style scoring)

`/keel critique` grades the target on **8 categories** (0–4 each, usually **/32**), walks **2–3 engineering personas** (SRE, security, staff, FinOps, API consumer, chaos), and lists **P0–P3** fixes with suggested `/keel` follow-ups. Details: `skill/reference/critique.md` + `personas.md`.

## What you get

| Layer | MVP |
|-------|-----|
| Router skill | `/keel <command>` |
| Context | `PRODUCT.md` + `ARCHITECTURE.md` templates |
| Floor | `reference/eng-floor.md` (Verify + Refuse) |
| Commands | init, document, shape, critique (scored + personas), audit, cost, organize, distill, harden, optimize, clarify |
| Detector / hooks | Planned (Phase 3) |

## Inspired by

[pbakaus/impeccable](https://github.com/pbakaus/impeccable) — same shell (one skill, durable context, command vocabulary, craft floor, dual critique), different domain (backend systems instead of UI).

## License

Apache-2.0 (intended; add LICENSE before publishing).
