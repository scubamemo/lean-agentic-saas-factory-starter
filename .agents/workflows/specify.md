# Specify Workflow

Specify captures business intent before technical planning or implementation.
It is spec-first and implementation-free.

Start from `AGENTS.md`, `.agents/rules/global.md`,
`.agents/rules/context-budget.md`, `.agents/rules/hook-policy.md`,
`project/work-orders/state.json`, `project/CONTEXT.md` and the relevant module
artifacts. Do not scan the full repo.

## Purpose

Convert approved business intent into canonical project/module artifacts:

- `project/PROJECT.md` for product scope when project-level facts change;
- `project/MODULES.md` for module inventory and boundaries;
- target module `MODULE.md`, `context.md`, `api.contract.md`,
  `ui.contract.md`, `dto.md`, `data-model.md`, `permissions.md` and
  `test-matrix.md` for module behavior.

Do not write backend or frontend implementation. Do not create duplicate source
of truth files.

## Required steps

1. Apply the pre-read hook.
2. Read current `state.json`; confirm the work is `PLANNED` or
   specification is explicitly requested.
3. Capture business intent, actors, user outcomes, constraints, acceptance
   criteria and out-of-scope items.
4. Identify affected modules or the need for a new module.
5. Update only canonical project/module artifacts.
6. Ensure every acceptance criterion can later map to `test-matrix.md`.
7. Apply the pre-handoff hook and route to `.agents/workflows/plan.md`.

## Output

- Updated project/module contracts.
- State Transition DTO targeting Architect/PM for planning.
- No implementation files changed.
