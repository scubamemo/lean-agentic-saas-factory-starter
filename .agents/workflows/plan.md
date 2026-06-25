# Plan Workflow

Plan converts approved specifications into a technical execution plan without
implementing code.

Start from `state.json`, `history-summary.json` only if needed, current module
artifacts and `.agents/workflows/specify.md` outputs. Do not scan the full repo.

## Purpose

Create the smallest technical plan that identifies:

- modules affected;
- contracts to create or update;
- backend/frontend/data/design dependencies;
- required agents and ownership boundaries;
- risks, approvals and escalation triggers;
- validation scripts and expected evidence.

## Required steps

1. Apply the pre-read hook.
2. Verify specs/contracts exist and are sufficient for planning.
3. Identify module boundaries and dependency direction.
4. Identify `packages/contracts` or JSON spec updates needed before
   implementation.
5. Identify tenant, auth/session/permission, schema/migration, performance,
   security, design-system and QA risks.
6. Identify required agents: PM, Architect, Designer, Data Engineer, Backend
   Developer, Frontend Developer, QA and/or Code Reviewer.
7. Record the technical plan in existing module artifacts and work-order
   payloads; do not create duplicate planning files.
8. Apply the pre-handoff hook and route to `.agents/workflows/tasks.md`.

## Output

- Updated `MODULE.md`, contracts, `test-matrix.md` planning rows or work-order
  payloads.
- Clear owner list and risk list.
- No implementation files changed.
