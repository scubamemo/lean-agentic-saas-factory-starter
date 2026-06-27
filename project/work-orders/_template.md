# Active Work Order

## State source of truth

**DEPRECATED AS PRIMARY STATE:** this file is a human-readable mirror only. `project/work-orders/state.json` is the single source of truth. Do not manually advance workflow state by editing this file.

## Lazy context and rolling history

Read prior-step context only from `project/work-orders/history-summary.json`.
Do not load completed work-order prose or historical handoff logs.

## Delta-only writing

Update only the current role's assigned payload in
`project/work-orders/state.json`, then synchronize this compact mirror.
Agents must not regenerate the full `state.json` for a role delta.

```text
pm -> agent_payloads.pm
architect -> agent_payloads.architect
designer -> agent_payloads.designer
data-engineer -> agent_payloads.data_engineer
backend-developer -> agent_payloads.backend
frontend-developer -> agent_payloads.frontend
qa -> agent_payloads.qa
code-reviewer -> agent_payloads.code_reviewer
```

## Pre-development validation

```bash
node scripts/factory-check.mjs
node scripts/check-contract-artifacts.mjs
node scripts/check-dependencies.mjs
node scripts/check-template-cache.mjs
node scripts/task-ready-check.mjs
```

Any failed command blocks implementation and handoff.


## ID

WO-XXXX

## Task type

docs-only

Allowed values: docs-only, contract-only, backend-only, frontend-only, data-model, full-stack, bugfix, refactor, review, release

## Status

PLANNED

Allowed values from `state.json`: PLANNED, IN_PROGRESS, VALIDATION_REQUIRED, QA_PENDING, APPROVED, COMPLETED, FAILED, REVISION_IN_PROGRESS

## Development chain

Plan -> Backend -> Frontend -> QA -> Code Reviewer

QA approval is mandatory before merge or release.

## Context mode

small

Allowed values: small, medium, large

- small: one module, up to 8 files read, implementation allowed.
- medium: one or two modules, up to 20 files read, plan before code.
- large: no direct implementation; split into smaller work orders.

## Model routing

Source: `.agents/model-routing.json`

Default tier: Tier 2

Escalate to Tier 1 only when the work touches schema/migration impact,
tenant isolation, auth/session/permission changes, cross-module business rules,
critical performance risk, repeated QA failure, high-risk refactor,
security-sensitive behavior, contradictory contracts or unclear ownership.

Role alone does not force an expensive model. Architect and Data Engineer may
use Tier 2 for bounded mechanical work; PM, Designer, Backend, Frontend or QA
must escalate when risk triggers are present.

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

## Artifact protocol

Every handoff must update or explicitly re-validate the relevant artifact:

- API/backend changes: `project/modules/<module>/api.contract.md`
- UI/frontend changes: `project/modules/<module>/ui.contract.md`
- DTO/data changes: `project/modules/<module>/dto.md` and `project/modules/<module>/data-model.md`
- QA changes: `project/modules/<module>/test-matrix.md`
- Every transition: `project/modules/<module>/handoff.md`, `project/work-orders/state.json`, and this mirror file

## Must read

- START-HERE.md
- AGENTS.md
- .agents/rules/guardrails.md
- .agents/rules/mcp-communication.md
- project/CONTEXT.md
- project/work-orders/state.json
- project/work-orders/active-work-order.md mirror
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

- docs/standards/frontend-standards.md
- project/modules/<module>/ui.contract.md
- project/modules/<module>/api.contract.md
- project/modules/<module>/dto.md
- project/modules/<module>/permissions.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md

Data Engineer:

- project/modules/<module>/data-model.md
- project/modules/<module>/dto.md
- project/modules/<module>/api.contract.md
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

- project/PROJECT.md only if application context is missing from `project/CONTEXT.md`.
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
- frontend/src/components/** for reusable frontend components and documentation
- frontend/src/lib/** for frontend shared UI/client work
- frontend/test/** for frontend tests
- project/work-orders/bugfix.md for QA/review failure routing

## Forbidden paths by default

- unrelated modules
- frontend implementation for backend-only work
- backend implementation for frontend-only work
- backend/prisma/** for Frontend Dev and Backend Dev unless Data Engineer explicitly owns the task
- packages/contracts/** for Frontend Dev
- factory standards unless this is a factory-maintenance work order
- broad docs/ or project/ rewrites unless this is a docs/refactor work order
- ad-hoc CSS or unapproved UI styling

## Required output

- Summary
- Files read
- Files changed
- Contracts updated
- Tests/checks run
- Context updated: yes/no/not needed
- Pre-write check: passed/failed/not applicable
- Handoff updated
- state.json updated
- Active work order mirror updated
- Next owner
- State Transition DTO

## State Transition DTO

```json
{
  "schema": "agentic.factory.StateTransition.v1",
  "source_agent": "pm",
  "target_agent": "pm",
  "work_order_id": "WO-XXXX",
  "contract_version": "0.1.0",
  "module": "TBD",
  "current_state": "PLANNED",
  "next_state": "IN_PROGRESS",
  "payload": {
    "summary": "TBD",
    "changed_files": [],
    "contracts_updated": [
      "api.contract.md",
      "ui.contract.md"
    ],
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
