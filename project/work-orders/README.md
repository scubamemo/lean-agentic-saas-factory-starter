# Work Orders

Keep one active work order for the current Antigravity task. Archive completed work orders if needed.

## Decision traces

`project/work-orders/traces/` stores compact JSONL decision traces created by `scripts/trace-logger.mjs`. Agents must write traces before phase completion. Traces are audit summaries and must not contain hidden chain-of-thought or full raw logs.

## Rolling history summary

Agents must never read historical `handoff.md` files, archived handoff logs, or
completed work-order markdown files directly for background context. If prior
context is needed, read only `project/work-orders/history-summary.json`.

`history-summary.json` stores structural deltas only:

- completed work order id;
- module;
- changed contracts;
- changed implementation areas;
- decisions;
- unresolved risks;
- next dependencies.

Keep old detail archived in its original artifact or trace. Do not paste verbose
reasoning, command logs, raw markdown, or full handoff text into the rolling
summary.
