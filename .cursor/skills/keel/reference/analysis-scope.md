# Analysis scope

Shared rules for `critique`, `audit`, `cost`, `secure`, `observe`, `optimize`, `harden`, and detector runs.

## Application targets (analyze these)

Prefer: `src/`, `app/`, `apps/*/src`, `services/`, `internal/`, `pkg/`, `lib/` (when app code), `cmd/`, workers, API handlers, migrations for the **product**.

Also read as **ops evidence** (not smell-targets unless user says so): `Makefile`, `Dockerfile*`, `docker-compose*.yml`, `compose*.yaml`, deploy manifests — see [ops-surfaces.md](ops-surfaces.md).

## Keel-owned / harness (do not analyze as app code)

Unless the user **explicitly** names them as the target:

- `PRODUCT.md`, `ARCHITECTURE.md`
- `.keel/**` (except reading critique snapshots as *input backlog* for `ship` / `status`)
- `.cursor/skills/**`, `.claude/skills/**`, `.agents/skills/**`
- This skill’s `reference/`, `assets/`, `scripts/` when the opened repo is Keel itself — still skip for product analysis; use `tests/fixtures/` only when testing the detector

## Detector

```bash
node <skill-base-dir>/scripts/detect.js --json <app-target>
```

Never pass `.` if that would only surface skill trees; pass `src` / service path. Root `.` is OK when ignores exclude harness dirs (default).

## Doctor exception

`doctor` **only** checks artifact drift — see [doctor.md](doctor.md). It does not score PRODUCT prose.
