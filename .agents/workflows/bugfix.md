# Bugfix Feedback Loop Workflow

This workflow is cyclic: QA isolates a failure, routes it to the original
owning developer role, the owner fixes within its allowed paths, and QA repeats
validation until the failing gate passes.

Start from `AGENTS.md`, `.agents/rules/global.md`,
`.agents/rules/context-budget.md`, `project/work-orders/state.json`,
`project/work-orders/history-summary.json`, and the target module artifacts.
Do not scan the full repo.

Apply `.agents/rules/hook-policy.md`: QA uses pre-read before examining
evidence, owners use pre-write before fixes, and every bugfix cycle uses
pre-handoff before routing back to QA.

## QA failure isolation

When a test, build, validation script, security scan or acceptance check fails,
QA must not fix code. QA creates or updates `project/work-orders/bugfix.md`
with structured evidence:

1. command run;
2. stdout/stderr excerpt;
3. failing test suite/name;
4. failing file and line when available;
5. suspected owner;
6. relevant contract, permission, DTO, data-model, UI contract or
   `test-matrix.md` row;
7. expected result;
8. actual result;
9. smallest reproduction scope.

QA updates only `agent_payloads.qa`, focused `validation_errors`,
`project/work-orders/bugfix.md`, QA-owned evidence and handoff artifacts. QA
sets or requests `FAILED` or `REVISION_IN_PROGRESS` using the state machine in
`project/work-orders/state.json`.

## Owner routing

Route the bugfix to the original developer agent whenever possible:

| Failure area | Target owner |
|---|---|
| Backend route, service, API, DTO mapping | `backend-developer` |
| Frontend page, component, client, UI state | `frontend-developer` |
| Prisma schema, migration, index, tenant-owned persistence | `data-engineer` |
| Contract ambiguity, module boundary, dependency boundary | `architect` |
| UI contract, flow, design-system interpretation | `designer` |

The target owner reads `project/work-orders/bugfix.md`, the active state, the
target module context, and only the role-specific contracts/files named in the
bugfix payload. The owner fixes the smallest allowed implementation set and
updates the relevant contract/test evidence if behavior changes.

## Cyclic validation loop

1. QA runs required deterministic scripts and targeted tests.
2. On failure, QA records the isolated bugfix payload and routes to owner.
3. Owner fixes within role boundaries and returns to `VALIDATION_REQUIRED`.
4. QA reruns the exact failing command first.
5. If fixed, QA continues remaining gates.
6. If still failing, QA appends new evidence and routes another
   `REVISION_IN_PROGRESS` cycle.
7. QA passes only after the targeted failure and required gates pass.

No bugfix cycle may rely on free-text-only communication. Every cycle must
include a valid State Transition DTO.
