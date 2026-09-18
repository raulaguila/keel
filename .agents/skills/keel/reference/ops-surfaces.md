# Ops surfaces

Lightweight **ops intelligence**: treat Makefile, Docker/Compose, migration trees, and deploy entrypoints as first-class evidence — not as a separate product.

Use during Assessment B (`critique`), `document`, `ship`, `migrate`, `load`, and doc-sync. Do not invent pipelines the repo does not have.

## What to read (when present)

| Surface | Typical paths | What to extract |
|---------|---------------|-----------------|
| Make | `Makefile`, `make/*.mk` | Targets for `test`, `migrate`, `run`, `docker-*`, `lint`; phony vs real; dangerous `rm -rf` |
| Docker | `Dockerfile`, `Dockerfile.*` | Base image tags (`:latest`?), `USER`, healthcheck, multi-stage, secrets via `ENV`/`ARG` |
| Compose | `docker-compose*.yml`, `compose*.yaml` | Services, ports, volume mounts of secrets, restart, depends_on vs health |
| Migrations | `migrations/`, `supabase/migrations/`, `prisma/migrations/`, `db/migrate/`, `flyway/`, `liquibase/` | Tool, expand/contract clues, irreversible drops |
| Deploy | `.github/workflows/*`, `Procfile`, `railway.toml`, `fly.toml`, `helm/`, `k8s/` | Migrate-before-traffic? rollback story? |
| Scripts | `scripts/`, `bin/` | One-off migrate/seed that bypass Make |

Skip Keel-owned trees ([analysis-scope.md](analysis-scope.md)).

## Judgment cues (not automatic fails)

- **Make is the contract** — if CI calls `make test` but README invents other commands, note drift for `document` / doctor.
- **`:latest` / no `USER`** on production Dockerfiles → Reliability / Security soft hit; prefer digest or pinned minor + non-root.
- **Secrets in compose env files committed** → Security P0 evidence.
- **Migrate not in ship path** — app has `migrations/` but Make/CI/deploy never runs them → Delivery gap.
- **Drop column / drop table** in a single-step migration without expand window → Data integrity risk (`migrate` playbook).
- **One-shot `docker build` without healthcheck** on Serve mode → Operability soft hit when on-call needs ready probes.

## How Assessment B uses this

Return a short **Ops surfaces** blurb:

```text
Ops: Makefile (test, migrate, docker-up) · Dockerfile (node:20-alpine, USER node) · prisma/migrations (12) · no compose
```

Cite path:line for any Priority Issue rooted in ops (e.g. `Dockerfile:1` `:latest`, `Makefile` missing `migrate`).

## Detector

Optional: `detect.js --stack=…` still covers **code**. Ops file smells are primarily agent judgment via this doc until a dedicated ops pack exists. Do not pretend detector scanned Dockerfiles unless it did.

## Doc sync

When you change Makefile targets, image entrypoints, or migration tooling, update `ARCHITECTURE.md` **Delivery** in the same pass ([doc-sync.md](doc-sync.md)).

## Refuse

- Recommending Kubernetes / service mesh because a Dockerfile exists
- Inventing Make targets or CI jobs
- Rewriting the user’s deploy platform “for best practice” without a named issue
