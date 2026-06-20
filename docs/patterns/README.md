# Module Patterns

Use a pattern to keep modules consistent without adding unnecessary files.

## Common patterns

| Pattern | Use when | Required contracts |
|---|---|---|
| CRUD | create/read/update/delete resource | API, DTO, data, permissions, UI, tests |
| Dashboard | metrics and summary UI | API, DTO, UI, tests |
| Settings | tenant/user/system settings | data, permissions, UI, tests |
| Approval workflow | state transitions and approvals | API, data, permissions, events, tests |
| Integration | external API/webhook/job | API, data, errors, observability, tests |
| Reporting | filters, aggregation, export | API, DTO, performance notes, tests |

Keep examples domain-neutral: Resource, Record, Actor, Workflow, Event.
