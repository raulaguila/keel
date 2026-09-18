# Keel

Skill de craft de backend para agentes de IA — no formato Impeccable: critique pontuado, personas, detector, hooks e loop de ship.

## Início rápido

```bash
cd /caminho/para/keel
node cli/bin/keel.js install --providers=cursor
# ou: npm link   depois: keel install
```

Recarregue o Cursor → Agent → `/keel` → `/keel init` → `/keel critique`.

```bash
node skill/scripts/detect.js --json --explain --stack=node src/
node cli/bin/keel.js status --detect .
node cli/bin/keel.js detect --json .
```

## Comandos

Build: `init` `document` `shape` `extract`  
Evaluate: `critique` `audit` `cost` `secure` `observe` `doctor` `status`  
Refine: `ship` `organize` `distill` `harden` `migrate`  
Fix: `optimize` `clarify` `load`  
System: `hooks`

### Critique

8 categorias (geralmente **/32**), 6 personas (+ derivadas do PRODUCT), baselines, modo foco, histórico de tendência em `.keel/critique/`. Assessment B exige evidência (detector + caminhos de arquivo).

### Shape

Antes de código novo: ADR curto + trade-offs + brief em `.keel/surfaces/<slug>.md`.

### Ship

Fecha o backlog do critique e marca o snapshot (`closed_by: ship`). Não é polish visual.

### Status

Pulso somente-leitura: score, tendência, P0/P1 abertos, ship aberto/fechado, opcionalmente detector.

### Detector (~18 regras)

empty-catch, select-star, secrets, findMany sem bound, N+1 await-in-loop, timeouts HTTP (com janela quieta se `AbortSignal`/`timeout` estiver perto), Promise.all em fan-out, concat SQL, TLS verify off, god files, …

Flags: `--explain` · `--stack=node|python|go|ruby|java` · `--min-severity=p1` · `severityOverrides` em `.keel/config.json`.

Exit `0` limpo · `2` findings primários · `1` erro.

Escopo de análise: código da aplicação — não cheirar árvores do próprio Keel ([skill/reference/analysis-scope.md](skill/reference/analysis-scope.md)). `doctor` só verifica **drift** de artefatos.

## Layout

```
skill/           # skill canônica + scripts/detect.js + status.js + hook.js
cli/bin/keel.js  # install | update | detect | status
tests/fixtures/  # smelly-api + clean-api (smoke)
docs/cases/      # narrativas before/after
```

Providers: `cursor`, `claude`, `agents`/`codex` via `keel install --providers=…`.

Next commands só quando a rodada deixou issues pendentes — cada sugestão fecha uma issue nomeada. Se limpo, sem sugestões.

**Doc sync:** mudança estrutural de código → atualizar `ARCHITECTURE.md` / surfaces / Delivery na mesma passagem ([skill/reference/doc-sync.md](skill/reference/doc-sync.md)).

**Ops surfaces:** Makefile, Docker/Compose, migrations e deploy entram no Assessment B e no Delivery ([skill/reference/ops-surfaces.md](skill/reference/ops-surfaces.md)) — evidência, não um motor separado.

Documentação e relatórios no **idioma do usuário**; nomes de comando em inglês (`/keel ship`).

## Testes

```bash
npm run test:detector
npm run test:smoke
```

## License

Apache-2.0
