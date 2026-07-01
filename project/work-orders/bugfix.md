# Bugfix Work Order

This file is the structured QA-to-owner bugfix packet. QA or Code Reviewer
updates it only when a validation gate fails. QA and Code Reviewer must not fix
implementation code directly.

## Current bugfix status

No active failing bugfix is open. When QA finds a failure, replace the fields
below with observed evidence from the failing command and route the work to the
suspected owner.

## Parent work order

WO-FACTORY-ALIGN-001

## Target module

_template

## Suspected owner

architect

Allowed owner values:

- `backend-developer`
- `frontend-developer`
- `data-engineer`
- `architect`
- `designer`

## Failure isolation checklist

QA must capture all items before routing:

- command run;
- stdout/stderr excerpt;
- failing test suite or test name;
- failing file and line when available;
- suspected owner and why;
- relevant contract section or `test-matrix.md` row;
- expected result;
- actual result;
- smallest reproduction scope;
- whether the same command was rerun after the owner fix.

## Structured bugfix payload

```json
{
  "schema": "agentic.factory.BugfixWorkOrder.v1",
  "status": "not-open",
  "parent_work_order_id": "WO-FACTORY-ALIGN-001",
  "module": "_template",
  "failure": {
    "command_run": "No failing command is currently open.",
    "stdout_stderr_excerpt": "No failing output is currently recorded.",
    "failing_test_name": "No failing test is currently recorded.",
    "failing_file_line": "No failing file or line is currently recorded.",
    "expected_result": "All required validation gates pass.",
    "actual_result": "All required validation gates currently pass.",
    "smallest_reproduction_scope": "No reproduction scope is active."
  },
  "routing": {
    "suspected_owner": "architect",
    "owner_reason": "No active failure; architect owns this factory-maintenance packet structure.",
    "relevant_contract_or_test_matrix_row": "project/work-orders/factory-test-matrix.md"
  },
  "qa_evidence": {
    "qa_must_not_fix_code": true,
    "state_update_required_on_failure": true,
    "state_status_on_failure": "FAILED or REVISION_IN_PROGRESS",
    "validation_errors_append_required": true
  },
  "developer_action": {
    "read_only_context": [
      "project/work-orders/state.json",
      "project/work-orders/bugfix.md",
      "target module context.md",
      "role-specific contract artifacts named by QA"
    ],
    "fix_rule": "Original owner fixes the smallest allowed implementation set and returns to VALIDATION_REQUIRED.",
    "qa_recheck_rule": "QA reruns the exact failing command first, then the remaining required gates."
  }
}
```

## State update rule for QA

When opening a real bugfix, QA updates `project/work-orders/state.json` by
changing only QA-owned workflow fields:

- append a focused object to `validation_errors`;
- update `agent_payloads.qa` with the failure summary and evidence;
- set or request `FAILED` or `REVISION_IN_PROGRESS` according to
  `allowed_transitions`;
- identify the target owner in `next_agent` or `agent_payloads.qa`;
- preserve unrelated role payloads and implementation state.

## State Transition DTO

```json
{
  "schema": "agentic.factory.StateTransition.v1",
  "source_agent": "qa",
  "target_agent": "architect",
  "work_order_id": "WO-FACTORY-ALIGN-001",
  "contract_version": "0.1.0",
  "module": "_template",
  "current_state": "FAILED",
  "next_state": "REVISION_IN_PROGRESS",
  "payload": {
    "summary": "No active bugfix is open. This DTO defines the required QA-to-owner routing shape for future failures.",
    "changed_files": [
      "project/work-orders/bugfix.md"
    ],
    "contracts_updated": [
      "test-matrix.md",
      "bugfix feedback loop contract"
    ],
    "diff_refs": [],
    "checks_run": [],
    "blockers": [],
    "feedback": [],
    "next_actions": [
      "When QA observes a failure, replace this packet with exact failure evidence and route to the suspected owner."
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
