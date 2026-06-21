# Agentic Factory Adapter

This adapter is intentionally thin. Do not fork the canonical instructions here.

Canonical source of truth:

1. `AGENTS.md`
2. `.agents/rules/global.md`
3. `.agents/rules/context-budget.md`
4. `.agents/rules/guardrails.md`
5. `.agents/rules/mcp-communication.md`
6. `docs/constitution.md`
7. `project/work-orders/state.json`
8. Target module artifacts under `project/modules/<module>/`

Before implementation, run:

```bash
node scripts/factory-check.mjs
node scripts/task-ready-check.mjs --allow-tbd
node scripts/check-dependencies.mjs
```

If any adapter instruction conflicts with canonical files, canonical files win.
