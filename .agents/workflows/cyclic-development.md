# Cyclic Development Workflow

This is the canonical autonomous multi-agent development loop. It replaces
one-way waterfall execution with a state-machine feedback cycle driven by
`project/work-orders/state.json`.

Do not infer state from markdown prose. `active-work-order.md` is a mirror
only. Do not scan the full repo.

All phases apply `.agents/rules/hook-policy.md`:

- pre-read before expanding context;
- pre-write before modifying artifacts or implementation;
- pre-handoff before routing to another role;
- pre-completion before `COMPLETED`.

## Canonical states

```text
PLANNED
IN_PROGRESS
VALIDATION_REQUIRED
QA_PENDING
FAILED
REVISION_IN_PROGRESS
APPROVED
COMPLETED
```

## State flow

```text
PLANNED
  -> IN_PROGRESS
  -> VALIDATION_REQUIRED
  -> QA_PENDING
  -> APPROVED
  -> COMPLETED
```

Failure and revision paths:

```text
VALIDATION_REQUIRED -> FAILED -> REVISION_IN_PROGRESS -> VALIDATION_REQUIRED
QA_PENDING -> FAILED -> REVISION_IN_PROGRESS -> VALIDATION_REQUIRED
QA_PENDING -> REVISION_IN_PROGRESS -> VALIDATION_REQUIRED
APPROVED -> REVISION_IN_PROGRESS -> VALIDATION_REQUIRED
```

`FAILED` means a validation, QA, review, contract, dependency, security, build,
lint or test gate has produced actionable evidence. `REVISION_IN_PROGRESS`
means the original owner is applying the scoped fix from the feedback payload.

## Main loop

1. Plan
   - PM/Architect defines scope, acceptance criteria, module boundaries,
     required contracts and owner routing.
   - Output state: `PLANNED` or `IN_PROGRESS`.
2. Backend
   - Backend Developer implements only backend-owned paths from contracts.
   - Data Engineer owns Prisma/schema/migration/index changes.
   - Backend does not read or write frontend implementation.
3. Frontend
   - Frontend Developer implements only frontend-owned paths from
     `ui.contract.md`, `api.contract.md`, `dto.md` and `permissions.md`.
   - Frontend does not read or write backend implementation, `backend/prisma/`
     or `packages/contracts/`.
4. QA
   - QA validates scripts, tests, contracts, security, dependency boundaries,
     and `test-matrix.md` evidence.
   - QA cannot fix implementation code.
5. Review
   - Code Reviewer validates quality, boundaries, contracts, security,
     regression risk and handoff evidence.
   - Reviewer cannot implement fixes.
6. Bugfix loop if failed
   - Failed tests/lint/contract/security/dependency checks generate a
     structured feedback payload.
   - The work order returns to the original owner through
     `project/work-orders/bugfix.md`.
   - The owner fixes the smallest allowed scope and returns to
     `VALIDATION_REQUIRED`.
   - QA reruns the exact failing command first, then the remaining gates.

## Failure payload requirements

QA or Reviewer must create a structured feedback payload when a gate fails.
Free-text-only failure reports are not valid. The payload must include:

- command run;
- stdout/stderr excerpt;
- failing test suite/name;
- failing file and line when available;
- failing validation rule or contract check;
- suspected original owner;
- relevant contract section or `test-matrix.md` row;
- expected result;
- actual result;
- smallest reproduction scope;
- next requested state, normally `FAILED` or `REVISION_IN_PROGRESS`.

The feedback payload is written to `project/work-orders/bugfix.md`, mirrored in
the module handoff when module behavior is affected, and referenced by the
State Transition DTO.

## Ownership boundaries

- QA cannot fix implementation.
- Code Reviewer cannot fix implementation.
- Backend Developer cannot write `frontend/`.
- Frontend Developer cannot write `backend/`, `backend/prisma/` or
  `packages/contracts/`.
- Data Engineer owns `backend/prisma/schema.prisma` and migrations.
- Cross-role or forbidden context requires escalation through handoff and
  `state.json.agent_payloads.<role>`.

## Completion gate

`COMPLETED` is allowed only after all of these are true:

```text
node scripts/factory-check.mjs
node scripts/task-ready-check.mjs
node scripts/check-contract-artifacts.mjs
node scripts/check-dto.mjs
node scripts/check-dependencies.mjs
node scripts/security-scanner.mjs
node scripts/check-quality-gates.mjs
node scripts/check-agent-handoff.mjs
```

The pre-completion hook is mandatory and blocks completion on any failed gate.

Additional required completion evidence:

- contract checks pass;
- dependency checks pass;
- security scanner passes;
- QA validates the relevant `test-matrix.md` rows;
- reviewer accepts the implementation and handoff evidence;
- `quality_gates.qa_passed` is true;
- `quality_gates.review_passed` is true;
- required decision trace is logged when completion requires it;
- human approval gate is cleared if `approval_required=true`.

No feature is `COMPLETED` while blockers, validation errors, unresolved
feedback, failed checks or missing approval remain.
