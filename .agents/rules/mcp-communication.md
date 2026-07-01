# MCP Communication & Artifact Protocol

This document outlines the communication standards, lazy context loading, and state transition schemas for multi-agent interactions.

## Artifact Protocol

Agents must communicate through structured files and contract updates rather than raw markdown conversation logs:
1. Every handoff must update `project/work-orders/active-work-order.md`.
2. Every behavioral, API, database, or UI change must update the corresponding module `handoff.md` and the relevant contracts.
3. Relevant contracts include:
   - `api.contract.md` (OpenAPI 3.1 or JSON Schema)
   - `ui.contract.md` (UI and visual constraints)
   - `dto.md` (Data Transfer Objects schema)
   - `data-model.md` (Data persistence schema)
   - `test-matrix.md` (QA test specifications and evidence)

## State Transition Schema

State transitions must be represented using the structured `agentic.factory.StateTransition.v1` JSON DTO schema. Agents are forbidden from advancing the workflow status via free-text descriptions. The JSON DTO must define:
- `schema`: `"agentic.factory.StateTransition.v1"`
- `source_agent`: The sending agent role
- `target_agent`: The receiving agent role
- `work_order_id`: The ID of the active work order
- `current_state` and `next_state`
- `payload`: Detailed execution logs, changed files, checks run, and blockers

## Lazy-loading context & Task-focused MCP context loading

To avoid context budget issues and keep reasoning efficient:
1. **Lazy-loading context**: Never read historical `handoff.md` entries or completed work order markdown files. Rely instead on `project/work-orders/history-summary.json` for previous-step delta information.
2. **Task-focused MCP context loading**: Only read the files explicitly listed in the active work order write/read boundaries and the target module's context/contracts files. Do not scan the full repository.
