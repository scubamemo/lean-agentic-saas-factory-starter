# Workflow - Feature Development
# Feature Development Workflow

Feature work follows `.agents/workflows/cyclic-development.md` and orchestrates
the spec-first phase workflows:

```text
.agents/workflows/specify.md
.agents/workflows/plan.md
.agents/workflows/tasks.md
.agents/workflows/implement.md
.agents/workflows/validate.md
```

This file is a role-level execution checklist, not a replacement for the cyclic
state machine.

Start from `AGENTS.md`, `.agents/rules/global.md`,
`.agents/rules/context-budget.md` and authoritative
`project/work-orders/state.json`. Use `active-work-order.md` as a mirror only.
Do not scan the full repo.

Apply `.agents/rules/hook-policy.md`:

- pre-read before opening module artifacts or implementation files;
- pre-write before changing contracts, tests or implementation;
- pre-handoff before returning to `VALIDATION_REQUIRED`;
- pre-completion only after QA/review gates.

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
1. Read `.agents/workflows/cyclic-development.md`.
2. Run `.agents/workflows/specify.md` to capture business intent and update
   project/module contracts without implementation.
3. Run `.agents/workflows/plan.md` to identify modules, contracts,
   dependencies, risks and required agents.
4. Run `.agents/workflows/tasks.md` to convert the plan into work orders,
   owners and state transitions.
5. Implementation is blocked until specification, plan and task ownership are
   ready in canonical artifacts and `state.json`.
6. Run `node scripts/factory-check.mjs`.
7. Run `node scripts/task-ready-check.mjs`.
8. Run `node scripts/check-contract-artifacts.mjs`.
9. Run `node scripts/check-dependencies.mjs`.
10. Run `node scripts/check-template-cache.mjs`.
11. Apply the pre-read hook and confirm authoritative
   `project/work-orders/state.json` is `IN_PROGRESS`, the
   current role owns the task, and all paths are authorized.
12. Read only the target module context and role-specific contracts.
13. Follow `.agents/workflows/implement.md` for script-first implementation.
14. Apply the pre-write hook, then update contracts before or with implementation.
15. Implement only in allowed paths and update test evidence.
16. Apply the pre-handoff hook: update module `handoff.md`, state payload,
    trace record and active-work-order mirror.
17. Follow `.agents/workflows/validate.md` for QA/reviewer gates and bugfix loop.
18. Return to `VALIDATION_REQUIRED` with a State Transition DTO.

Any failed gate blocks implementation or handoff and enters the cyclic failure
path. QA or Reviewer records the feedback payload in
`project/work-orders/bugfix.md`; the work order returns to the original owner as
`FAILED` or `REVISION_IN_PROGRESS`. QA and Reviewer cannot fix implementation.
