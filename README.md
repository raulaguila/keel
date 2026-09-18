# Keel

Skill de craft de backend para agentes — critique pontuado, detector, hooks, doctor, live API.

## Início rápido

No diretório do **seu** projeto (sem clonar):

```bash
curl -fsSL https://raw.githubusercontent.com/raulaguila/keel/master/install.sh | bash -s -- --providers=cursor
# ou: npx --yes github:raulaguila/keel install --providers=cursor
# vários: --providers=cursor,claude,cline
# todos:  --providers=all
```

Guia completo por modelo/agente: **[INSTALL.md](INSTALL.md)**.

`/keel init` → `/keel critique`. Contratos **Does / Does not** no SKILL. Load discipline: só o playbook do comando + eng-floor se for editar.

```bash
node skill/scripts/detect.js --json --stack=node src/
node cli/bin/keel.js doctor --json
node cli/bin/keel.js live --base=http://127.0.0.1:3000 --path=/health
```

## Comandos do agente (`/keel …`)

Argumentos entre `[]` são opcionais. Flags de playbook são texto falado ou sufixos que o agente interpreta (não há binário por comando, exceto onde indicado na CLI).

| Comando | Args / flags | Descrição |
|---------|--------------|-----------|
| `init` | — | Captura verdade de produto em `PRODUCT.md` |
| `document` | — | Gera/atualiza `ARCHITECTURE.md` a partir do código |
| `shape` | `[feature]` | Planeja APIs/dados/limites (ADR + surface) antes do código |
| `extract` | `[target]` | Promove padrões duplicados (≥2 call sites) a libs compartilhadas |
| `onboard` | `[target]` | Ativação: primeiro tenant, keys, webhooks, empty states |
| `adapt` | `[target]` | Multi-env / região / tenant / consumidor alternativo |
| `critique` | `[target]` · `--only <cats>` · `--quick` | Score /32, personas, backlog, tendência; `--quick` = tabela + ≤3 issues |
| `audit` | `[target]` | Checklist amplo: correção, segurança, reliability, observabilidade |
| `cost` | `[target]` | Rankeia drivers de custo (sem inventar bills) |
| `secure` | `[target]` | Threat sketch + matriz de authz |
| `observe` | `[target]` | Lacunas de telemetria (logs/metrics/traces/cardinalidade) |
| `doctor` | `--json` · `--fix` | Drift de artefatos Keel vs repo (via CLI `keel doctor`) |
| `status` | `[target]` · `--json` · `--detect` · `--slug=name` | Pulso de score/P0 a partir de snapshots |
| `ship` | `[target]` | Fecha backlog do critique; gate de release (`closed_by: ship`) |
| `organize` | `[target]` | Limites de pacote e direção de dependências |
| `distill` | `[target]` | Remove complexidade acidental |
| `harden` | `[target]` | Timeouts, retries, idempotência, arestas de authz |
| `migrate` | `[target]` | Evolução segura de schema/API (expand/contract) |
| `optimize` | `[target]` | Hot path, N+1, contenção |
| `clarify` | `[target]` | Nomes, contratos, erros, docs |
| `load` | `[target]` | Capacidade, modelo de carga, backpressure |
| `live` | `--base=URL` · `--path=` · `--method=` · `--expect=` · `--timeout=` · `--json` | Sonda HTTP de serviço em execução (não browser) |
| `hooks` | `on` \| `off` \| `status` \| `ignore-rule` \| `ignore-file` \| `reset` | Admin do detector hook (edit + stop) |
| `pin` | `add` \| `remove` \| `list` `[command]` | Shim `/audit` → `/keel audit` |

**Alias:** `polish` → `ship`.  
**Bare** `/keel` (sem args): só recomenda 2–3 comandos — não executa.

### Categorias de critique (`--only`)

`boundaries` · `contracts` · `reliability` · `data` · `security` · `cost`/`performance` · `operability`/`observe` · `organization`/`complexity`

## CLI (`keel` / `node cli/bin/keel.js`)

| Comando | Flags | Descrição |
|---------|-------|-----------|
| `install` / `update` | `--providers=cursor,claude,…\|all` · `--list-providers` · `--no-hooks` | Instala skill nos harnesses; hooks em cursor/claude/copilot/codex/grok |
| `detect` | `--json` · `--hook` · `--explain` · `--stack=node\|python\|go\|ops` · `--min-severity=p0..p3` · `--list-rules` · `[path…]` | Scan determinístico de anti-patterns |
| `status` | `--json` · `--detect` · `--slug=name` · `[path]` | Pulso critique/ship (+ detector opcional) |
| `doctor` | `--json` · `--fix` | Drift de artefatos; `--fix` só stamps/config auto |
| `live` | `--base=URL` · `--path=/health` · `--method=GET` · `--expect=200` · `--timeout=5000` · `--json` | Probe HTTP |
| `pin` | `add` \| `remove` \| `list` `[command]` | Cria/remove shims de comando |
| `help` | — | Uso da CLI |

Scripts equivalentes sob `skill/scripts/` (`detect.js`, `doctor.js`, `status.js`, `live-api.js`, `pin.js`, `hook.js`).

### Exit codes (detect / status / doctor / live)

| Code | Significado |
|------|-------------|
| `0` | Limpo / ok |
| `2` | Findings / issues abertos / mismatch HTTP |
| `1` | Erro (path, parse, conexão recusada, etc.) |

Close-out do agente: issues pendentes → next-commands; senão, nada.

## Testes

```bash
npm test && npm run sync
```

## License

Apache-2.0
