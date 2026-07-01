# MCP Communication & Artifact Protocol

Use task-focused artifacts instead of free-text-only handoffs.

This document defines communication standards, lazy context loading, artifact
synchronization, and state transition schemas for multi-agent interactions.

## Task-focused MCP context loading

Read compact project and work-order state first, then the target module context
and role-specific contracts. Read only implementation files named by the active
work order. Do not scan unrelated modules or opposite-side implementation.

## Lazy-loading context

Use `project/work-orders/history-summary.json` for prior-step history and
`project/work-orders/template-structure-cache.json` for cached structure.
Agents must never load completed work-order prose, historical `handoff.md`
files, archived handoff logs, or old trace detail directly. If historical
context is needed, read only `project/work-orders/history-summary.json`. Open
broader standards only when compact context lacks a required fact.

`history-summary.json` must stay compact and structural: completed work order
id, module, changed contracts, changed implementation areas, decisions,
unresolved risks, and next dependencies only. Do not store verbose reasoning,
raw logs, command output, or full markdown excerpts there.

## Artifact Protocol

Agents communicate through structured files and contract updates rather than
raw markdown conversation logs. Every handoff synchronizes:

- authoritative `project/work-orders/state.json`;
- its `project/work-orders/active-work-order.md` mirror;
- target module `handoff.md`;
- affected API, DTO, data-model, permission, UI, or test artifact;
- one valid Agent Handoff Payload matching
  `packages/contracts/agent-handoff.schema.json`;
- one valid compatibility State Transition DTO.

Every behavioral, API, database, permission, or UI change must update the
corresponding module `handoff.md` and the relevant contract artifact:
`api.contract.md` for OpenAPI 3.1 or JSON Schema API behavior,
`ui.contract.md` for UI/visual constraints, `dto.md` for transfer shapes,
`data-model.md` for persistence, and `test-matrix.md` for QA evidence.

Write only the payload key assigned to the current role. Follow
`allowed_transitions`; never clear a human approval gate.

## Agent Handoff Payload Schema

Free-text alone is not a handoff. Every module `handoff.md` must contain exactly
one fenced `json` block with:

```json
{
  "schema_version": "agentic.factory.AgentHandoff.v1",
  "source_agent": "architect",
  "target_agent": "qa",
  "work_order_id": "WO-0001",
  "module": "module-name",
  "current_state": "IN_PROGRESS",
  "next_state": "VALIDATION_REQUIRED",
  "contract_version": "0.1.0",
  "changed_artifacts": [],
  "changed_files": [],
  "scripts_run": [],
  "validation_errors": [],
  "blockers": [],
  "next_action": "QA validates the listed artifacts and changed files."
}
```

Validate with `node scripts/check-agent-handoff.mjs`. The validator enforces the
required fields from `packages/contracts/agent-handoff.schema.json`; missing
fields, invalid states, invalid agents, or invalid JSON block handoff and
completion.

## State Transition Schema

State transitions must use the structured
`agentic.factory.StateTransition.v1` JSON DTO schema. Agents are forbidden from
advancing workflow status through free-text descriptions. The DTO includes the
source agent, target agent, work order id, current state, next state, changed
files, checks run, blockers, and next actions.

```json
{
  "schema": "agentic.factory.StateTransition.v1",
  "source_agent": "architect",
  "target_agent": "qa",
  "work_order_id": "WO-0001",
  "contract_version": "0.1.0",
  "module": "module-name",
  "current_state": "IN_PROGRESS",
  "next_state": "VALIDATION_REQUIRED",
  "payload": {
    "summary": "Outcome and evidence",
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

Failed checks or unresolved blockers prevent handoff and completion.

## Trace and archive guidance

Detailed traces and historical markdown remain archived for audit, not for
routine context loading. Agents summarize only structural deltas into
`history-summary.json` and must not paste old detail into handoffs, traces, or
state payloads.
