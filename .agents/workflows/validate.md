# Validate Workflow

Validate performs QA and review gates after implementation. QA and Reviewer do
not implement fixes.

Start from `state.json`, changed files listed in handoff DTOs, module
contracts, `test-matrix.md`, and script output. Do not scan the full repo.
Apply the pre-read hook before opening changed files or evidence.

## Required gates

Run:

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
node scripts/check-agent-handoff.mjs
```

## QA gate

QA validates:

- acceptance criteria mapped in `test-matrix.md`;
- backend/frontend/data/design scenario coverage;
- contract and DTO alignment;
- tenant/security behavior;
- bugfix evidence when applicable.

If a gate fails, QA updates `project/work-orders/bugfix.md`, appends focused
validation evidence and routes back through `.agents/workflows/bugfix.md`.

## Review gate

Code Reviewer validates:

- architecture and dependency boundaries;
- contract alignment and `packages/contracts` usage;
- tenant isolation and RBAC/permissions;
- tests, SOLID/craftsmanship, performance, design system and accessibility;
- security scanner and untrusted-input checks.

Reviewer outputs `PASS`, `PASS_WITH_WARNINGS` or `FAIL`. Reviewer cannot
implement code.

## Completion

Apply the pre-completion hook before `COMPLETED`. Completion is blocked by any
failed script, unresolved validation error, missing QA/review acceptance,
missing trace or uncleared human approval gate.
