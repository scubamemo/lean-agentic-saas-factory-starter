# Cyclic Development Workflow

This document details the iterative cyclic development process of the agentic factory.

## Workflow Loop

The development follows a strict sequence:
```text
Plan -> Backend -> Frontend -> QA -> Code Reviewer
```

If QA or Code Reviewer identifies issues:
```text
REVISION_IN_PROGRESS -> original developer -> QA
```

No feature is `COMPLETED` without review and QA approval.

## Phases

1. **PLANNED**: PM plans requirements, Architect defines module contracts.
2. **IN_PROGRESS**: Implementers write backend and frontend code in isolation.
3. **VALIDATION_REQUIRED**: Checks run synchronously. If errors exist, transition to `FAILED` or stay in `IN_PROGRESS` until passing.
4. **QA_PENDING**: QA verifies against the `test-matrix.md` happy path and permission denied cases.
5. **APPROVED**: Code reviewer performs review and approves release.
6. **COMPLETED**: Task is completed.

## Bugfix Routing

When a defect is identified, a `project/work-orders/bugfix.md` is generated detailing the failing test cases and boundaries. The bugfix follows the same cycle:
```text
Plan -> Backend -> Frontend -> QA
```
