# Test Matrix

No feature is complete until QA verifies this matrix. Keep evidence compact and
link to command output or changed files instead of pasting long logs.

## Requirement coverage

| requirement id | acceptance criteria | test type | expected test file | status | owner |
|---|---|---|---|---|---|
| REQ-001 | User-fillable project requirement | unit/api/ui/e2e/security/integration | backend/test/<module-name>.spec.ts or frontend/test/<module-name>.test.tsx | planned | pm/backend-developer/frontend-developer/data-engineer/qa |

## Contract checks

| Artifact | Check | Evidence/status |
|---|---|---|
| `api.contract.md` | API behavior and schemas match implementation | planned |
| `ui.contract.md` | UI routes, actions and states are covered | planned |
| `dto.md` | DTOs match API/UI usage | planned |
| `data-model.md` | Persistence and tenant rules are verified | planned |
| `permissions.md` | Allowed/forbidden cases are covered | planned |

## Minimum checks

- API behavior matches `api.contract.md`.
- API schemas are OpenAPI/JSON Schema compatible.
- DTOs match `dto.md`.
- Permissions match `permissions.md`.
- UI states match `ui.contract.md`.
- Reusable components follow `docs/standards/frontend-standards.md`.
- Every acceptance criteria maps to at least one test row.
- Every test row names the expected test file.
- Tenant isolation is tested for tenant-owned data.
- QA failure creates/updates `project/work-orders/bugfix.md`.

## Backend scenario checklist

| Scenario | Required when | Expected test file | Evidence/status |
|---|---|---|---|
| Happy path | Backend behavior exists | backend/test/<module-name>.spec.ts | planned |
| Validation error | Endpoint accepts input | backend/test/<module-name>.spec.ts | planned |
| Permission error | Protected action exists | backend/test/<module-name>.spec.ts | planned |
| Tenant isolation | Tenant-owned data exists | backend/test/<module-name>.spec.ts or backend/test/templates/tenant-isolation.spec.template.ts | planned |
| Not found | Detail/update/delete behavior exists | backend/test/<module-name>.spec.ts | planned |
| Conflict | Unique or state conflict can occur | backend/test/<module-name>.spec.ts | planned |
| Pagination/filter behavior | List endpoint exists | backend/test/<module-name>.spec.ts | planned |

## Frontend scenario checklist

| Scenario | Required when | Expected test file | Evidence/status |
|---|---|---|---|
| Loading | Page/query state exists | frontend/test/<module-name>.test.tsx | planned |
| Empty | List/detail empty state exists | frontend/test/<module-name>.test.tsx | planned |
| Error | API/UI can fail | frontend/test/<module-name>.test.tsx | planned |
| Forbidden | Permission-gated UI exists | frontend/test/<module-name>.test.tsx | planned |
| Success | Primary UI path exists | frontend/test/<module-name>.test.tsx | planned |
| Form validation | Form exists | frontend/test/<module-name>.test.tsx | planned |
| Destructive action confirmation | Destructive action exists | frontend/test/<module-name>.test.tsx | planned |

## Scenario checklist

| Scenario | Required when | Evidence/status |
|---|---|---|
| Happy path | Always | planned |
| Validation error | Inputs or forms exist | planned |
| Permission denied | Protected action exists | planned |
| Tenant isolation | Tenant-owned data exists | planned |
| Empty state | List/detail UI exists | planned |
| Error state | API/UI can fail | planned |
| Forbidden state | Permission-gated UI exists | planned |
| Regression check | Bugfix or refactor | planned |

## Pass signal

QA may mark this module as passed only when:

```text
each acceptance criteria maps to at least one test row
all required rows have status = pass
or deferred rows have PM-approved reason
or not-applicable rows include a reason
handoff.md current status is PASSED or DONE
active work order is updated
```

## Failure routing

- Record exact failing requirement.
- Update `project/work-orders/bugfix.md`.
- Add feedback to `handoff.md` State Transition DTO.
- Route to the original owner. QA does not fix implementation.
