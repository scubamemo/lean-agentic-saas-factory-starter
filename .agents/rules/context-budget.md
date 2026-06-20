# Context Budget

Use the smallest context that can complete the task.

## Default rule

Read `project/CONTEXT.md` and the target module `context.md` before reading longer docs or implementation files.

## Small task

- One module.
- Up to 8 files read.
- No architecture changes.
- Implementation allowed.

## Medium task

- One or two modules.
- Up to 20 files read.
- Plan before code.
- Read only the specific standards needed by the work order.

## Large task

- Do not code immediately.
- Split into smaller work orders.
- Ask PM/architect agent to clarify module boundaries first.

## Expensive context triggers

Escalate instead of scanning broadly when the task requires:

- cross-module refactor,
- tenant model change,
- public API breaking change,
- migration affecting existing data,
- security/session/impersonation behavior,
- ambiguous product behavior.
