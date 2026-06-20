# Module Handoff

Use this file for structured module handoffs. Human-readable notes are allowed, but every execution handoff must include a valid State Transition DTO.

## Current status

PLANNED

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
  "module": "sample-resource",
  "current_state": "PLANNED",
  "next_state": "IN_PROGRESS",
  "payload": {
    "summary": "TBD",
    "changed_files": [],
    "contracts_updated": [],
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

## Notes

- Keep this file compact.
- Do not paste full logs.
- Use DTO feedback payloads for QA/review failures.
