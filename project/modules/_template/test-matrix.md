# Test Matrix

No feature is complete until QA verifies this matrix.

| Requirement ID | Acceptance criteria | Test type | Evidence/status |
|---|---|---|---|
| REQ-001 | TBD | unit/api/ui/e2e/security/integration | planned |

## Minimum checks

- API behavior matches `api.contract.md`.
- API schemas are OpenAPI/JSON Schema compatible.
- DTOs match `dto.md`.
- Permissions match `permissions.md`.
- UI states match `ui.contract.md`.
- Reusable components follow `docs/standards/frontend-standards.md`.
- Tenant isolation is tested for tenant-owned data.
- QA failure creates/updates `project/work-orders/bugfix.md`.

## Pass signal

QA may mark this module as passed only when:

```text
all required rows have evidence/status = pass
or deferred rows have PM-approved reason
handoff.md current status is PASSED or DONE
active work order is updated
```
