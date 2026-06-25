# Module Handoff

Use this file for structured module handoffs. Human-readable notes are allowed,
but every execution handoff must include exactly one current valid State
Transition DTO.

## Current status

PLANNED

Allowed values: PLANNED, READY, CONTRACT_IN_PROGRESS, CONTRACT_READY, BACKEND_IN_PROGRESS, BACKEND_IMPLEMENTED, FRONTEND_IN_PROGRESS, FRONTEND_IMPLEMENTED, QA_IN_PROGRESS, REVIEW_IN_PROGRESS, FAILED, PASSED, DONE, BLOCKED

## Source agent

pm

Allowed values: pm, architect, designer, data-engineer, backend-developer, frontend-developer, qa, code-reviewer

## Target agent

pm

Allowed values: pm, architect, designer, data-engineer, backend-developer, frontend-developer, qa, code-reviewer

## Next agent

pm

Allowed values: pm, architect, designer, data-engineer, backend-developer, frontend-developer, qa, code-reviewer

## Current dependencies

| Dependency | Type | Status | Notes |
|---|---|---|---|
| TBD | module/api/data/ui/external | planned | TBD |

## Artifact sync

| Artifact | Status | Notes |
|---|---|---|
| `MODULE.md` | draft | Defines scope, ownership, dependencies and risks |
| `context.md` | draft | Compact context capsule for agents |
| `api.contract.md` | draft | Update/re-validate before backend handoff |
| `ui.contract.md` | draft | Update/re-validate before frontend handoff |
| `dto.md` | draft | Keep aligned with API/UI contracts |
| `data-model.md` | draft | Data Engineer owns Prisma-impacting changes |
| `permissions.md` | draft | Keep aligned with RBAC checks |
| `test-matrix.md` | planned | QA verifies before done |

## Changed artifacts

| Artifact | Change summary | Owner |
|---|---|---|
| TBD | TBD | TBD |

## Changed implementation files

| File | Change summary | Owner |
|---|---|---|
| TBD | TBD | TBD |

## Checks run

| Command | Result | Notes |
|---|---|---|
| TBD | planned | TBD |

## Blockers

- None

## Next action

TBD

## Human summary

TBD

## State Transition DTO

```json
{
  "schema": "agentic.factory.StateTransition.v1",
  "source_agent": "pm",
  "target_agent": "pm",
  "work_order_id": "WO-0001",
  "contract_version": "0.1.0",
  "module": "<module-name>",
  "current_state": "PLANNED",
  "next_state": "IN_PROGRESS",
  "payload": {
    "summary": "Initial module handoff template. Replace with a concise execution summary when a real work order updates this module.",
    "changed_files": [],
    "contracts_updated": [
      "api.contract.md",
      "ui.contract.md",
      "dto.md",
      "data-model.md",
      "permissions.md",
      "test-matrix.md"
    ],
    "diff_refs": [],
    "checks_run": [],
    "blockers": [],
    "feedback": [],
    "next_actions": [
      "Fill module scope and contracts before implementation."
    ]
  },
  "context_budget": {
    "mode": "small",
    "files_read_count": 0,
    "history_pruned": true,
    "full_repo_scan": false
  }
}
```

## QA / review notes

- No feature may be marked DONE until QA verifies against `test-matrix.md`.
- QA and Code Reviewer must not fix implementation directly.
- Failures must be routed through `project/work-orders/bugfix.md` and a State Transition DTO.

## Notes

- Keep this file compact.
- Do not paste full logs.
- Use DTO feedback payloads for QA/review failures.
