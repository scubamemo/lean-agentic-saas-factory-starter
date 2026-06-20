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
