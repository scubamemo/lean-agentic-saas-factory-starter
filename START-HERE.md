# Start Here

Use this file as the first context file for a new SaaS project.

## Required project inputs

Before code generation, fill these files:

```text
project/PROJECT.md      Product, users, scope, architecture and profile
project/UI.md           UI direction, routes, layout, Design System and component rules
project/MODULES.md      Planned modules and priorities
project/CONTEXT.md      Compact project context used by agents
project/work-orders/active-work-order.md
```

Domain-specific B2B details such as Retail, Accounting or RFID belong in the project documents, not in the factory rules.

## Recommended first prompt to Antigravity

```text
Read START-HERE.md, AGENTS.md, project/CONTEXT.md, project/work-orders/active-work-order.md and the target module context/contracts. Do not scan the full repo. Use MCP-compatible State Transition DTOs for every handoff. If project/CONTEXT.md is incomplete, read only the missing source file among project/PROJECT.md, project/UI.md or project/MODULES.md. Follow the active work order allowed paths and update module handoff before ending.
```

## Minimal development loop

1. Product/PM fills or refines `project/PROJECT.md`.
2. Architect defines module boundaries in `project/MODULES.md`.
3. Architect/Designer prepares `api.contract.md` and `ui.contract.md`.
4. PM/Architect compacts the current project facts into `project/CONTEXT.md`.
5. Backend agent implements only backend paths and updates API/data artifacts.
6. Frontend agent reads contracts/handoff, not backend implementation, and follows the Design System.
7. QA verifies against `test-matrix.md`.
8. Code Reviewer verifies quality and handoff before merge/release.

## Required autonomous loop

```text
Plan -> Backend -> Frontend -> QA -> Code Reviewer
```

If QA or Code Reviewer fails the work:

```text
REVISION_IN_PROGRESS -> original developer -> QA
```

QA and Code Reviewer do not fix production implementation. They create feedback payloads and bugfix work orders.

## When to stop and ask instead of coding

Open a blocker in the target module's `handoff.md` if the task affects:

- tenant isolation,
- permissions,
- destructive migration,
- public API behavior,
- payment/billing,
- security-sensitive authentication/session behavior,
- unclear product behavior.

## Fast start helpers

```bash
pnpm new:module <module-name>
pnpm new:work-order WO-0001 <module-name> backend-only
pnpm check:task
pnpm check:project
```

Use `.agents/workflows/cyclic-development.md` for implementation work.
