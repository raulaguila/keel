# Instalar Keel em diversos agentes / modelos

Clone ou baixe o repo e rode o instalador **no diretório do seu projeto** (não precisa ser dentro deste repo).

```bash
git clone https://github.com/raulaguila/keel.git /tmp/keel-skill
cd /caminho/do/seu/projeto
node /tmp/keel-skill/cli/bin/keel.js install --providers=cursor
```

## Um comando por harness

| Harness / agente | Comando |
|------------------|---------|
| Cursor | `node …/keel.js install --providers=cursor` |
| Claude Code | `node …/keel.js install --providers=claude` |
| Codex / Agents | `node …/keel.js install --providers=codex` ou `agents` |
| Gemini CLI | `node …/keel.js install --providers=gemini` |
| GitHub Copilot | `node …/keel.js install --providers=copilot` |
| OpenCode | `node …/keel.js install --providers=opencode` |
| Windsurf | `node …/keel.js install --providers=windsurf` |
| Continue | `node …/keel.js install --providers=continue` |
| Cline | `node …/keel.js install --providers=cline` |
| Grok Build | `node …/keel.js install --providers=grok` |
| Kiro | `node …/keel.js install --providers=kiro` |
| Pi | `node …/keel.js install --providers=pi` |
| Trae / Trae CN | `node …/keel.js install --providers=trae` ou `trae-cn` |
| Hermes | `node …/keel.js install --providers=hermes` |
| DeepSeek Harness | `node …/keel.js install --providers=dsh` |
| Qoder | `node …/keel.js install --providers=qoder` |
| Rovo Dev | `node …/keel.js install --providers=rovo-dev` |
| Mistral Vibe | `node …/keel.js install --providers=vibe` |
| Veto | `node …/keel.js install --providers=veto` |
| Antigravity | `node …/keel.js install --providers=antigravity` |
| Aider (path manual) | `node …/keel.js install --providers=aider` |

## Vários de uma vez

```bash
# Principais
node /tmp/keel-skill/cli/bin/keel.js install --providers=cursor,claude,codex,gemini,copilot

# Todos os paths conhecidos
node /tmp/keel-skill/cli/bin/keel.js install --providers=all

# Listar ids
node /tmp/keel-skill/cli/bin/keel.js install --list-providers

# Sem hooks do detector
node /tmp/keel-skill/cli/bin/keel.js install --providers=cursor --no-hooks
```

## Onde a skill é copiada

| Provider | Pasta no projeto | Como invocar |
|----------|------------------|--------------|
| `cursor` | `.cursor/skills/keel` | `/keel` |
| `claude` | `.claude/skills/keel` | `/keel` |
| `agents` / `codex` | `.agents/skills/keel` (+ `.codex/skills/keel`) | `/keel` |
| `gemini` | `.gemini/skills/keel` | `/keel` |
| `copilot` | `.github/skills/keel` | `/keel` |
| `opencode` | `.opencode/skills/keel` | `/keel` |
| `grok` | `.grok/skills/keel` | `/keel` |
| … | ver `--list-providers` | `/keel` |

Hooks do detector (edit + stop) são ligados automaticamente em **Cursor**, **Claude Code**, **Copilot**, **Codex** e **Grok** (use `--no-hooks` para pular).

## Depois de instalar

1. Recarregue o harness / abra de novo o Agent chat.  
2. Rode `/keel init` no projeto.  
3. Opcional: `node …/keel.js detect --json src/`

## Atualizar

```bash
git -C /tmp/keel-skill pull
cd /caminho/do/seu/projeto
node /tmp/keel-skill/cli/bin/keel.js update --providers=cursor,claude
```

`update` é alias de `install` (sobrescreve a cópia da skill).
