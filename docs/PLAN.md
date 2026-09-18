# Keel — status (v0.3)

Implemented relative to the original plan:

| Item | Status |
|------|--------|
| Skill router + eng-floor + PRODUCT/ARCHITECTURE | done |
| Scored critique + 6 personas + baselines + focus + trend | done |
| Assessment B evidence map + analysis-scope | done |
| Doc sync after code changes | done |
| Ops surfaces (Make/Docker/migrations) as evidence | done |
| `shape` ADR + `.keel/surfaces/` | done |
| Commands | full set including `ship`, `status`, scored `critique`, detect, hooks |
| Close-out | next `/keel` only for pending issues (issue-mapped); omit when clean |
| Detector (`detect.js`) | quieter HTTP timeouts, `--explain`, `--stack`, severityOverrides |
| `ship` closes critique snapshots (`closed_by: ship`) | done |
| `status` pulse CLI + playbook | done |
| Cursor `afterFileEdit` hook | done |
| `keel install` CLI (cursor/claude/agents) | done |
| Oracle + smoke fixtures | done |
| Case study `docs/cases/smelly-api.md` | done |
| Stack rubrics | done |
| Rust engine / live mode / 60+ rules | deferred |

## Install

```bash
node cli/bin/keel.js install --providers=cursor
```

## Verify

```bash
npm test
node skill/scripts/detect.js --json --explain tests/fixtures/smelly-api
node skill/scripts/status.js --help
```
