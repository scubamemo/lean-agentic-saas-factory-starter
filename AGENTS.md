# Agent Operating Rules

These rules apply to every agent.

## Token-first read order

1. `START-HERE.md`
2. `project/CONTEXT.md`
3. `project/work-orders/active-work-order.md`
4. Target module `context.md`
5. Target module `MODULE.md` and only the contracts needed by your role
6. Only then read implementation files listed by the work order

Do not read `project/PROJECT.md`, `project/UI.md`, `project/MODULES.md` or broad `docs/**` unless `project/CONTEXT.md` or the active work order is missing the exact information needed.

## Role-specific contract sets

Backend developer normally reads:

```text
MODULE.md
context.md
api.contract.md
dto.md
data-model.md
permissions.md
test-matrix.md
handoff.md
```

Frontend developer normally reads:

```text
MODULE.md
context.md
ui.contract.md
api.contract.md
dto.md
permissions.md
test-matrix.md
handoff.md
```

QA/reviewer normally reads:

```text
MODULE.md
context.md
api.contract.md
ui.contract.md
test-matrix.md
handoff.md
changed files listed in the work order or handoff
```

## Context boundaries

- Do not scan the full repository.
- Backend agents do not read frontend implementation unless the work order explicitly allows it.
- Frontend agents do not read backend implementation unless the work order explicitly allows it.
- Prefer contracts, DTOs, API docs, UI docs, test matrix and handoff logs over implementation cross-reading.
- For medium/large work, create a short implementation plan before code.

## Output format

Every agent run ends with:

```text
Summary
Files read
Files changed
Contracts updated
Tests/checks run
Open blockers
Next suggested owner
```

## Required handoff

If an agent changes behavior, API, data model, permissions, UI behavior or tests, update the module `handoff.md` before ending.
