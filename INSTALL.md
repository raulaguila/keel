# Install Keel on many agents / models

Run from **your project root**. No clone required.

> Prefer the [README](README.md) quick start. This page is the full provider table.

## Direct install (recommended)

```bash
cd /path/to/your/project

# curl — fetch master to a temp dir, install, clean up
curl -fsSL https://raw.githubusercontent.com/raulaguila/keel/master/install.sh | bash -s -- --providers=cursor

# npx — GitHub package (Node 20+)
npx --yes github:raulaguila/keel install --providers=cursor
```

Multiple providers / Cline / no hooks:

```bash
curl -fsSL https://raw.githubusercontent.com/raulaguila/keel/master/install.sh | bash -s -- --providers=cursor,claude,cline
npx --yes github:raulaguila/keel install --providers=all
npx --yes github:raulaguila/keel install --providers=cursor --no-hooks
```

Pin tag or branch: `KEEL_REF=v0.4.2 curl -fsSL …/install.sh | bash -s -- --providers=cursor`

## Local clone (optional)

```bash
git clone https://github.com/raulaguila/keel.git /tmp/keel-skill
cd /path/to/your/project
node /tmp/keel-skill/cli/bin/keel.js install --providers=cursor
```

## One command per harness

| Harness / agent | Command |
|-----------------|---------|
| Cursor | `… install --providers=cursor` |
| Claude Code | `… install --providers=claude` |
| Codex / Agents | `… install --providers=codex` or `agents` |
| Gemini CLI | `… install --providers=gemini` |
| GitHub Copilot | `… install --providers=copilot` |
| OpenCode | `… install --providers=opencode` |
| Windsurf | `… install --providers=windsurf` |
| Continue | `… install --providers=continue` |
| Cline | `… install --providers=cline` |
| Grok Build | `… install --providers=grok` |
| Kiro | `… install --providers=kiro` |
| Pi | `… install --providers=pi` |
| Trae / Trae CN | `… install --providers=trae` or `trae-cn` |
| Hermes | `… install --providers=hermes` |
| DeepSeek Harness | `… install --providers=dsh` |
| Qoder | `… install --providers=qoder` |
| Rovo Dev | `… install --providers=rovo-dev` |
| Mistral Vibe | `… install --providers=vibe` |
| Veto | `… install --providers=veto` |
| Antigravity | `… install --providers=antigravity` |
| Aider (manual path) | `… install --providers=aider` |

## Several at once

```bash
npx --yes github:raulaguila/keel install --providers=cursor,claude,codex,gemini,copilot
npx --yes github:raulaguila/keel install --providers=all
npx --yes github:raulaguila/keel install --list-providers
npx --yes github:raulaguila/keel install --providers=cursor --no-hooks
```

## Where the skill is copied

| Provider | Project folder | Invoke |
|----------|----------------|--------|
| `cursor` | `.cursor/skills/keel` | `/keel` |
| `claude` | `.claude/skills/keel` | `/keel` |
| `agents` / `codex` | `.agents/skills/keel` (+ `.codex/skills/keel`) | `/keel` |
| `gemini` | `.gemini/skills/keel` | `/keel` |
| `copilot` | `.github/skills/keel` | `/keel` |
| `continue` | `.continue/skills/keel` | `/keel` |
| `cline` | `.cline/skills/keel` (+ `.clinerules/skills/keel`) | `/keel` |
| `opencode` | `.opencode/skills/keel` | `/keel` |
| `grok` | `.grok/skills/keel` | `/keel` |
| … | see `--list-providers` | `/keel` |

Detector hooks (edit + stop) wire automatically on **Cursor**, **Claude Code**, **Copilot**, **Codex**, and **Grok** (pass `--no-hooks` to skip).

## After install

1. Reload the harness / reopen Agent chat.
2. Run `/keel init` in the project.
3. Optional: `npx --yes github:raulaguila/keel detect --json src/`

## Update

Same command as install (overwrites the skill copy):

```bash
curl -fsSL https://raw.githubusercontent.com/raulaguila/keel/master/install.sh | bash -s -- --providers=cursor,claude
# or: npx --yes github:raulaguila/keel update --providers=cursor,claude
```

`update` is an alias of `install`.
