# Decision traces

This directory stores compact JSONL decision traces written by:

```bash
node scripts/trace-logger.mjs
```

Each record is one JSON object with:

- `timestamp`
- `agent`
- `work_order_id`
- `module`
- `action`
- `decision`
- `evidence`
- `scripts_run`
- `files_changed`
- `next_agent`
- `risk_level`

Traces are audit summaries only. Do not store hidden reasoning, private
chain-of-thought, long logs, secrets, credentials, or raw user data here.
