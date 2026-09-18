# load

Capacity and load-test design: backpressure, shedding, and evidence-based limits — not “add replicas.”

## Flow

1. Read PRODUCT scale assumptions (or mark Unknown).
2. Identify bottleneck candidates: DB, locks, external APIs, CPU, queue consumers.
3. Define a **load model**: actors, RPS/concurrency, data shape, think time, success criteria.
4. Ensure the system has backpressure (queue limits, timeouts, 429/503 policies) before blasting traffic.
5. Propose or implement a minimal load script (k6/vegeta/hey/locust — match repo tooling).
6. After a run (or dry design), list bottlenecks and `/keel optimize` / `cost` / `harden` follow-ups.

## Refuse

- Load testing prod without explicit approval
- Fabricating QPS capacity numbers
- Horizontal scale as first recommendation without a bottleneck
