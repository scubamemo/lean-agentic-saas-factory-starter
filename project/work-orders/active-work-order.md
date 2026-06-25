# Active Work Order

## State source of truth

**DEPRECATED AS PRIMARY STATE:** `project/work-orders/active-work-order.md` is a human-readable mirror only. `project/work-orders/state.json` is the single source of truth for all agents, validators, status transitions, ownership and validation errors. Do not manually advance workflow state by editing this file. Update `state.json` first, then mirror the relevant summary here.


## Lazy context and rolling history

Historical context must not be loaded from completed work-order markdown, historical `handoff.md` files, archived handoff logs, or old trace detail. If an agent needs previous-step context, it must read only:

```text
project/work-orders/history-summary.json
```

This file contains compact structural deltas only: completed work order id, module, changed contracts, changed implementation areas, decisions, unresolved risks, and next dependencies. Agents must not paste raw logs, verbose reasoning, old markdown prose, command output, or full handoff text into it.

## Delta-only writing

Agents must not rewrite whole project markdown files to report state changes. Update only `project/work-orders/state.json` and only the payload key assigned to the current skill boundary:

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

Mirror markdown may be updated only after `state.json` is updated.


## ID

WO-FACTORY-ALIGN-001

## Task type

refactor

Allowed values: docs-only, contract-only, backend-only, frontend-only, data-model, full-stack, bugfix, refactor, review, release

## Status

VALIDATION_REQUIRED

Allowed values from `state.json`: PLANNED, IN_PROGRESS, VALIDATION_REQUIRED, QA_PENDING, APPROVED, COMPLETED, FAILED, REVISION_IN_PROGRESS


## Pre-development validation

Before any `New Module` or `Feature Development` phase starts, the responsible agent must run the factory consistency checks from the repository root:

```bash
node scripts/factory-check.mjs
node scripts/check-contract-artifacts.mjs
node scripts/check-dependencies.mjs
node scripts/check-template-cache.mjs
node scripts/task-ready-check.mjs
```

Template initialization may use `node scripts/task-ready-check.mjs --allow-tbd`; real project work must not use `--allow-tbd`.

Do not start implementation if these checks fail. Fix the work order, module template, or contract artifact state first.

## Handoff gate

No agent may hand off work to the next agent until this active work order is updated with:

```text
current Status
Owner / Next owner
Contracts updated or explicitly re-validated
Tests/checks run
State Transition DTO
```

`project/work-orders/state.json` is the source of truth for the next transition. This file must be updated only as a mirror after `state.json` changes. Agents must never use this markdown file as the primary state store.

## Development chain

Plan -> Backend -> Frontend -> QA -> Code Reviewer

QA approval is mandatory before merge or release.

## Context mode

medium

Allowed values: small, medium, large

- small: one module, up to 8 files read, implementation allowed.
- medium: one or two modules, up to 20 files read, plan before code.
- large: no direct implementation; split into smaller work orders.

## Owner

qa

## Target module

_template

## Goal

Align validators, documentation, rules, workflows, and role skills to the canonical v4 factory state and constitution contract.

## Acceptance criteria

- All factory/template checks pass without version-drift failures.
- Every role skill carries aligned metadata, script-first gates, ownership boundaries, and handoff requirements.
- Documentation consistently identifies `project/work-orders/state.json` as authoritative.
- Dependency-cruiser configuration has one canonical source with a compatible root adapter.

## Security / tenancy trigger

Does this task touch auth/session/permission/tenant_id/superAdmin/impersonation/data isolation?

No

If yes, read the relevant parts of `docs/SECURITY.md`, `docs/TENANCY.md`, `docs/RBAC.md`, and route schema/data isolation work to Data Engineer.

## Artifact protocol

Every handoff must update or explicitly re-validate the relevant artifact and must write the transition status to `project/work-orders/state.json`:

- API/backend changes: `project/modules/<module>/api.contract.md`
- UI/frontend changes: `project/modules/<module>/ui.contract.md`
- DTO/data changes: `project/modules/<module>/dto.md` and `project/modules/<module>/data-model.md`
- QA changes: `project/modules/<module>/test-matrix.md`
- Every transition: `project/modules/<module>/handoff.md`, `project/work-orders/state.json`, and this mirror file

## Must read

- START-HERE.md
- AGENTS.md
- .agents/rules/guardrails.md
- .agents/rules/mcp-communication.md
- project/CONTEXT.md
- project/work-orders/state.json
- project/work-orders/active-work-order.md
- project/modules/<module>/context.md
- project/modules/<module>/MODULE.md

## Read by role

Backend:

- project/modules/<module>/api.contract.md
- project/modules/<module>/dto.md
- project/modules/<module>/data-model.md
- project/modules/<module>/permissions.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md

Frontend:

- docs/standards/frontend-standards.md
- project/modules/<module>/ui.contract.md
- project/modules/<module>/api.contract.md
- project/modules/<module>/dto.md
- project/modules/<module>/permissions.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md

Data Engineer:

- project/modules/<module>/data-model.md
- project/modules/<module>/dto.md
- project/modules/<module>/api.contract.md
- project/modules/<module>/permissions.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md
- backend/prisma/schema.prisma

QA/reviewer:

- project/modules/<module>/api.contract.md
- project/modules/<module>/ui.contract.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md
- changed files listed in handoff DTO

## Optional read

- project/PROJECT.md only if application context is missing from `project/CONTEXT.md`.
- project/UI.md only if UI context is missing from `project/CONTEXT.md` or `ui.contract.md`.
- project/MODULES.md only if module ownership is unclear.
- docs/standards/** only if the task touches that specific standard.

## Allowed write paths

- project/modules/<module>/**
- backend/src/modules/<module>/** for backend work
- backend/test/** for backend tests
- backend/prisma/schema.prisma only for Data Engineer work
- backend/prisma/migrations/** only for Data Engineer work
- frontend/src/app/** for frontend routes/pages
- frontend/src/components/** for reusable frontend components and documentation
- frontend/src/lib/** for frontend shared UI/client work
- frontend/test/** for frontend tests
- project/work-orders/bugfix.md for QA/review failure routing
- .agents/** for canonical factory rules, workflows, routing, and role skills
- .dependency-cruiser.cjs for the root compatibility adapter
- README.md, START-HERE.md, and AGENTS.md for factory documentation alignment
- packages/contracts/** for Architect-owned shared contract package maintenance
- scripts/** only when a validator contradicts the canonical constitution/version

## Forbidden paths by default

- unrelated modules
- frontend implementation for backend-only work
- backend implementation for frontend-only work
- backend/prisma/** for Frontend Dev and Backend Dev unless Data Engineer explicitly owns the task
- packages/contracts/** for Frontend Dev
- factory standards unless this is a factory-maintenance work order
- broad docs/ or project/ rewrites unless this is a docs/refactor work order
- ad-hoc CSS or unapproved UI styling

## Required output

- Pre-development checks run
- Summary
- Files read
- Files changed
- Contracts updated
- Tests/checks run
- Context updated: yes/no/not needed
- Pre-write check: passed/failed/not applicable
- Handoff updated
- Active work order updated
- Next owner
- State Transition DTO

## State Transition DTO

The DTO below is a mirror of the current transition. The state machine record in `project/work-orders/state.json` is authoritative.

```json
{
  "schema": "agentic.factory.StateTransition.v1",
  "source_agent": "architect",
  "target_agent": "qa",
  "work_order_id": "WO-FACTORY-ALIGN-001",
  "contract_version": "0.1.0",
  "module": "_template",
  "current_state": "VALIDATION_REQUIRED",
  "next_state": "QA_PENDING",
  "payload": {
    "summary": "Hook policy is enforced: agents now have deterministic pre-read, pre-write, pre-handoff and pre-completion blocking steps for minimal context, write-boundary verification, artifact/handoff/trace/state updates, and mandatory completion gates.",
    "changed_files": [
      ".agents/README.md",
      ".agents/routing.md",
      ".agents/rules/*.md",
      ".agents/skills/*/SKILL.md",
      ".agents/workflows/*.md",
      ".dependency-cruiser.cjs",
      "AGENTS.md",
      "README.md",
      "START-HERE.md",
      "TEMPLATE-BOUNDARY.md",
      "factory/profiles.md",
      "factory/quality-gates.md",
      "docs/**",
      "docs/standards/lean-agentic-development.md",
      "docs/standards/backend-standards.md",
      "docs/standards/frontend-standards.md",
      "packages/contracts/package.json",
      "packages/contracts/README.md",
      "packages/contracts/src/index.ts",
      "packages/contracts/spec-kit.module.schema.json",
      "packages/contracts/specs/_template.spec.json",
      "packages/contracts/specs/sample-resource.spec.json",
      "backend/prisma/schema.prisma",
      "project/PROJECT.md",
      "project/CONTEXT.md",
      "project/UI.md",
      "project/modules/_template/**",
      "scripts/new-work-order.mjs",
      "scripts/new-module.mjs",
      "scripts/check-spec-kit-contracts.mjs",
      "scripts/factory-check.mjs",
      "scripts/check-skill-metadata.mjs",
      "factory/dependency-cruiser.cjs",
      ".dependency-cruiser.cjs",
      "scripts/check-dependencies.mjs",
      "docs/standards/backend-standards.md",
      "docs/standards/frontend-standards.md",
      "project/work-orders/_template.md",
      "project/work-orders/state.json",
      "project/work-orders/state.schema.json",
      "project/work-orders/history-summary.json",
      "project/work-orders/active-work-order.md",
      "project/work-orders/README.md",
      ".agents/rules/context-budget.md",
      ".agents/rules/global.md",
      ".agents/rules/mcp-communication.md",
      ".agents/skills/architect/SKILL.md",
      ".agents/skills/backend-developer/SKILL.md",
      ".agents/skills/code-reviewer/SKILL.md",
      ".agents/skills/data-engineer/SKILL.md",
      ".agents/skills/designer/SKILL.md",
      ".agents/skills/frontend-developer/SKILL.md",
      ".agents/skills/pm/SKILL.md",
      ".agents/skills/qa/SKILL.md",
      "AGENTS.md",
      "docs/standards/lean-agentic-development.md",
      "scripts/task-ready-check.mjs",
      "scripts/check-agent-handoff.mjs",
      "scripts/check-dto.mjs",
      "scripts/check-skill-metadata.mjs",
      "scripts/export-template.mjs",
      "pnpm-lock.yaml",
      "scripts/check-export-template.mjs",
      ".github/workflows/ci.yml",
      "backend/test/tenancy.service.spec.ts",
      "frontend/test/permissions.test.ts",
      "frontend/src/app/page.tsx",
      "frontend/src/app/layout.tsx",
      "scripts/security-scanner.mjs",
      ".agents/rules/global.md",
      ".agents/skills/qa/SKILL.md",
      ".agents/workflows/bugfix.md",
      "project/work-orders/bugfix.md",
      ".agents/workflows/cyclic-development.md",
      ".agents/workflows/feature-development.md",
      "project/work-orders/state.schema.json",
      "scripts/task-ready-check.mjs",
      ".agents/skills/architect/SKILL.md",
      ".agents/skills/data-engineer/SKILL.md",
      ".agents/skills/backend-developer/SKILL.md",
      ".agents/skills/code-reviewer/SKILL.md",
      ".agents/skills/qa/SKILL.md",
      ".agents/skills/designer/SKILL.md",
      ".agents/skills/frontend-developer/SKILL.md",
      ".agents/skills/pm/SKILL.md",
      "scripts/trace-logger.mjs",
      "project/work-orders/traces/README.md",
      "project/work-orders/traces/WO-FACTORY-ALIGN-001.trace.jsonl",
      "scripts/export-template.mjs",
      "scripts/new-work-order.mjs",
      "frontend/src/components/COMPONENTS.md",
      "scripts/check-quality-gates.mjs",
      "docs/standards/testing-quality-bar.md",
      "docs/standards/code-review-quality-bar.md",
      "docs/standards/frontend-engineering-quality.md",
      "docs/standards/backend-engineering-quality.md",
      "docs/standards/backend-standards.md",
      "docs/standards/frontend-standards.md",
      "docs/standards/testing-quality-bar.md",
      "project/modules/_template/test-matrix.md",
      "docs/standards/code-review-quality-bar.md",
      ".agents/routing.md",
      ".agents/rules/global.md",
      "scripts/check-template-cache.mjs",
      "project/work-orders/template-structure-cache.json",
      "docs/standards/prompt-injection-safety.md",
      ".agents/rules/untrusted-input.md",
      "scripts/check-untrusted-instructions.mjs",
      "docs/constitution.md",
      "scripts/check-constitution.mjs",
      "project/work-orders/constitution-cache.json",
      ".agents/rules/hook-policy.md",
      ".agents/workflows/feature-development.md",
      ".agents/workflows/cyclic-development.md",
      ".agents/workflows/bugfix.md",
      ".agents/workflows/new-module.md",
      ".agents/workflows/new-project.md",
      ".agents/workflows/review-release.md"
    ],
    "contracts_updated": [
      "agent governance rules",
      "role skill metadata",
      "work-order v4 state contract",
      "deterministic JSON state schema",
      "cyclic revision transition graph",
      "rolling structural history summary",
      "token-budget context loading rules",
      "role-owned agent_payloads slices",
      "delta-only state ownership rules",
      "mandatory script-first validation rule",
      "skill required_scripts metadata",
      "factory validation contract",
      "dependency boundary contract",
      "packages/contracts communication-layer rule",
      "secret scanning validation contract",
      "no-secrets agent rule",
      "bugfix feedback loop contract",
      "cyclic workflow state contract",
      "HITL approval state contract",
      "agent high-risk approval rules",
      "decision trace JSONL contract",
      "agent trace-before-handoff rule",
      "frontend design-system compliance contract",
      "component reuse catalog contract",
      "ui.contract.md compliance rule",
      "Engineering Excellence Pack",
      "software craftsmanship quality bar",
      "backend/frontend engineering quality bars",
      "testing quality bar",
      "code review quality bar",
      "backend engineering quality standard",
      "backend clean architecture boundary contract",
      "backend tenant isolation and testability quality bar",
      "frontend engineering quality standard",
      "frontend accessibility and state handling quality bar",
      "frontend reuse-first component policy",
      "testing quality bar",
      "test-matrix source-of-truth contract",
      "QA objective pass/fail criteria",
      "code review quality bar",
      "review decision contract",
      "actionable FAIL finding contract",
      "cost-aware model routing contract",
      "Tier 1/Tier 2 escalation policy",
      "script-first scaffolding cost rule",
      "hash-based template cache contract",
      "standards_context_hash lazy-read contract",
      "stale cache validation gate",
      "prompt-injection safety standard",
      "untrusted input data-only rule",
      "untrusted instruction scanner contract",
      "factory constitution contract",
      "constitution hash cache contract",
      "non-negotiable governance principles",
      "hook-policy blocking contract",
      "pre-read/pre-write/pre-handoff/pre-completion gates",
      "workflow hook enforcement",
      "domain-neutral factory documentation",
      "tenancy/RBAC/database standards",
      "agent context/access rules",
      "core role skill contracts",
      "contract-first backend/frontend standard",
      "Spec Kit JSON module spec schema",
      "machine-readable module spec contracts",
      "factory-test-matrix.md",
      "api.contract.md",
      "ui.contract.md",
      "dto.md",
      "data-model.md",
      "permissions.md",
      "test-matrix.md"
    ],
    "diff_refs": [],
    "checks_run": [
      "pnpm check:template",
      "node scripts/task-ready-check.mjs",
      "node scripts/trace-logger.mjs",
      "node --check scripts/trace-logger.mjs",
      "node scripts/task-ready-check.mjs --allow-tbd",
      "node --check scripts/new-work-order.mjs",
      "node --check scripts/task-ready-check.mjs",
      "node --check scripts/check-agent-handoff.mjs",
      "node --check scripts/check-dto.mjs",
      "node --check scripts/export-template.mjs",
      "node --check scripts/new-module.mjs",
      "node --check scripts/check-spec-kit-contracts.mjs",
      "node scripts/check-spec-kit-contracts.mjs",
      "node scripts/check-agent-handoff.mjs",
      "node scripts/factory-check.mjs",
      "node --check scripts/factory-check.mjs",
      "node --check scripts/check-dependencies.mjs",
      "node scripts/check-dependencies.mjs",
      "pnpm check:dependencies",
      "node --check scripts/security-scanner.mjs",
      "node scripts/security-scanner.mjs",
      "pnpm check:security",
      "node scripts/check-skill-metadata.mjs",
      "node --check scripts/check-quality-gates.mjs",
      "node scripts/check-quality-gates.mjs",
      "node --check scripts/task-ready-check.mjs",
      "node scripts/task-ready-check.mjs",
      "git diff --check",
      "pnpm check:project"
    ],
    "blockers": [],
    "feedback": [],
    "next_actions": [
      "QA independently re-runs pnpm check:project and reviews the complete diff"
    ]
  },
  "context_budget": {
    "mode": "medium",
    "files_read_count": 20,
    "history_pruned": true,
    "full_repo_scan": false
  }
}
```


## HITL / Trace mirror

- Primary HITL flag: `project/work-orders/state.json.approval_required`.
- If approval is required, automation pauses until a human manually sets
  `state.json.status` to `APPROVED`, `approved_by` to `human:<name>`, and adds
  an `approval_notes` entry.
- Agents may request approval by setting `approval_required=true`,
  `approval_requested_by`, and `approval_reason`; agents cannot self-approve or
  clear the gate.
- Decision traces are written with `scripts/trace-logger.mjs` under `project/work-orders/traces/`.
