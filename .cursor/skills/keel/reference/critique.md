# critique

Scored engineering critique of one target (path/service/module). Chat report primary; also `.keel/critique/<ts>__<slug>.md` when possible.

**Does:** score /32, personas, backlog, trend. **Does not:** edit app code unless asked.

Scope: app targets only ([analysis-scope.md](analysis-scope.md)). Prose in **user’s language**.

## Load (token discipline)

| Depth | Load |
|-------|------|
| **Default** | This file + [baselines.md](baselines.md) + detector |
| **Full** (default for `/keel critique`) | + [personas.md](personas.md) + [critique-scoring.md](critique-scoring.md) |
| **Deep mode** (Serve/Process/Store and user wants depth) | + matching `mode-*.md` |
| **Ops blurb** | [ops-surfaces.md](ops-surfaces.md) only if Make/Docker/migrations exist |
| **Stack** | [stack-rubrics.md](stack-rubrics.md) only when language is clear |

Do **not** load eng-floor (read-only command). Do not load ship/harden playbooks.

`--quick`: table + ≤3 Priority Issues + detector summary; skip persona subsections and long impression. Still 8-row table.

## Invariants

- Assessment **A** (judgment) + **B** (detector/evidence) both required.
- Prefer isolated sub-agents for A∥B; else first line: `⚠️ DEGRADED: single-context (<reason>)`.
- Invent no SLOs/QPS/bills.
- Questions last (when ≥3 Priority Issues).

## Focus

`--only security,cost` (or spoken): full table; non-focus = `depth: skim`; header `Focus: …`.

## A — Judgment

1. Infer mode (Serve/Process/Store/Integrate/Control).
2. Pick 2–3 personas ([personas.md](personas.md)); +1 PRODUCT-specific if Users/Operating Context real.
3. Score 8 categories 0–4 via [critique-scoring.md](critique-scoring.md); `n/a` only if inapplicable.
4. Return: mode, personas, scores + one-line key issue, 2–3 strengths, 3–5 Priority Issues, persona red flags, questions.

## B — Evidence

1. `node <skill>/scripts/detect.js --json [--stack=<lang>] <app-target>`
2. Optional stack-rubrics / ops one-liner.
3. ≥2 of: authz tests, import direction, pool/timeouts, migration safety, one request/job path.
4. Evidence map: each Priority Issue → `ruleId` | `path:line` | `judgment-only`.

## Report (chat)

1. Provenance (`Method: dual-agent` or DEGRADED) · target · mode · personas · band · focus  
2. Score table (8 + total/32) · Trend (last 5 snapshots) or “First run”  
3. Impression (2–4 sentences)  
4. What’s working (2–3)  
5. Priority Issues (What / Why / Fix / Suggested command)  
6. Persona red flags (specific only)  
7. Evidence notes + evidence map  
8. Ask user (if ≥3 issues) — priority / scope / constraints  
9. Next commands — only after answers/skip; [next-commands.md](next-commands.md)

## Persist

```yaml
---
target: …
slug: …
total_score: 22
max_score: 32
p0_count: 1
p1_count: 3
personas: [Mira, Kai]
mode: Serve
focus: []
---
```

Plus table + Priority Issues (no Ask block).
