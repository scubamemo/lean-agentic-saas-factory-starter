# Active Work Order

## ID

WO-0001

## Task type

planned

Allowed values: docs-only, contract-only, backend-only, frontend-only, data-model, frontend-only, full-stack, bugfix, refactor, review, release

## Status

planned

Allowed values: PLANNED, READY, CONTRACT_IN_PROGRESS, CONTRACT_READY, BACKEND_IN_PROGRESS, BACKEND_IMPLEMENTED, FRONTEND_IN_PROGRESS, FRONTEND_IMPLEMENTED, QA_IN_PROGRESS, REVIEW_IN_PROGRESS, REVISION_IN_PROGRESS, PASSED, DONE, BLOCKED

## Context mode

small

Allowed values: small, medium, large

- small: one module, up to 8 files read, implementation allowed.
- medium: one or two modules, up to 20 files read, plan before code.
- large: no direct implementation; split into smaller work orders.

## Owner

pm

## Target module

TBD

## Goal

TBD

## Acceptance criteria

- TBD

## Security / tenancy trigger

Does this task touch auth/session/permission/tenant_id/superAdmin/impersonation/data isolation?

No

If yes, read the relevant parts of `docs/SECURITY.md`, `docs/TENANCY.md`, `docs/RBAC.md`, and route schema/data isolation work to Data Engineer.

## Must read

- START-HERE.md
- AGENTS.md
- .agents/rules/guardrails.md
- .agents/rules/mcp-communication.md
- project/CONTEXT.md
- project/work-orders/active-work-order.md
- project/modules/<module>/context.md
- project/modules/<module>/MODULE.md

## Read by role

Backend:

- project/modules/<module>/api.contract.md
- project/modules/<module>/dto.md
- project/modules/<module>/data-model.md
- project/modules/<module>/permissions.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md

Frontend:

- project/modules/<module>/ui.contract.md
- project/modules/<module>/api.contract.md
- project/modules/<module>/dto.md
- project/modules/<module>/permissions.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md

Data Engineer:

- project/modules/<module>/data-model.md
- project/modules/<module>/dto.md
- project/modules/<module>/permissions.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md
- backend/prisma/schema.prisma

QA/reviewer:

- project/modules/<module>/api.contract.md
- project/modules/<module>/ui.contract.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md
- changed files listed in handoff DTO

## Optional read

- project/PROJECT.md only if product context is missing from `project/CONTEXT.md`.
- project/UI.md only if UI context is missing from `project/CONTEXT.md` or `ui.contract.md`.
- project/MODULES.md only if module ownership is unclear.
- docs/standards/** only if the task touches that specific standard.

## Allowed write paths

- project/modules/<module>/**
- backend/src/modules/<module>/** for backend work
- backend/test/** for backend tests
- backend/prisma/schema.prisma only for Data Engineer work
- backend/prisma/migrations/** only for Data Engineer work
- frontend/src/app/** for frontend routes/pages
- frontend/src/components/** for frontend components
- frontend/src/lib/** for frontend shared UI/client work
- frontend/test/** for frontend tests

## Forbidden paths by default

- unrelated modules
- frontend implementation for backend-only work
- backend implementation for frontend-only work
- backend/prisma/** for Frontend Dev and Backend Dev unless Data Engineer explicitly owns the task
- packages/contracts/** for Frontend Dev
- factory standards unless this is a factory-maintenance work order
- broad docs/ or project/ rewrites unless this is a docs/refactor work order

## Required output

- Summary
- Files read
- Files changed
- Contracts updated
- Tests/checks run
- Context updated: yes/no/not needed
- Pre-write check: passed/failed/not applicable
- Handoff updated
- Next owner
- State Transition DTO

## State Transition DTO

```json
{
  "schema": "agentic.factory.StateTransition.v1",
  "source_agent": "pm",
  "target_agent": "pm",
  "work_order_id": "WO-0001",
  "contract_version": "0.1.0",
  "module": "TBD",
  "current_state": "PLANNED",
  "next_state": "READY",
  "payload": {
    "summary": "TBD",
    "changed_files": [],
    "contracts_updated": [],
    "diff_refs": [],
    "checks_run": [],
    "blockers": [],
    "feedback": [],
    "next_actions": []
  },
  "context_budget": {
    "mode": "small",
    "files_read_count": 0,
    "history_pruned": true,
    "full_repo_scan": false
  }
}
```
