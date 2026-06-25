# Context Budget

## Canonical read order

Use this exact order unless a failing validator names a more specific file:

```text
AGENTS.md
.agents/rules/global.md
.agents/rules/context-budget.md
project/work-orders/state.json
project/work-orders/history-summary.json
project/CONTEXT.md
project/modules/<module>/context.md
project/modules/<module>/MODULE.md
project/modules/<module>/<role-specific-contract>.md
implementation files explicitly named by the work order or handoff DTO
```

The active work order markdown is a mirror only. Agents must never read
historical `handoff.md` files, archived handoff logs, or completed work-order
markdown files directly for background context.

## Lazy-loading context

Run `node scripts/check-template-cache.mjs` before opening broad standards. Use
`project/work-orders/state.json` for current ownership and
`project/work-orders/history-summary.json` for prior-step context. If historical
context is needed, read only `project/work-orders/history-summary.json`; do not
open historical `handoff.md` files, completed work-order markdown, archived
handoff logs, or old trace detail. Load only the exact contract, implementation
file, or standard named by a failing check, active work order, or structured
handoff DTO.

If `node scripts/check-template-cache.mjs` passes, `template_structure_hash` and
`standards_context_hash` match the current repository. Agents may skip reading
full `docs/standards/**` and use assumed standard context plus the compact
role-specific rules, module artifacts, contracts and script output. Read a full
standard only when:

- the active work order explicitly names that standard;
- a deterministic validator fails and names that standard;
- the template cache check fails;
- the task is to change standards or validation policy.

If template structure or key standards intentionally change, refresh the cache
with:

```bash
node scripts/check-template-cache.mjs --refresh
```

Do not bypass a stale cache. A stale cache means broad standard assumptions are
not safe.

Compatibility wording for validators: agents must never read historical
handoff.md files or completed work-order prose directly.

Validator compatibility phrase: never read historical handoff.md.

## Script output before inspection

Do not spend LLM reasoning tokens manually checking syntax, contract mismatch,
DTO integrity, dependency boundaries, or security scan findings before running
deterministic scripts. Parse terminal output first. Manual file inspection is
allowed only when a script fails and names the target, or when the work order
explicitly requires implementation.

## Rolling history summary format

`project/work-orders/history-summary.json` may contain only structural deltas:

- completed work order id;
- module;
- changed contracts;
- changed implementation areas;
- decisions;
- unresolved risks;
- next dependencies.

Do not store verbose reasoning, raw logs, command output, old markdown prose, or
full handoff text in the rolling summary. Old detail stays archived in the
original artifacts and traces; agents consume only the compact summary.

Use the smallest context that can complete the task.

## Delta-only state writing

State updates must be minimal and explicit. Agents must not regenerate the full
`project/work-orders/state.json` in responses or handoffs. Update only the
assigned role slice:

```text
pm -> agent_payloads.pm
architect -> agent_payloads.architect
designer -> agent_payloads.designer
data-engineer -> agent_payloads.data_engineer
backend-developer -> agent_payloads.backend
frontend-developer -> agent_payloads.frontend
qa -> agent_payloads.qa
code-reviewer -> agent_payloads.code_reviewer
```

Examples:

- Frontend agent updates `agent_payloads.frontend` only.
- Backend agent updates `agent_payloads.backend` only.
- QA updates `agent_payloads.qa` and focused `validation_errors` only.
- Architect updates `agent_payloads.architect` and contract review status only.

If a task appears to require another slice, stop and escalate instead of
rewriting the whole state file.

## Default rule

Read `project/CONTEXT.md` and the target module `context.md` before reading
longer docs or implementation files. Prefer module artifacts over broad project
documents. Prefer contracts over implementation.

## No full-repo-scan policy

Full repository scans are forbidden by default. Use targeted file lists from
`state.json`, module artifacts, handoff DTOs, or failing validators. If a broad
scan seems necessary, stop and add an escalation explaining:

- the missing fact;
- the smallest proposed search scope;
- the role that should authorize it;
- the risk of continuing without it.

## Small task

- One module.
- Up to 8 files read.
- No architecture changes.
- Implementation allowed.
- No broad `docs/**`, historical markdown, or opposite-side implementation.

## Medium task

- One or two modules.
- Up to 20 files read.
- Plan before code.
- Read only the specific standards needed by the work order.
- Read only implementation files named by the work order, handoff DTO, or a
  failing check.

## Large task

- Do not code immediately.
- Split into smaller work orders.
- Ask PM/architect agent to clarify module boundaries first.
- Keep each implementation pass within a medium context budget.
- Do not solve a large task by reading the whole repository.

## Expensive context triggers

Escalate instead of scanning broadly when the task requires:

- cross-module refactor,
- tenant model change,
- public API breaking change,
- migration affecting existing data,
- security/session/impersonation behavior,
- ambiguous application behavior.
