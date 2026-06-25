# Lean Agentic Development Standard

The goal is maximum code quality with minimum AI context and minimum reasoning-token waste.

## Principles

1. Read compact context first.
2. Work from one active JSON state machine.
3. Use contracts instead of cross-reading implementation.
4. Use deterministic scripts before LLM reasoning.
5. Use rolling summaries instead of historical markdown context.
6. Use hash-based structure verification before reading long standards.
7. Add new process only after repeated real mistakes.

## Source of truth

`project/work-orders/state.json` is the single source of truth; operational shorthand: state.json is the single source of truth for work order status, owner, next agent, validation errors and role-scoped payload deltas.

`project/work-orders/active-work-order.md` is a mirror only. Agents must not advance state through free-text markdown.

## Contract-first collaboration

Contracts are required before implementation. Backend and frontend agents
communicate through module artifacts and shared contract packages, not by
reading each other's implementation.

Canonical communication artifacts:

```text
project/modules/<module>/api.contract.md
project/modules/<module>/ui.contract.md
project/modules/<module>/dto.md
project/modules/<module>/data-model.md
project/modules/<module>/permissions.md
packages/contracts/
packages/api-client/
```

Rules:

- Backend implementation must not start until `api.contract.md`, `dto.md`,
  `data-model.md` and `permissions.md` are present or explicitly revalidated.
- Frontend implementation must not start until `ui.contract.md`,
  `api.contract.md`, `dto.md` and `permissions.md` are present or explicitly
  revalidated.
- Frontend must not inspect backend implementation to infer API behavior,
  DTOs, permissions or errors.
- Backend must not inspect frontend implementation to infer UI requirements.
- `packages/contracts/` is the shared data/communication layer for public DTOs,
  schemas, permission constants, events and executable specs.
- `packages/api-client/` may contain generated or maintained client outputs
  derived from contracts.
- Obsolete split UI contract files are not required; route, component, mock and
  visual expectations live in `ui.contract.md`.

## Preferred context set

For most tasks the agent should read:

```text
project/work-orders/state.json
project/work-orders/history-summary.json only if previous-step context is needed
START-HERE.md
AGENTS.md
project/CONTEXT.md
project/modules/<module>/context.md
project/modules/<module>/MODULE.md
role-specific contracts
project/modules/<module>/handoff.md current DTO only
```

## Lazy context and rolling summaries

Agents must never read historical `handoff.md` entries or completed work-order markdown files directly.

If historical context is needed, read only:

```text
project/work-orders/history-summary.json
```

This file must contain structural deltas only: completed work order id, module,
changed contracts, changed implementation areas, decisions, unresolved risks
and next dependencies. It must not contain raw code, verbose reasoning,
command output or long logs.

## Script-first execution

Agents are forbidden from using LLM reasoning tokens to manually analyze code
syntax, contract mismatches, DTO integrity, dependency boundaries, or security
scan results before deterministic checks run.

Run local scripts first and parse only terminal output:

```bash
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

Script failures define the next action. Read only the terminal success/failure
output first and then the precise files named by failed checks. Manual code
inspection is allowed only after a script fails or the active work order
explicitly requires implementation.

## Hash-based standard verification

To avoid parsing long guideline files on every prompt, the factory uses a cached template structure file:

```text
project/work-orders/template-structure-cache.json
```

The cache records both:

- `template_structure_hash` for the canonical module template structure and
  artifact content;
- `standards_context_hash` for the key engineering standards that agents may
  otherwise need to read repeatedly.

The cache is generated during export by:

```bash
node scripts/export-template.mjs
```

For the working repository, refresh it only after intentional template or
standard changes:

```bash
node scripts/check-template-cache.mjs --refresh
```

Before reading `docs/standards/**`, validate the cache:

```bash
node scripts/check-template-cache.mjs
```

If the check passes for the target module, the agent must bypass full
`docs/standards/` reads and proceed with assumed standard context plus the
role-specific artifacts, module contracts and script output. Read a full
standard only when a work order or failing validator names it.

If the check fails, the structure or standards cache is stale. Do not continue with assumed standard context. Either refresh the cache after intentional
changes or fix the unexpected structural drift.

## Delta-only state writing

Agents must not rewrite or emit entire markdown project files to report state changes.

When updating `project/work-orders/state.json`, each role may change only its assigned payload key:

| Agent | Assigned payload key |
|---|---|
| pm | `agent_payloads.pm` |
| architect | `agent_payloads.architect` |
| designer | `agent_payloads.designer` |
| data-engineer | `agent_payloads.data_engineer` |
| backend-developer | `agent_payloads.backend` |
| frontend-developer | `agent_payloads.frontend` |
| qa | `agent_payloads.qa` |
| code-reviewer | `agent_payloads.code_reviewer` |

Mirror markdown may be updated only after JSON state is correct.

## Deterministic state and boundary enforcement

Before starting any new module or feature development phase, run:

```bash
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

The workflow is blocked if any command fails.

## Dependency cruising and SoC rules

- Frontend must never import `backend/` directly.
- Frontend must never import `backend/prisma/`, Prisma migrations, generated Prisma types or backend persistence internals.
- Backend must never import `frontend/` directly.
- Frontend must not import `packages/shared/` unless the target is explicitly UI-compatible under `packages/shared/ui-safe/` or `packages/shared/src/ui-safe/`.
- Cross-module and cross-application communication must flow through `packages/contracts/` or generated `packages/api-client/` outputs.
- No business logic or public data structures should be duplicated outside of `packages/contracts/`.
- Direct feature-to-feature imports are discouraged unless the Architect approves the exact import and the shared public shapes remain in `packages/contracts/`.
- `scripts/check-dependencies.mjs` is a mandatory pre-handoff hook and is exposed as `pnpm check:dependencies`.
- If dependency-cruiser is unavailable locally, `scripts/check-dependencies.mjs` falls back to a deterministic static import scan and prints a clear warning instead of requiring internet access.

## Avoid

- Full repo scans.
- Reading all docs/standards files when `check-template-cache.mjs` passes.
- Running every agent for every task.
- Creating new sidecar files when `state.json`, `history-summary.json`, `handoff.md`, `context.md` or a contract can carry the information.
- Reading historical completed markdown when the rolling summary exists.


## Engineering excellence with lazy standards

Do not read every engineering standard by default. Use the script-first sequence first. If the work order or a failing script names engineering risk, then read only the relevant standard:

```text
software-craftsmanship.md          general SOLID/DRY/KISS/YAGNI and pattern rules
backend-engineering-quality.md     backend layering, tenancy, transactions, data access
frontend-engineering-quality.md    frontend components, state, accessibility, design system
testing-quality-bar.md             QA coverage and evidence rules
code-review-quality-bar.md         final review rubric
```

Agents must apply these quality bars before handoff, but they should lazy-load only the standards relevant to their role and the failing check.

Before handoff or completion, run:

```bash
node scripts/check-quality-gates.mjs
```


## Production-grade observability and standardized specs

- `packages/contracts/specs/*.spec.json` is the primary executable contract format and the machine-readable source for validators, generators and contract drift checks.
- Module markdown contracts such as `api.contract.md`, `ui.contract.md`, `dto.md`, `data-model.md` and `permissions.md` are human-readable mirrors for review and role handoff.
- If JSON and markdown disagree, the JSON spec is authoritative; update the markdown mirror or escalate to Architect before implementation.
- Agents must validate JSON specs with `node scripts/check-spec-kit-contracts.mjs` before implementation handoff.
- Agents must run `node scripts/security-scanner.mjs` before completion or release.
- Agents must write a concise decision trace with `node scripts/trace-logger.mjs` before moving a work order to `COMPLETED`.
- If `project/work-orders/state.json.approval_required` is `true`, execution is paused until a human sets `status` to `APPROVED` or clears the approval gate with an approval note.
- Do not paste private hidden chain-of-thought into traces. Store only concise decision summaries, evidence, scripts run and changed artifacts.
