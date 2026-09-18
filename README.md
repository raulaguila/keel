# Keel

Skill de craft de backend para agentes de IA — no formato Impeccable: critique pontuado, personas, detector (~50 regras), hooks (edit + stop), doctor, live API, onboard/adapt.

## Início rápido

```bash
cd /caminho/para/keel
node cli/bin/keel.js install --providers=cursor
# npx-style: node cli/bin/keel.js install --providers=cursor,claude,copilot
```

Recarregue o harness → `/keel` → `/keel init` → `/keel critique`.

```bash
node skill/scripts/detect.js --json --explain --stack=node src/
node cli/bin/keel.js doctor --json
node cli/bin/keel.js status --detect .
node cli/bin/keel.js live --base=http://127.0.0.1:3000 --path=/health
node cli/bin/keel.js pin add audit
```

## Comandos

Build: `init` `document` `shape` `extract` `onboard` `adapt`  
Evaluate: `critique` `audit` `cost` `secure` `observe` `doctor` `status`  
Refine: `ship` `organize` `distill` `harden` `migrate`  
Fix: `optimize` `clarify` `load`  
Iterate: `live`  
System: `hooks` `pin`

### Destaques v0.4

- **Stop hook** — deep pass nos arquivos da sessão (dedupe)
- **doctor --json/--fix** — drift de artefatos + stamps
- **pin** — `/audit` → `/keel audit`
- **onboard / adapt / new-work** + profundidade Serve/Process/Store
- **Ops pack** no detector (Dockerfile/Make/compose/SQL DROP)
- **live-api** — sonda HTTP (não browser)
- **Doc sync** + **ops surfaces** como evidência
- Subagents: documenter, finish-reviewer, ops-reader

### Detector

Flags: `--explain` · `--stack=node|python|go|ops` · `--min-severity` · `severityOverrides`  
Config local: `.keel/config.local.json` (gitignored) — quiet/consent/auditLog

Exit `0` limpo · `2` primários · `1` erro.

## Testes

```bash
npm test
npm run sync   # skill/ → .cursor/.claude/.agents
```

## License

Apache-2.0
