# Workflow - Feature Development

Start from `START-HERE.md`, `AGENTS.md` and `project/work-orders/active-work-order.md`. Do not scan the full repo.

## Feature development

1. Confirm active work order status is `ready` or `in_progress`.
2. Read only allowed paths.
3. Update contracts before or with implementation.
4. Implement in allowed code paths.
5. Update tests/check evidence.
6. Update module `handoff.md` with summary, blockers and next owner.

## Mandatory Pre-Development Validation

Before proceeding with feature implementation, you must run the following validation scripts:
- Run `node scripts/factory-check.mjs`
- Run `node scripts/check-dependencies.mjs`
- Run `node scripts/check-template-cache.mjs`
- Ensure that `project/work-orders/state.json` is set to `IN_PROGRESS` or the appropriate transition state.
