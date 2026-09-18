# Keel

Skill de craft de backend para agentes — critique pontuado, detector, hooks, doctor, live API.

## Início rápido

```bash
node cli/bin/keel.js install --providers=cursor
```

`/keel init` → `/keel critique`. Comandos têm contratos **Does / Does not** no SKILL (anti-ambiguidade). Load discipline: só o playbook do comando + eng-floor se for editar.

```bash
node skill/scripts/detect.js --json --stack=node src/
node cli/bin/keel.js doctor --json
node cli/bin/keel.js live --base=http://127.0.0.1:3000 --path=/health
```

## Comandos

Build: `init` `document` `shape` `extract` `onboard` `adapt`  
Evaluate: `critique` `audit` `cost` `secure` `observe` `doctor` `status`  
Refine: `ship` `organize` `distill` `harden` `migrate`  
Fix: `optimize` `clarify` `load` · Iterate: `live` · System: `hooks` `pin`

Close-out único: issues pendentes → next-commands; senão, nada.

## Testes

```bash
npm test && npm run sync
```

## License

Apache-2.0
