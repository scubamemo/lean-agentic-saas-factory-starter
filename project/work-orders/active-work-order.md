# Active Work Order

## State source of truth

**DEPRECATED AS PRIMARY STATE:** `project/work-orders/active-work-order.md` is a human-readable mirror only. `project/work-orders/state.json` is the single source of truth for all agents, validators, status transitions, ownership and validation errors. Do not manually advance workflow state by editing this file. Update `state.json` first, then mirror the relevant summary here.


## Lazy context and rolling history

Historical context must not be loaded from completed work-order markdown or old handoff logs. If an agent needs previous-step context, it must read only:

```text
project/work-orders/history-summary.json
```

This file contains compact structural deltas only. Agents must not paste raw logs or long prose into it.

## Delta-only writing

Agents must not rewrite whole project markdown files to report state changes. Update only `project/work-orders/state.json` and only the payload key assigned to the current skill boundary:

```text
pm -> agent_payloads.pm_status
architect -> agent_payloads.architect_status
designer -> agent_payloads.ui_status
data-engineer -> agent_payloads.data_status
backend-developer -> agent_payloads.backend_status
frontend-developer -> agent_payloads.ui_status
qa -> agent_payloads.qa_status
code-reviewer -> agent_payloads.review_status
```

Mirror markdown may be updated only after `state.json` is updated.


## ID

WO-0001

## Task type

docs-only

Allowed values: docs-only, contract-only, backend-only, frontend-only, data-model, full-stack, bugfix, refactor, review, release

## Status

PLANNED

Allowed values from `state.json`: PLANNED, IN_PROGRESS, VALIDATION_REQUIRED, QA_PENDING, COMPLETED, FAILED


## Pre-development validation

Before any `New Module` or `Feature Development` phase starts, the responsible agent must run the factory consistency checks from the repository root:

```bash
node scripts/factory-check.mjs
node scripts/check-contract-artifacts.mjs
node scripts/check-dependencies.mjs
node scripts/check-template-cache.mjs
node scripts/task-ready-check.mjs
```

Template initialization may use `node scripts/task-ready-check.mjs --allow-tbd`; real project work must not use `--allow-tbd`.

Do not start implementation if these checks fail. Fix the work order, module template, or contract artifact state first.

## Handoff gate

No agent may hand off work to the next agent until this active work order is updated with:

```text
current Status
Owner / Next owner
Contracts updated or explicitly re-validated
Tests/checks run
State Transition DTO
```

`project/work-orders/state.json` is the source of truth for the next transition. This file must be updated only as a mirror after `state.json` changes. Agents must never use this markdown file as the primary state store.

## Development chain

Plan -> Backend -> Frontend -> QA -> Code Reviewer

QA approval is mandatory before merge or release.

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

## Artifact protocol

Every handoff must update or explicitly re-validate the relevant artifact and must write the transition status to `project/work-orders/state.json`:

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

- Pre-development checks run
- Summary
- Files read
- Files changed
- Contracts updated
- Tests/checks run
- Context updated: yes/no/not needed
- Pre-write check: passed/failed/not applicable
- Handoff updated
- Active work order updated
- Next owner
- State Transition DTO

## State Transition DTO

The DTO below is a mirror of the current transition. The state machine record in `project/work-orders/state.json` is authoritative.

```json
{
  "schema": "agentic.factory.StateTransition.v1",
  "source_agent": "pm",
  "target_agent": "pm",
  "work_order_id": "WO-0001",
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


## HITL / Trace mirror

- Primary HITL flag: `project/work-orders/state.json.approval_required`.
- If approval is required, only a human may set `state.json.status` to `APPROVED` or clear the gate.
- Decision traces are written with `scripts/trace-logger.mjs` under `project/work-orders/traces/`.
