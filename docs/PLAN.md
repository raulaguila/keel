# Keel — status (v0.2)

Implemented relative to the original plan:

| Item | Status |
|------|--------|
| Skill router + eng-floor + PRODUCT/ARCHITECTURE | done |
| Scored critique + 6 personas + baselines + focus + trend | done |
| Commands | full set including `ship`, scored `critique`, detect, hooks |
| Close-out | next `/keel` only for pending issues (issue-mapped); omit when clean ([next-commands.md](skill/reference/next-commands.md)) |
| Detector MVP (`skill/scripts/detect.js`, ~18 rules) | done |
| Cursor `afterFileEdit` hook | done |
| `keel install` CLI (cursor/claude/agents) | done |
| Oracle fixture `tests/fixtures/smelly-api` | done |
| Case study `docs/cases/smelly-api.md` | done |
| Stack rubrics | done |
| Rust engine / live mode / 60+ rules | deferred |

## Install

```bash
node cli/bin/keel.js install --providers=cursor
# keel install --providers=cursor,claude,agents
```

## Verify

```bash
npm run test:detector
node skill/scripts/detect.js --json tests/fixtures/smelly-api
```
