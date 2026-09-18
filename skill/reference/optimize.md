# optimize

Improve performance of a **measured or clearly evidenced** hot path. No speculative micro-optimizations.

## Flow

1. Identify the path and the symptom (p99 latency, CPU, DB time, queue lag). Cite evidence or mark as hypothesis.
2. Profile or read the code path end-to-end once: handlers → domain → I/O.
3. Fix highest leverage first: N+1, missing filters/indexes, over-fetch, lock scope, unbounded work, unnecessary serialization.
4. Re-check eng-floor (don’t trade correctness for speed).
5. Describe how to verify (benchmark, EXPLAIN, staging replay) — don’t invent % gains.

## Refuse

- Caching as first move without a keying/invalidations story
- Denormalizing everything “for speed”
- Optimizing cold admin paths when Serve-mode APIs are on fire

---

## Close

If this run left **pending issues**, end with **Next commands** mapped to those issues ([next-commands.md](next-commands.md)).
If none remain, do **not** suggest commands (optional: `No pending issues — no next commands.`).
