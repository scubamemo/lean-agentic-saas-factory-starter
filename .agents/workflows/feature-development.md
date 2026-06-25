# Feature Development Workflow

Feature work follows `.agents/workflows/cyclic-development.md`. This file is a
role-level execution checklist, not a replacement for the cyclic state machine.

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

1. Read `.agents/workflows/cyclic-development.md`.
2. Run `node scripts/factory-check.mjs`.
3. Run `node scripts/task-ready-check.mjs`.
4. Run `node scripts/check-contract-artifacts.mjs`.
5. Run `node scripts/check-dependencies.mjs`.
6. Run `node scripts/check-template-cache.mjs`.
7. Apply the pre-read hook and confirm authoritative
   `project/work-orders/state.json` is `IN_PROGRESS`, the
   current role owns the task, and all paths are authorized.
8. Read only the target module context and role-specific contracts.
9. Apply the pre-write hook, then update contracts before or with implementation.
10. Implement only in allowed paths and update test evidence.
11. Apply the pre-handoff hook: update module `handoff.md`, state payload,
    trace record and active-work-order mirror.
12. Return to `VALIDATION_REQUIRED` with a State Transition DTO.

Any failed gate blocks implementation or handoff and enters the cyclic failure
path. QA or Reviewer records the feedback payload in
`project/work-orders/bugfix.md`; the work order returns to the original owner as
`FAILED` or `REVISION_IN_PROGRESS`. QA and Reviewer cannot fix implementation.
