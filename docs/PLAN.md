# Keel — status (v0.4)

| Item | Status |
|------|--------|
| Skill router + eng-floor + PRODUCT/ARCHITECTURE | done |
| Scored critique + personas + baselines + focus + trend | done |
| Doc sync + ops surfaces | done |
| `shape` ADR + surfaces | done |
| `onboard` / `adapt` / `new-work` + mode depth | done |
| `live` HTTP probe | done |
| Stop hook deep pass + config.local | done |
| `doctor --json/--fix` | done |
| `pin` shims + command-metadata | done |
| Detector ~50 rules + ops pack | done |
| Subagents (documenter, finish-reviewer, ops-reader) | done |
| Multi-provider install (cursor/claude/agents/codex/gemini/copilot) | done |
| Provider sync script | done |
| Rust engine | deferred (Node detector sufficient) |

## Verify

```bash
npm test
npm run sync
node cli/bin/keel.js doctor --json
node skill/scripts/detect.js --list-rules | wc -l
```
