# baselines.md

Honest calibration for `/keel critique` totals (8 categories × 0–4 = **/32** unless `n/a`).

| Band | % | Typical meaning |
|------|---|-----------------|
| Excellent | ≥90% (≥29/32) | Release-ready craft; only nits left |
| Good | ≥70% (≥23/32) | Solid; fix weak categories before scale events |
| Acceptable | ≥50% (≥16/32) | Runs; will hurt on-call/cost/security under stress |
| Poor | ≥30% (≥10/32) | Major gaps; do not expand surface area yet |
| Critical | <30% | Redesign/harden before new features |

## Mode-aware expectations

| Mode | Soft floor (Good) | Block-merge if… |
|------|-------------------|-----------------|
| Serve | Reliability ≥2, Security ≥2, Contracts ≥2 | Security 0–1 on sensitive data |
| Process | Reliability ≥3, Organization ≥2 | Reliability ≤1 (poison/timeouts missing) |
| Store | Data ≥3, Cost ≥2 | Data ≤1 (unsafe migrations / no tenancy) |
| Integrate | Contracts ≥3, Security ≥2 | Contracts ≤1 |
| Control | Security ≥3, Operability ≥2 | Security ≤1 |

State the baseline used in the critique header (“Serve soft-floor applied”).
