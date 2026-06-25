# Bugfix Work Order

QA or Code Reviewer fills this file when a check fails. They report evidence
and route the task; they do not fix production implementation directly.

## ID

BUGFIX-TBD

## Parent work order

WO-0001

## Target module

TBD

## Target owner

architect

## Status

FAILED

## Failure summary

TBD

## Failing command

```bash
TBD
```

## Precise failing context

| File | Lines | Rule/check | Expected | Actual |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD |

## Required developer action

TBD

## State Transition DTO

```json
{
  "schema": "agentic.factory.StateTransition.v1",
  "source_agent": "qa",
  "target_agent": "architect",
  "work_order_id": "WO-0001",
  "contract_version": "0.1.0",
  "module": "TBD",
  "current_state": "QA_PENDING",
  "next_state": "FAILED",
  "payload": {
    "summary": "TBD",
    "changed_files": ["project/work-orders/bugfix.md"],
    "contracts_updated": ["api.contract.md", "ui.contract.md", "test-matrix.md"],
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
