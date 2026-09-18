# Keel

Backend craft for AI coding agents. 1 skill, 24 commands, live HTTP probing, and 48 deterministic detector rules for AI-generated backends.

> **Quick start:** From your project root, run `npx --yes github:raulaguila/keel install`, then run `/keel init` inside your AI coding tool. Provider details: [INSTALL.md](INSTALL.md).

## Why Keel?

Models trained on the same API tutorials ship the same backend tells: empty `catch` blocks as “MVP”, unbounded `findMany`, `SELECT *`, secrets in source, HTTP clients with no timeouts, and invented SLOs in the review comments.

Keel adds:

- **One setup flow.** `/keel init` records durable product truth in `PRODUCT.md`. `/keel document` captures topology in `ARCHITECTURE.md`. Later commands reuse those facts instead of guessing.
- **24 commands.** A shared backend vocabulary with your AI: `shape`, `critique`, `audit`, `secure`, `harden`, `ship`, and more.
- **48 deterministic detector rules** plus scored LLM critique (`/32`). The CLI runs the detector with no LLM and no API key.
- **Evidence over vibes.** Invent no QPS, SLOs, or cost numbers you cannot point to in code, schemas, or ops files.

Pair with [Impeccable](https://github.com/pbakaus/impeccable) for frontend and [Bridge](https://github.com/raulaguila/bridge) when FE and BE ship together.

## What's Included

### The Skill: keel

The skill installs as one command:

```bash
/keel <command> <target>
```

Start every new project with:

```bash
/keel init
```

`init` inspects the project, asks only for material gaps in durable product truth, and writes `PRODUCT.md`. Architecture is generated later with `/keel document`; per-feature contracts land in `.keel/surfaces/` after `/keel shape`.

### 24 Commands

All commands are accessed through `/keel`:

| Command | What it does |
|---------|--------------|
| `/keel init` | One-time setup: gather durable product context, write `PRODUCT.md`, recommend next steps |
| `/keel document` | Generate or refresh `ARCHITECTURE.md` from existing code |
| `/keel shape` | Plan APIs, data, and boundaries (ADR + surface) before writing code |
| `/keel extract` | Promote duplicated patterns (≥2 call sites) into shared libs |
| `/keel onboard` | Activation path: first tenant, keys, webhooks, empty states |
| `/keel adapt` | Multi-env / region / tenant / alternate consumer |
| `/keel critique` | Scored review `/32`: personas, backlog, trend (`--quick` for a short pass) |
| `/keel audit` | Broad checklist: correctness, security, reliability, observability |
| `/keel cost` | Rank cost drivers (no invented bills) |
| `/keel secure` | Threat sketch + authz matrix |
| `/keel observe` | Telemetry gaps (logs / metrics / traces / cardinality) |
| `/keel doctor` | Drift of Keel artifacts vs the repo (`--json` / `--fix`) |
| `/keel status` | Pulse of score / P0 from critique snapshots |
| `/keel ship` | Close critique backlog; release gate (`closed_by: ship`) |
| `/keel organize` | Package boundaries and dependency direction |
| `/keel distill` | Strip accidental complexity |
| `/keel harden` | Timeouts, retries, idempotency, authz edges |
| `/keel migrate` | Safe schema / API evolution (expand / contract) |
| `/keel optimize` | Hot path, N+1, contention |
| `/keel clarify` | Names, contracts, errors, docs |
| `/keel load` | Capacity model and backpressure |
| `/keel live` | Probe a running HTTP service (not a browser) |
| `/keel hooks` | Detector hook admin (`on` / `off` / ignores) |
| `/keel pin` | Create standalone shortcuts (e.g. `pin audit` → `/audit`) |

**Alias:** `polish` → `ship`.  
Bare `/keel` (no args) recommends 2–3 commands — it does not auto-run them.

#### Usage Examples

```
/keel critique payments        # Score the payments module
/keel audit src/api            # Broad quality pass
/keel harden checkout          # Timeouts, retries, idempotency
/keel ship                     # Close P0/P1 and gate release
```

Or use `/keel` with a description:

```
/keel make this worker safe to retry
```

### Anti-Patterns

The skill includes explicit guidance on what to avoid:

- Don't invent SLOs, QPS, latency budgets, or dollar costs without evidence
- Don't treat empty `catch` / swallowed errors as an acceptable MVP
- Don't ship unbounded list queries or `SELECT *` on hot paths
- Don't hardcode secrets, disable TLS verify, or leave `TODO(security)` in tree
- Don't smell-score `PRODUCT.md`, `ARCHITECTURE.md`, or `.keel/**` — use `doctor` for artifact drift

## Installation

Keel is a skill folder plus small Node scripts (detector, doctor, status, live, hooks). Node **20+** is required for install and CLI. No separate binary download.

### Option 1: CLI installer (Recommended)

From the root of your project, run either:

```bash
npx --yes github:raulaguila/keel install
```

or:

```bash
curl -fsSL https://raw.githubusercontent.com/raulaguila/keel/master/install.sh | bash -s --
```

Default provider is `cursor`. Pass providers explicitly:

```bash
npx --yes github:raulaguila/keel install --providers=cursor,claude,cline
npx --yes github:raulaguila/keel install --providers=all
npx --yes github:raulaguila/keel install --providers=cursor --no-hooks
```

On Cursor, Claude Code, GitHub Copilot, Codex, and Grok Build, install also wires the provider-native detector hook (unless `--no-hooks`). Reload your harness afterward, then run `/keel init`.

To refresh an existing install:

```bash
npx --yes github:raulaguila/keel update --providers=cursor,claude
# or the same curl install.sh line again
```

Pin a tag or branch with the curl installer: `KEEL_REF=v0.4.2 curl -fsSL …/install.sh | bash -s -- --providers=cursor`.

Full per-harness table: **[INSTALL.md](INSTALL.md)**.

### Option 2: Clone once (optional)

```bash
git clone https://github.com/raulaguila/keel.git /tmp/keel-skill
cd /path/to/your/project
node /tmp/keel-skill/cli/bin/keel.js install --providers=cursor
```

### Option 3: Copy from repository

```bash
# Cursor example — prefer Option 1 so hooks are wired
cp -r skill your-project/.cursor/skills/keel
```

> **Note (Cursor):** enable Agent Skills in Cursor Settings.  
> [Learn more about Cursor skills](https://cursor.com/docs/context/skills)

Paths for other harnesses (Claude, Codex, Gemini, Copilot, Cline, …) are listed in [INSTALL.md](INSTALL.md).

## Usage

Once installed, every command runs through the single `/keel` skill:

```
/keel audit
/keel critique
/keel harden
/keel ship
```

Type `/keel` alone for routing suggestions. Most commands accept an optional target:

```
/keel audit the billing worker
/keel critique src/orders
```

Pin a frequent command with `/keel pin audit` to get `/audit` as a standalone shortcut.

**Note:** Codex uses skills (open `/skills` or type `$keel`), not `/prompts:` commands. Repo-local installs live under `.agents/skills/`; Copilot uses `.github/skills/`. Restart the tool if a newly installed skill does not appear.

## Keeping `.keel` out of git

As you run commands, Keel writes working files under `.keel/`: critique snapshots, session hook state, and per-developer config. Most of it is ephemeral. Add this block to your project's `.gitignore`:

```gitignore
# keel-ignore-start
.keel/config.local.json
.keel/session-touched.json
.keel/critique/
# keel-ignore-end
```

**Keep these tracked** (shared project artifacts):

- `.keel/config.json` (shared hook + detector config)
- `.keel/surfaces/*.md` (accepted feature contracts from `shape`)

`PRODUCT.md` and `ARCHITECTURE.md` live at the repo root and should stay tracked.

## Detector hook

On Cursor, Claude Code, GitHub Copilot, Codex, and Grok Build, `install` / `update` can install a provider-native hook along with the skill. The hook runs the Keel detector on backend file edits and surfaces findings back into the agent flow (edit pass for primary findings; deeper Stop pass where supported). Hooks fail open.

Installed hook surfaces:

- **Cursor:** `.cursor/hooks.json` → `node .cursor/skills/keel/scripts/hook.js` (`afterFileEdit` + `stop`)
- **Claude Code:** PostToolUse + Stop via project settings → `scripts/hook.js`
- **GitHub Copilot:** `.github/hooks/keel.json`
- **Codex:** `.codex/hooks.json`
- **Grok Build:** `.grok/hooks/keel.json` (folder trust required)

Manage with `/keel hooks on|off|status|ignore-rule|ignore-file|reset`. Shared settings live in `.keel/config.json`; per-dev consent in gitignored `.keel/config.local.json`. Skip hooks for one run with `--no-hooks`.

## CLI

Keel includes a standalone CLI for detect / doctor / status / live without an AI chat turn:

```bash
npx --yes github:raulaguila/keel detect src/
npx --yes github:raulaguila/keel detect --json --stack=node src/
npx --yes github:raulaguila/keel doctor --json
npx --yes github:raulaguila/keel status --json
npx --yes github:raulaguila/keel live --base=http://127.0.0.1:3000 --path=/health
```

Or after a local clone: `node cli/bin/keel.js …` / `node skill/scripts/detect.js …`.

Exit codes: `0` clean / ok · `2` findings or HTTP mismatch · `1` operational error.

## Supported Tools

- [Cursor](https://cursor.com)
- [Claude Code](https://claude.ai/code)
- [GitHub Copilot](https://github.com/features/copilot)
- [Codex CLI](https://github.com/openai/codex)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [Cline](https://github.com/cline/cline)
- [Continue](https://continue.dev)
- [OpenCode](https://opencode.ai)
- [Windsurf](https://windsurf.com)
- [Grok Build](https://x.ai/cli)
- [Hermes Agent](https://hermes-agent.nousresearch.com)
- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
- [Pi](https://pi.dev)
- [Kiro](https://kiro.dev)
- [Trae](https://trae.ai)
- [Rovo Dev](https://www.atlassian.com/software/rovo)
- [Qoder](https://qoder.com)
- [Mistral Vibe](https://docs.mistral.ai/vibe/code/overview)
- [Veto](https://github.com/oleg-koval/veto)
- [Google Antigravity](https://antigravity.google)
- Aider (manual skill path)

## License

Apache 2.0. See [LICENSE](LICENSE).

---

Backend analog of [Impeccable](https://github.com/pbakaus/impeccable). FE↔BE orchestration: [Bridge](https://github.com/raulaguila/bridge).
