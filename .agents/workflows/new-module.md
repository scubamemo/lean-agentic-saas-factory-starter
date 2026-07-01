# Workflow - New Module Creation

Start from `START-HERE.md`, `AGENTS.md` and `project/work-orders/active-work-order.md`. Do not scan the full repo.

## New module

1. Copy `project/modules/_template` to `project/modules/<module-name>`.
2. Fill `MODULE.md`.
3. Fill contracts required by the selected pattern.
4. Update `project/MODULES.md`.
5. Create/update active work order.

## Mandatory Pre-Development Validation

Before proceeding with module creation, you must run the following validation scripts:
- Run `node scripts/factory-check.mjs`
- Run `node scripts/check-dependencies.mjs`
- Run `node scripts/check-template-cache.mjs`
- Ensure that `project/work-orders/state.json` is set to `IN_PROGRESS` or the appropriate transition state.
