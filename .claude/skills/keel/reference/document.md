# document

Generate `ARCHITECTURE.md` from **existing code and configs**. Tokens/structure are normative; prose explains why.

Does not rewrite PRODUCT.md. Does not invent product SLOs.

## Flow

1. Require or offer `init` if PRODUCT.md is missing — you may still document architecture from code, but flag missing product constraints.
2. Inventory: entrypoints, packages/modules, data stores, message buses, external clients, auth mechanisms, migration tools, deploy manifests.
3. Map **boundaries** as they are (not as a dream diagram). Name ownership: who writes which data.
4. Extract conventions already present: error shape, logging fields, auth middleware, pagination style, retry libraries.
5. Write `ARCHITECTURE.md` from [../assets/templates/ARCHITECTURE.md](../assets/templates/ARCHITECTURE.md). Mark inferred vs confirmed.
6. Ask the user to confirm descriptive language for consistency model, failure domains, and any “sacred” invariants.
7. Refuse silent overwrite of a rich existing ARCHITECTURE.md — propose a merge plan.

## Anti-patterns

- Drawing target architecture as if it were current.
- Copying blog-standard layers the repo does not use.
- Filling cost/SLO sections with made-up numbers (point to PRODUCT.md or `Unknown`).
