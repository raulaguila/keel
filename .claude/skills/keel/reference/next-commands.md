# Next commands (required close-out)

Every Keel command ends with **suggested next commands**. Never finish with only a report or a diff and silence. Mirror Impeccable: the user always sees a clear path forward.

## Hard rules

1. After the main deliverable, emit a **Next commands** section (exact heading).
2. List **2–3** items, priority order. Each line:
   ```
   1. `/keel <command> [scope]` — why (one specific sentence tied to what just happened)
   ```
3. Only recommend commands from the SKILL.md Commands table (plus `hooks` / `doctor`).
4. **Never auto-run** them unless the user explicitly asks to continue / run all / run #1.
5. End with one short line:
   > You can ask me to run these one at a time, all at once, or in another order.
6. If nothing useful remains (rare), still suggest `/keel critique <target>` or `/keel doctor` with a reason — do not omit the section.

## Critique-specific flow

For `/keel critique` only:

1. Deliver the full scored report first.
2. **Ask the user** 2–4 targeted questions **last in the same message** (priority area, scope, constraints). Offer concrete options tied to findings. If fewer than 3 Priority Issues: `Questions skipped: <n> priority issues`.
3. **After the user answers**, emit **Next commands** / Action Summary mapped to their choices. Prefer ending the chain with `/keel ship` when any fix commands were recommended, then re-`critique` for trend.

## Default maps (adapt to evidence)

| After you just ran… | Typical next commands |
|---------------------|------------------------|
| `init` | `document` (if code exists) · `shape` (greenfield) · `critique` |
| `document` | `critique` · `doctor` · `organize` (if boundaries vague) |
| `shape` | implement per plan · `harden` on new edges · `critique` when built |
| `critique` | (after answers) commands matching P0/P1 · always consider `ship` last · re-`critique` |
| `audit` | `secure` / `harden` / `observe` by weakest dimension · `ship` |
| `cost` | `optimize` · `observe` · `ship` |
| `secure` | `harden` · `audit` · `ship` |
| `observe` | `harden` · `critique` · `ship` |
| `doctor` | `init` / `document` / `hooks on` as named · `critique` |
| `ship` | `critique` (refresh score) · `detect` via scripts · `doctor` |
| `organize` / `distill` / `extract` | `critique` · `ship` · `document` (update ARCHITECTURE) |
| `harden` | `observe` · `secure` · `ship` |
| `migrate` | `ship` · `load` (if risky online) · `critique` |
| `optimize` | `cost` · `load` · `ship` |
| `clarify` | `document` · `critique` · `ship` |
| `load` | `optimize` · `harden` · `ship` |
| `hooks` | `doctor` · `critique` · run `detect.js` on dirty files |

## Detector signal

If `detect.js` reported primary findings this turn, at least one Next command should address them (`harden`, `secure`, `optimize`, or `ship`).

## Tone

Backend voice: *ship*, *release gate*, *on-call*, *blast radius* — not *polish* / *pixel*.
