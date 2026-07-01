# Module: <module-name>

Use this file as the canonical module brief. Keep it concise enough for agents
to understand scope without reading the full repository.

## Module purpose

Describe the user-visible outcome this module provides.

Fill before implementation:

- Purpose: TBD
- Primary actors: TBD
- Business value: TBD

## Scope

| ID | In scope behavior | Acceptance criteria |
|---|---|---|
| REQ-001 | TBD | TBD |

## Out of scope

- TBD

## Owned backend paths

List only paths this module owns or may create when the work order allows them.

```text
backend/src/modules/<module-name>/**
backend/test/**
```

## Owned frontend paths

List only paths this module owns or may create when the work order allows them.

```text
frontend/src/app/**
frontend/src/components/**
frontend/src/lib/**
frontend/test/**
```

## Contracts

| Artifact | Purpose | Required before |
|---|---|---|
| `api.contract.md` | Backend/API behavior and OpenAPI/JSON Schema mirror | Backend implementation |
| `ui.contract.md` | Routes, UX states, component intent and visual QA | Frontend implementation |
| `dto.md` | Shared request/response/event shapes | Backend/frontend integration |
| `data-model.md` | Persistence ownership, indexes, tenant isolation and migrations | Data work |
| `permissions.md` | Role/permission mapping | Backend/frontend authorization |
| `test-matrix.md` | QA evidence plan and pass criteria | QA handoff |
| `handoff.md` | Structured State Transition DTO and current module status | Every handoff |

## Dependencies

| Dependency | Type | Required by | Status | Notes |
|---|---|---|---|---|
| TBD | module/api/data/ui/external | TBD | planned | TBD |

## Technical design

- Backend responsibility: TBD
- Frontend responsibility: TBD
- Data ownership: tenant-owned / platform-owned / mixed / none
- Integration points: TBD
- Background jobs/events: TBD
- Observability/audit needs: TBD

## UI design

- Pages/routes: TBD
- Main actions: TBD
- Required states: loading, empty, error, forbidden, success
- Accessibility notes: TBD

## Risks

| Risk | Impact | Owner | Mitigation |
|---|---|---|---|
| TBD | TBD | TBD | TBD |

## Open questions

- TBD

## Agent boundaries

- Backend agents must use contracts and must not read frontend implementation.
- Frontend agents must use contracts and must not read backend implementation.
- Data Engineer owns Prisma schema changes.
- QA and Code Reviewer report findings; they do not fix implementation.
