# Tasks Workflow

Tasks converts the approved plan into deterministic work orders and state
transitions.

Start from `state.json`, current module artifacts, the plan outputs and
`.agents/routing.md`. Do not scan the full repo.

## Purpose

Break a plan into executable work while preserving role boundaries and the
state machine.

## Required steps

1. Apply the pre-read hook.
2. Verify specification and plan artifacts are ready.
3. Split work by owner: PM, Architect, Designer, Data Engineer,
   Backend Developer, Frontend Developer, QA and Code Reviewer.
4. Use `node scripts/new-work-order.mjs` when a new work order is needed.
5. Define state transitions using `project/work-orders/state.json`; do not
   advance state through markdown prose.
6. Set ownership, next agent, required contracts, validation scripts and
   acceptance criteria mapping.
7. Mark implementation as blocked until required specs, contracts and task
   ownership are ready.
8. Apply the pre-handoff hook and route to `.agents/workflows/implement.md`.

## Output

- Work-order state and mirror updates.
- Owner-scoped task payloads.
- No backend/frontend implementation changes.
