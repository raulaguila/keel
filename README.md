# Keel

Backend craft skill for AI coding agents — Impeccable-shaped: scored critique, personas, detector, hooks, ship loop.

## Quick start

```bash
cd /path/to/keel
node cli/bin/keel.js install --providers=cursor
# or: npm link   then: keel install
```

Reload Cursor → Agent → `/keel` → `/keel init` → `/keel critique`.

```bash
node skill/scripts/detect.js --json src/
node cli/bin/keel.js detect --json .
```

## Commands

Build: `init` `document` `shape` `extract`  
Evaluate: `critique` `audit` `cost` `secure` `observe` `doctor`  
Refine: `ship` `organize` `distill` `harden` `migrate`  
Fix: `optimize` `clarify` `load`  
System: `hooks`

### Critique

8 categories (usually **/32**), 6 personas (+ PRODUCT-derived), baselines, focus mode, trend history in `.keel/critique/`.

### Detector (18 rules)

empty-catch, select-star, secrets, unbounded findMany, N+1 await-in-loop, http timeouts, Promise.all fan-out, SQL concat, TLS verify off, god files, …

Exit `0` clean · `2` primary findings · `1` error.

## Layout

```
skill/           # canonical skill + scripts/detect.js + hook.js
cli/bin/keel.js  # install | update | detect
tests/fixtures/  # smelly-api oracle
docs/cases/      # before/after narrative
```

Providers: `cursor`, `claude`, `agents`/`codex` via `keel install --providers=…`.

## License

Apache-2.0
