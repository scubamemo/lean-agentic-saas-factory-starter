# Module Handoff

Use this sample-only file for structured module handoffs. Human-readable notes
are allowed, but every execution handoff must include a schema-valid Agent
Handoff Payload plus the compatibility State Transition DTO. Free-text alone is
not a handoff.

## Current status

PLANNED

## Human summary

Sample-only module handoff for validating the reusable factory template.

## Agent Handoff Payload

```json
{
  "schema_version": "agentic.factory.AgentHandoff.v1",
  "source_agent": "pm",
  "target_agent": "pm",
  "work_order_id": "WO-0001",
  "module": "sample-resource",
  "current_state": "PLANNED",
  "next_state": "IN_PROGRESS",
  "contract_version": "0.1.0",
  "changed_artifacts": [
    "examples/golden/sample-resource-module/api.contract.md",
    "examples/golden/sample-resource-module/ui.contract.md",
    "examples/golden/sample-resource-module/dto.md"
  ],
  "changed_files": [],
  "scripts_run": [],
  "validation_errors": [],
  "blockers": [],
  "next_action": "Use this sample-only handoff as a schema-valid reference for generated modules."
}
```

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
    "summary": "Sample-only State Transition DTO retained for compatibility validation.",
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
