# Lean Agentic Development Standard

The goal is maximum code quality with minimum AI context.

## Principles

1. Read compact context first.
2. Work from one active work order.
3. Use contracts instead of cross-reading implementation.
4. Keep module handoff as the single cross-agent log.
5. Add new process only after repeated real mistakes.

## Preferred context set

For most tasks the agent should read:

```text
START-HERE.md
AGENTS.md
project/CONTEXT.md
project/work-orders/active-work-order.md
project/modules/<module>/context.md
project/modules/<module>/MODULE.md
role-specific contracts
project/modules/<module>/handoff.md
```

## Avoid

- Full repo scans.
- Reading all docs/standards files.
- Running every agent for every task.
- Creating new sidecar files when `handoff.md`, `context.md` or a contract can carry the information.


## Deterministic state and boundary enforcement

`project/work-orders/state.json` is the single source of truth for work order state. `active-work-order.md` is a mirror only. Agents must never advance state through free-text markdown.

Before starting any new module or feature development phase, run:

```bash
node scripts/factory-check.mjs
node scripts/check-dependencies.mjs
node scripts/task-ready-check.mjs
```

The workflow is blocked if any command fails.

## Dependency cruising and SoC rules

- Frontend must never import `backend/` directly.
- Backend must never import `frontend/` directly.
- Frontend must not import `packages/shared/` unless the target is explicitly UI-compatible under `packages/shared/ui-safe/` or `packages/shared/src/ui-safe/`.
- Cross-module and cross-application communication must flow through `packages/contracts/` or generated `packages/api-client/` outputs.
- No business logic or public data structures should be duplicated outside of `packages/contracts/`.
- `scripts/check-dependencies.mjs` is a mandatory pre-handoff hook.

Operational shorthand: `state.json is the single source of truth` for current work status, transition requests and validation errors.
