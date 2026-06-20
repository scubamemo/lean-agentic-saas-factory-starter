# Module Handoff

Use this file for structured module handoffs. Human-readable notes are allowed, but every execution handoff must include a valid State Transition DTO.

## Current status

PLANNED

Allowed values: PLANNED, READY, CONTRACT_IN_PROGRESS, CONTRACT_READY, BACKEND_IN_PROGRESS, BACKEND_IMPLEMENTED, FRONTEND_IN_PROGRESS, FRONTEND_IMPLEMENTED, QA_IN_PROGRESS, REVIEW_IN_PROGRESS, FAILED, PASSED, DONE, BLOCKED

## Current dependencies

| Dependency | Type | Status | Notes |
|---|---|---|---|
| TBD | module/api/data/ui/external | TBD | TBD |

## Next agent

pm

Allowed values: pm, architect, designer, data-engineer, backend-developer, frontend-developer, qa, code-reviewer

## Artifact sync

| Artifact | Status | Notes |
|---|---|---|
| api.contract.md | draft | Update/re-validate before backend handoff |
| ui.contract.md | draft | Update/re-validate before frontend handoff |
| dto.md | draft | Keep aligned with API/UI contracts |
| data-model.md | draft | Data Engineer owns Prisma-impacting changes |
| permissions.md | draft | Keep aligned with RBAC checks |
| test-matrix.md | planned | QA verifies before done |

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
    "summary": "TBD",
    "changed_files": [],
    "contracts_updated": [
      "api.contract.md",
      "ui.contract.md"
    ],
    "diff_refs": [],
    "checks_run": [],
    "blockers": [],
    "feedback": [],
    "next_actions": []
  },
  "context_budget": {
    "mode": "small",
    "files_read_count": 0,
    "history_pruned": true,
    "full_repo_scan": false
  }
}
```

## Blockers

- None

## QA / review notes

- No feature may be marked DONE until QA verifies against `test-matrix.md`.
- QA and Code Reviewer must not fix implementation directly.
- Failures must be routed through `project/work-orders/bugfix.md` and a State Transition DTO.

## Notes

- Keep this file compact.
- Do not paste full logs.
- Use DTO feedback payloads for QA/review failures.
