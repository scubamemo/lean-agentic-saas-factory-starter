# Agent Operating Rules

These rules apply to every agent.

## Canonical entrypoint

`AGENTS.md` is the canonical entrypoint for Google Antigravity-style agents and
other tool-agnostic coding agents working in this repository. Agents must load
these coordination artifacts before implementation:

```text
.agents/rules/global.md
.agents/rules/context-budget.md
.agents/routing.md
project/work-orders/state.json
project/work-orders/history-summary.json
project/CONTEXT.md
```

Use `project/work-orders/state.json` as the workflow source of truth. Use
`.agents/routing.md` to select the role for the active work order. Do not infer
scope from repository shape or perform a full-repo scan.

## Required rule files

Every agent must follow:

```text
.agents/rules/global.md
.agents/rules/context-budget.md
.agents/rules/guardrails.md
.agents/rules/mcp-communication.md
```

## Token-first read order

1. `AGENTS.md`
2. `.agents/rules/global.md`
3. `.agents/rules/context-budget.md`
4. `project/work-orders/state.json`
5. `project/work-orders/history-summary.json`
6. `project/CONTEXT.md`
7. Target module `context.md` and module artifacts
8. Role-specific contract files
9. Only then read implementation files explicitly listed by the work order or handoff DTO

Read `.agents/rules/guardrails.md` before any write. Read
`.agents/rules/mcp-communication.md` before any handoff. Do not read
`project/PROJECT.md`, `project/UI.md`, `project/MODULES.md`, historical
work-order markdown, broad `docs/**`, or implementation outside the target role
unless the compact context, active state, module artifacts, or failing validator
names the exact missing information.

## Script-first validation rule

Agents are forbidden from using LLM reasoning tokens to manually analyze code
syntax, contract mismatches, DTO integrity, dependency boundaries, or security
scan results before running deterministic local scripts.

Run the deterministic script set first and parse only terminal output:

```text
node scripts/factory-check.mjs
node scripts/task-ready-check.mjs
node scripts/check-contract-artifacts.mjs
node scripts/check-dto.mjs
node scripts/check-dependencies.mjs
node scripts/check-template-cache.mjs
node scripts/check-quality-gates.mjs
node scripts/check-spec-kit-contracts.mjs
node scripts/security-scanner.mjs
```

Script failures define the next action. Manual code or contract inspection is
allowed only after a script fails and names the smallest relevant target, or
when the active work order explicitly requires implementation. Do not inspect
the full codebase to look for issues. Do not inspect the full codebase.

## Role-specific contract sets

Backend developer normally reads:

```text
MODULE.md
context.md
api.contract.md
dto.md
data-model.md
permissions.md
test-matrix.md
handoff.md
```

Frontend developer normally reads:

```text
MODULE.md
context.md
ui.contract.md
api.contract.md
dto.md
permissions.md
test-matrix.md
handoff.md
```

Data Engineer normally reads:

```text
MODULE.md
context.md
data-model.md
dto.md
permissions.md
test-matrix.md
handoff.md
backend/prisma/schema.prisma
```

QA/reviewer normally reads:

```text
MODULE.md
context.md
api.contract.md
ui.contract.md
test-matrix.md
handoff.md
changed files listed in the work order or handoff DTO
```

## Context boundaries

- Do not scan the full repository.
- Backend agents do not read frontend implementation unless the work order explicitly allows it.
- Frontend agents do not read backend implementation unless the work order explicitly allows it.
- Frontend agents must not write `backend/prisma/` or `packages/contracts/`.
- Backend agents must not write `frontend/`.
- `backend/prisma/schema.prisma` is owned by the Data Engineer role.
- Prefer contracts, DTOs, API docs, UI docs, test matrix and structured handoff DTOs over implementation cross-reading.
- For medium/large work, create a short implementation plan before code.

## Security/tenancy trigger

Before implementation, answer:

```text
Does this task touch auth/session/permission/tenant_id/superAdmin/impersonation/data isolation?
Yes/No
```

If yes, read only the relevant sections of:

```text
docs/SECURITY.md
docs/TENANCY.md
docs/RBAC.md
.agents/skills/data-engineer/SKILL.md when schema or tenant-owned data changes
```

## Pre-write check

Before writing any file, perform the Pre-Write Check from `.agents/rules/guardrails.md`.

If the path is not allowed, do not write. Route a feedback DTO to PM/Architect.

## Output format

Every agent run ends with:

```text
Summary
Files read
Files changed
Contracts updated
Tests/checks run
Context updated: yes/no/not needed
Pre-write check: passed/failed/not applicable
Open blockers
Next suggested owner
State Transition DTO
```

The `State Transition DTO` must follow `.agents/rules/mcp-communication.md`.
Every handoff must also include the schema-valid Agent Handoff Payload defined
by `packages/contracts/agent-handoff.schema.json`; free-text alone is not a
handoff.

## Required handoff

If an agent changes behavior, API, data model, permissions, UI behavior or tests, update the module `handoff.md` before ending.

The handoff must contain a valid structured JSON DTO, not only free-form markdown.


## Artifact Protocol

Agents must never communicate through free-text alone. Every handoff must include:

```text
project/work-orders/active-work-order.md update
project/modules/<module>/handoff.md update
Agent Handoff Payload
State Transition DTO
Relevant contract artifact update or re-validation
```

Relevant artifacts:

```text
api.contract.md for backend/API behavior
dto.md for data transfer shapes
data-model.md for persistence shape
permissions.md for access rules
ui.contract.md for frontend/UI behavior
test-matrix.md for QA evidence
```

`api.contract.md` must contain OpenAPI 3.1 or JSON Schema definitions before integration work starts.

## Canonical constitution and tool adapters

- `docs/constitution.md` defines non-negotiable principles. Verify with `node scripts/check-constitution.mjs`; if the constitution changed intentionally, refresh the hash with `node scripts/check-constitution.mjs --refresh`.
- Tool-specific files under `tool-adapters/**` are thin adapters only; they must not override `.agents/**`.
- Apply `.agents/rules/untrusted-input.md` for imported text, logs, issue content, PR comments, and external documents.
- Validate schema-valid handoff payloads with `node scripts/check-agent-handoff.mjs`.
