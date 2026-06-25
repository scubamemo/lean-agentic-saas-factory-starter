# Workflow

Start from `START-HERE.md`, `AGENTS.md` and `project/work-orders/active-work-order.md`. Do not scan the full repo.

Apply `.agents/rules/hook-policy.md`: pre-read before module planning,
pre-write before scaffold or artifact edits, and pre-handoff before routing the
new module to implementation or QA.

## New module

1. Run `node scripts/factory-check.mjs`.
2. Run `node scripts/check-dependencies.mjs`.
3. Run `node scripts/check-template-cache.mjs`.
4. Apply pre-write and create the module through `scripts/new-module.mjs`.
5. Update authoritative `project/work-orders/state.json`, then its Markdown mirror.
6. Fill `MODULE.md` and the contracts required by the selected pattern.
7. Update `project/MODULES.md` and validate task readiness.

Any failed gate blocks module creation or handoff.
