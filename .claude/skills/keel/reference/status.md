# status

Read-only **backlog pulse** for a target: latest critique score, open P0/P1, ship closure, detector primary count. Does not edit application code.

## Flow

1. Resolve target slug (argument, path basename, or ask once).
2. Respect [analysis-scope.md](analysis-scope.md) — do not smell-score Keel-owned trees.
3. Gather (filesystem only; invent nothing):
   - Latest `.keel/critique/*__<slug>.md` (and up to 4 prior for trend)
   - Whether that snapshot (or any for slug) has `closed_by: ship` / `status: closed` in frontmatter
   - Open Priority Issues still listed without `closed: true`
   - Optional: run detector `--json` on the **app** target path
4. Print a short pulse in the **user’s language**.

## Report shape

```markdown
## Keel status — <slug>

Score: 22/32 (band: …) · Trend: 18 → 22
Open: 1 P0 · 2 P1 · 1 P2
Ship: open | closed <date> | no snapshot
Detector: N primary (p0+p1) on <path>
Surfaces: .keel/surfaces/<slug>.md present|missing

### Open issues
- [P0] …
- [P1] …
```

If no critique snapshot: say so and suggest `/keel critique <target>` only as the way to **create** the missing score — that is a concrete gap, not filler.

## Rules

- Read-only. No eng-floor edits.
- Do not re-score categories here — point to `critique` for a full refresh.
- Language: user’s language for prose; keep command names English.

---

## Close

If open P0/P1 (or detector primaries) remain → **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If clean / closed with nothing pending: `No pending issues — no next commands.`
