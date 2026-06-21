# Work Orders

Keep one active work order for the current Antigravity task. Archive completed work orders if needed.

## Decision traces

`project/work-orders/traces/` stores compact JSONL decision traces created by `scripts/trace-logger.mjs`. Agents must write traces before phase completion. Traces are audit summaries and must not contain hidden chain-of-thought or full raw logs.
