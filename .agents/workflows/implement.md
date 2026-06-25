# Implement Workflow

Implement performs script-first, contract-first changes after specification,
planning and task ownership are ready.

Implementation cannot start before `.agents/workflows/specify.md`,
`.agents/workflows/plan.md` and `.agents/workflows/tasks.md` have produced
sufficient contracts, ownership and state.

## Required steps

1. Apply the pre-read hook.
2. Run:

```bash
node scripts/factory-check.mjs
node scripts/task-ready-check.mjs
node scripts/check-contract-artifacts.mjs
node scripts/check-dto.mjs
node scripts/check-dependencies.mjs
node scripts/check-template-cache.mjs
node scripts/check-quality-gates.mjs
node scripts/check-spec-kit-contracts.mjs
node scripts/security-scanner.mjs
```

3. Confirm the current role owns the task and paths are allowed.
4. Apply the pre-write hook before any file change.
5. Implement only the smallest scope allowed by contracts and role boundaries.
6. Update affected artifacts: contracts, `test-matrix.md`, module handoff and
   work-order payloads.
7. Run targeted package checks for changed backend/frontend areas.
8. Apply the pre-handoff hook and route to `.agents/workflows/validate.md`.

## Output

- Implementation changes in allowed paths.
- Updated artifacts and evidence.
- State Transition DTO returning to validation.
