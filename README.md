# Agentic SaaS Factory Starter

Clean, reusable SaaS starter optimized for Google Antigravity / multi-agent AI code generation.

This template is intentionally lean: it keeps the controls that reduce AI token usage and improve code quality, but avoids excessive registries, sidecars and micro-gates.

## Operating model

- One compact project context: `project/CONTEXT.md`
- One product brief: `project/PROJECT.md`
- One UI brief: `project/UI.md`
- One module map: `project/MODULES.md`
- One active work order: `project/work-orders/active-work-order.md`
- One compact module context: `project/modules/<module>/context.md`
- One consolidated handoff log per module: `project/modules/<module>/handoff.md`

## Start here

1. Read `START-HERE.md`.
2. Fill `project/PROJECT.md`, `project/UI.md` and `project/MODULES.md`.
3. Summarize them into `project/CONTEXT.md` so agents can start from compact context.
4. Copy `project/modules/_template` for the first module.
5. Fill `project/work-orders/active-work-order.md`.
6. Run `pnpm check`.
7. Generate code only inside the work order's allowed write paths.

## Main folders

```text
.agents/       Agent skills, rules and workflows
project/       Project-specific product, UI, module and work-order docs
docs/          Reusable engineering standards
factory/       Simple profiles, quality gates and project instantiation guide
backend/       Domain-neutral backend skeleton
frontend/      Domain-neutral frontend skeleton
packages/      Optional shared package placeholders
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

Every handoff must update the active work order, module `handoff.md`, State Transition DTO, and the relevant `api.contract.md` or `ui.contract.md` artifact. QA failures create `project/work-orders/bugfix.md` and route the task back to the original developer as `REVISION_IN_PROGRESS`.
