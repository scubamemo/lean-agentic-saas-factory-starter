# Agentic SaaS Factory Starter

A generic, reusable SaaS factory starter optimized for Google Antigravity-style
agents and other multi-agent coding tools.

This repository is the factory, not a finished business application. It is
intentionally domain-neutral. Example domains only, such as inventory,
accounting, RFID, retail, CRM, ERP or any other B2B SaaS domain, can be supplied
later as project input, but the starter itself must not encode those
assumptions.

The factory is intentionally lean: it keeps the controls that reduce AI token
usage and improve code quality, while avoiding excessive registries, sidecars
and micro-gates.

## Operating model

- One compact project context: `project/CONTEXT.md`
- One project brief: `project/PROJECT.md`
- One UI brief: `project/UI.md`
- One module map: `project/MODULES.md`
- One authoritative work-order state: `project/work-orders/state.json`
- One human-readable mirror: `project/work-orders/active-work-order.md`
- One compact module context: `project/modules/<module>/context.md`
- One consolidated handoff log per module: `project/modules/<module>/handoff.md`

## How this factory works

Agents start at `AGENTS.md`, then load compact context and contracts before
reading implementation. The goal is to keep every task module-scoped,
contract-first and script-validated:

1. Project inputs are summarized into `project/CONTEXT.md`.
2. Work is represented in `project/work-orders/state.json`; this is the source
   of truth for owner, status, allowed paths and quality gates.
3. `project/work-orders/active-work-order.md` mirrors the state for humans but
   does not replace `state.json`.
4. Each module carries its own `context.md`, contracts, DTOs, data model,
   permissions, test matrix and structured `handoff.md`.
5. Backend and frontend agents collaborate through contracts and
   `packages/contracts`, not by reading or editing each other's implementation.
6. Validators in `scripts/` provide deterministic gates before handoff or
   release.

Core principles:

- Contract-first development: update or validate contracts before integration
  work.
- Script-first validation: prefer deterministic checks over broad manual
  inspection.
- `state.json` as source of truth: workflow state is not inferred from prose.
- No full-repo scan by default: agents read only the compact context, active
  work order and relevant module artifacts.
- Module-scoped context: each module owns a compact context and contract set.
- Backend/frontend implementation isolation: each side stays in its authorized
  paths.
- `packages/contracts` is the shared communication layer for executable shared
  shapes and schemas.
- QA does not directly fix implementation code; QA reports evidence and routes
  failures.
- Code reviewers do not implement fixes; reviewers report findings and route
  them to the owner.

## Start here

1. Use Node.js 22 and enable the pinned package manager with `corepack enable`.
2. Run `pnpm install --frozen-lockfile`.
3. Read `START-HERE.md`.
4. Fill `project/PROJECT.md`, `project/UI.md` and `project/MODULES.md`.
5. Summarize them into `project/CONTEXT.md` so agents can start from compact context.
6. Copy `project/modules/_template` for the first module.
7. Create/update `project/work-orders/state.json`, then synchronize its
   `active-work-order.md` mirror.
8. Run `pnpm check:project`.
9. Generate code only inside the work order's allowed write paths.

The committed `pnpm-lock.yaml` is mandatory. CI and local validation must use
`pnpm install --frozen-lockfile`; validators never download tools implicitly.

## Main folders

```text
.agents/       Agent skills, rules and workflows
project/       Project-specific application, UI, module and work-order docs
docs/          Reusable engineering standards
factory/       Simple profiles, quality gates and project instantiation guide
backend/       Domain-neutral backend skeleton
frontend/      Domain-neutral frontend skeleton
packages/      Shared contract and support packages
scripts/       Minimal validation/export helpers
```

## Non-goals

- No domain-specific sample app.
- No large registry system.
- No mandatory JSON sidecars for every log.
- No full repo scan by default.
- No frontend/backend implementation cross-reading by default.


## Lean artifact-driven cyclic workflow

This starter keeps a lean workflow and adds structured MCP-compatible DTO handoffs, directory RBAC guardrails, a Data Engineer role for Prisma/schema ownership, task readiness checks, module/work-order generators and cyclic QA/review feedback.


## Artifact-driven loop

The default development chain is:

```text
Plan -> Backend -> Frontend -> QA -> Code Reviewer
```

Every handoff must update authoritative `state.json`, its active-work-order
mirror, module `handoff.md`, State Transition DTO, and the relevant contract.
QA failures use the supported `FAILED -> IN_PROGRESS` loop through
`project/work-orders/bugfix.md` and route back to the original owner.
