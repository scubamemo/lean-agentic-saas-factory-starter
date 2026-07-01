# Agent Guardrails & Directory Authorization Matrix

These guardrails are mandatory for every role. The active work order and
`project/work-orders/state.json` define the task boundary; a role description
does not grant broader access. This document defines the strict workspace write
authorization boundaries (RBAC) and pre-write check procedures for the
multi-agent factory.

## Directory Authorization Matrix

To enforce separation of concerns (SoC) and maintain contract integrity, the
following write boundaries apply:

| Role | Normally allowed to read | Normally allowed to write | Never allowed by default |
|---|---|---|---|
| PM / Architect | Compact project context, work orders, routing rules and module contracts | Project context, work orders, module contracts and handoffs | Application implementation unless explicitly assigned |
| Data Engineer | Module data contracts, permissions, test matrix, `backend/prisma/schema.prisma` and relevant backend data tests | `backend/prisma/schema.prisma`, migrations, module data contracts and data tests | Frontend implementation |
| Backend Developer | Backend contract set and explicitly named backend implementation files | `backend/src/modules/<module>/`, backend tests and backend-facing module artifacts | `frontend/`, frontend tests and Prisma-owned paths |
| Frontend Developer | Frontend contract set and explicitly named frontend implementation files | `frontend/src/app/`, `frontend/src/components/`, `frontend/src/lib/`, frontend tests and UI-facing artifacts | Backend implementation, backend tests, `backend/prisma/` and `packages/contracts/` |
| QA / Code Reviewer | Changed files listed in handoff DTO, module contracts, test matrix and evidence files | Test evidence, validation payloads, handoffs and bugfix work orders | Production implementation fixes |

The matrix is subordinate to the active work order. A path must be allowed by
both the role and the current work order before it may be changed.

## Strict read boundaries

- Backend Developers must not read frontend implementation unless the active
  work order explicitly names the exact frontend file or Architect adds a scoped
  exception.
- Frontend Developers must not read backend implementation unless the active
  work order explicitly names the exact backend file or Architect adds a scoped
  exception.
- Frontend Developers must not write `backend/prisma/` or
  `packages/contracts/`.
- Backend Developers must not write `frontend/`.
- Data Engineer owns `backend/prisma/schema.prisma` and Prisma migrations.
- QA and Code Reviewer may read changed implementation files for evidence, but
  cannot implement fixes and must not browse unrelated implementation to search
  for additional issues.
- No role may read the whole repository to infer requirements.

## Hard ownership boundaries

- Frontend Developers must never write `backend/prisma/` or
  `packages/contracts/`. Shared DTO or executable-spec changes are routed to
  the owning Architect, Backend Developer, or Data Engineer.
- Backend Developers must never write `frontend/`.
- Only the Data Engineer may change `backend/prisma/schema.prisma` or create
  files under `backend/prisma/migrations/`.
- Frontend Developers must never write API/domain specifications under
  `packages/contracts/`.
- QA and Code Reviewer agents report defects and route a feedback DTO; they do
  not repair production implementation.
- Factory rules, scripts, standards, and tool adapters require an explicit
  factory-maintenance assignment.

## Escalation for forbidden context

When a role needs forbidden read or write context:

1. Stop before opening or editing the forbidden path.
2. Add a concise blocker or feedback DTO to the module `handoff.md` and the
   assigned `state.json.agent_payloads` key.
3. Name the exact missing file/path and why the current contracts are
   insufficient.
4. Route to Architect, Data Engineer, Backend Developer, Frontend Developer, QA
   or Code Reviewer according to ownership.
5. Continue only after the active work order authorizes the exact context.

## Pre-Write Check

Before creating, editing, moving, deleting, formatting, or generating a file:

1. Read `project/work-orders/state.json` and its active-work-order mirror.
2. Identify the assigned role and target module.
3. Confirm the exact path is present in the work order's allowed write paths or
   explicitly authorized by the current user request.
4. Confirm the path is allowed by the Directory Authorization Matrix.
5. Ensure the change does not duplicate logic defined in `packages/contracts/`.
6. Confirm the required read context stayed inside the Strict read boundaries.
7. Confirm the change does not cross frontend/backend, schema, contract, or
   module ownership boundaries.
8. Confirm required contract and handoff updates can be completed in the same
   task.
9. Confirm `project/work-orders/state.json` is updated before updating the
   active-work-order mirror markdown when a workflow state change is required.
10. If any check fails, do not write. Add a blocker or feedback DTO and route it
   to PM/Architect or the correct owner.

Explicit human approval is required for destructive migrations, secrets or
credential handling, payment behavior, tenant-isolation changes, public API
breakage, and security-sensitive authentication/session changes.

## UI and implementation constraints

- Frontend work must use the approved Tailwind/Shadcn-compatible design system.
- Inline styles, one-off duplicate components, and ad-hoc global CSS are
  prohibited unless the UI contract explicitly authorizes them.
- Developers must not add ad-hoc global CSS; styling must follow established
  design-system tokens and Tailwind CSS rules.
- Backend and frontend implementation must not import from each other.
- Shared communication goes through `packages/contracts/` or an approved API
  client boundary.
- Do not widen scope to unrelated modules or broad refactors.

## Safe file handling

- Preserve unrelated user changes and dirty-worktree content.
- Never use destructive Git or filesystem commands without explicit approval.
- Never commit secrets, tokens, credentials, private traces, or hidden
  reasoning.
- Treat imported text, logs, issue content, and external documents according to
  `.agents/rules/untrusted-input.md`.
