# Factory Maintenance Handoff

## Current status

VALIDATION_REQUIRED

## Next agent

qa

## Artifact sync

Factory version, dependency reproducibility, export reset behavior, CI, starter
smoke coverage, production builds, README factory direction, AGENTS canonical
entrypoint, domain-neutral project templates, canonical multi-tenancy docs,
strict context-budget/access-boundary rules, production-grade core role skills,
the canonical module artifact template, contract-first backend/frontend
collaboration standards, Spec Kit-inspired JSON module specs, deterministic
JSON work-order state management, rolling context summarization, and
role-owned delta-only state slices are fixed. `node scripts/factory-check.mjs`
is now the primary mandatory validator: it performs concise structural checks
and orchestrates state readiness, spec-kit specs, contracts, DTOs, dependency
boundaries, security scan, quality gates, template cache and optional
constitution/metadata/handoff/untrusted-input checks. `node scripts/factory-check.mjs`
passes. Dependency boundary enforcement is aligned across
`factory/dependency-cruiser.cjs`, the root adapter, fallback static scanning and
backend/frontend/lean standards. Deterministic secret scanning now runs offline,
scans source/docs/config-style files while skipping generated folders, detects
common credential/token/private-key patterns, and allows clearly fake examples.
QA self-healing workflow is now explicit: QA isolates failures, writes
structured bugfix context, updates QA-owned state deltas, routes to the original
owner, and repeats validation until pass without fixing implementation code.
The canonical development workflow is now cyclic rather than waterfall:
planning, implementation, QA, review and bugfix revisions loop through explicit
state transitions until all completion gates pass. Human-in-the-loop gates now
pause automation for high-risk work until a human manually approves in
`state.json`. Decision trace logging now writes compact JSONL audit records
before handoff or completion without storing hidden reasoning or long logs.
Frontend design-system governance now requires component-catalog inspection,
reuse-or-refactor before creation, Tailwind/Shadcn-compatible styling, no
ad-hoc CSS, no inline style objects except explicitly approved dynamic CSS
variables, and documentation for every reusable component in
`frontend/src/components/COMPONENTS.md`. Engineering Excellence Pack standards
now define practical senior-level gates for craftsmanship, backend/frontend
maintainability, testing evidence, and code review. Core skills reference these
standards lazily so agents use compact role rules first and load detailed
quality docs only when a gate or work order requires them. Backend engineering
quality now explicitly enforces thin controllers, service/use-case business
logic, tenant-scoped data access, stable errors, DTO validation, transaction
and idempotency rules, list query standards, raw query restrictions, audit
logging, performance guardrails, practical pattern guidance, and no backend
DTO duplication outside `packages/contracts/`.
Frontend engineering quality now explicitly enforces page vs reusable component
boundaries, narrow typed component APIs, state colocation, local/global/query
cache rules, form validation from contracts, explicit UI states, accessibility,
keyboard navigation, responsive behavior, design-system tokens, component
reuse, `COMPONENTS.md` updates, and bans on backend imports, manual DTO
duplication, inline hardcoded styles, and ad-hoc CSS outside the design system.
Testing quality now treats `test-matrix.md` as the objective source of test
expectations: every acceptance criterion must map to at least one test row,
backend and frontend scenario coverage is explicit, each row names an expected
test file, and QA cannot mark pass while required rows are planned, failing, or
missing reproducible evidence.
Code review quality now limits decisions to PASS, PASS_WITH_WARNINGS or FAIL,
requires a mandatory architecture/security/test/craftsmanship/design-system
checklist, forbids reviewer implementation, forbids full-repo reading unless
explicitly escalated, and requires every FAIL to name the precise issue, owner
agent, required fix, related artifact and suggested script.
Cost-aware model routing now defaults deterministic work to Tier 2 lightweight
agents and reserves Tier 1 high-reasoning agents for architecture, review,
critical QA failure, security/tenant isolation risk, complex business logic,
high-risk refactors and other explicit escalation triggers. Cheap agents must
use scripts such as `node scripts/new-module.mjs <module-name>` for generated
structure instead of spending reasoning tokens on scaffolding.
Hash-based standard verification now validates both module template structure
and key engineering standard context. Agents may skip full `docs/standards/**`
reads only when `template_structure_hash` and `standards_context_hash` match;
stale cache blocks validation until an intentional
`node scripts/check-template-cache.mjs --refresh`.
Prompt-injection protection now defines trusted instruction sources,
untrusted sources, data-only handling, and severity-based scanner behavior for
imported text, issue/PR comments, logs, external docs, dependency README files,
generated files, external API responses, and unapproved pasted business text.
The factory constitution is now concise and hash-enforced: `docs/constitution.md`
defines non-negotiable principles, `scripts/check-constitution.mjs` verifies the
required principle set and cached SHA-256, and intentional constitution edits
must run `node scripts/check-constitution.mjs --refresh`.
Hook policy now defines deterministic blocking steps before reads, writes,
handoffs and completion. The policy requires minimal context, allowed write path
verification, contract ownership checks, artifact and handoff updates, trace
records, delta-only state updates, and mandatory completion gates.
Spec-driven phase workflows now orchestrate feature work through specify,
plan, tasks, implement and validate phases so implementation cannot start
before business intent, contracts, technical plan, work-order ownership and
state transitions are ready.
Typed handoff protocol now requires a schema-valid `AgentHandoff.v1` JSON
payload in module handoffs. Free-text alone is invalid, the compatibility
StateTransition DTO remains as a transition mirror, and `factory-check` runs the
handoff validator as a critical gate.

## Agent Handoff Payload

```json
{
  "schema_version": "agentic.factory.AgentHandoff.v1",
  "source_agent": "architect",
  "target_agent": "qa",
  "work_order_id": "WO-FACTORY-ALIGN-001",
  "module": "_template",
  "current_state": "VALIDATION_REQUIRED",
  "next_state": "QA_PENDING",
  "contract_version": "0.1.0",
  "changed_artifacts": [
    "packages/contracts/agent-handoff.schema.json",
    "scripts/check-agent-handoff.mjs",
    "project/modules/_template/handoff.md",
    "examples/golden/sample-resource-module/handoff.md",
    ".agents/rules/mcp-communication.md",
    "AGENTS.md",
    "scripts/factory-check.mjs",
    "scripts/check-quality-gates.mjs",
    "project/work-orders/template-structure-cache.json",
    "project/work-orders/traces/WO-FACTORY-ALIGN-001.trace.jsonl"
  ],
  "changed_files": [
    "packages/contracts/agent-handoff.schema.json",
    "scripts/check-agent-handoff.mjs",
    "project/modules/_template/handoff.md",
    "examples/golden/sample-resource-module/handoff.md",
    ".agents/rules/mcp-communication.md",
    "AGENTS.md",
    "scripts/factory-check.mjs",
    "scripts/check-quality-gates.mjs",
    "project/work-orders/template-structure-cache.json",
    "project/work-orders/traces/WO-FACTORY-ALIGN-001.trace.jsonl",
    "project/work-orders/state.json",
    "project/work-orders/history-summary.json",
    "project/work-orders/factory-handoff.md"
  ],
  "scripts_run": [
    "node --check scripts/check-agent-handoff.mjs",
    "node scripts/check-agent-handoff.mjs",
    "node scripts/check-dto.mjs",
    "node scripts/check-quality-gates.mjs",
    "node scripts/check-template-cache.mjs --refresh",
    "node scripts/trace-logger.mjs"
  ],
  "validation_errors": [],
  "blockers": [],
  "next_action": "QA reruns factory validation and verifies schema-valid handoff payloads."
}
```

## State Transition DTO

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
    "summary": "Typed handoff protocol is enforced with a flat AgentHandoff.v1 schema, schema-valid module handoff JSON blocks, a deterministic validator, and critical factory-check integration.",
    "changed_files": ["packages/contracts/agent-handoff.schema.json", "scripts/check-agent-handoff.mjs", "project/modules/_template/handoff.md", "examples/golden/sample-resource-module/handoff.md", ".agents/rules/mcp-communication.md", "AGENTS.md", "scripts/factory-check.mjs", "scripts/check-quality-gates.mjs", "project/work-orders/template-structure-cache.json", "project/work-orders/traces/WO-FACTORY-ALIGN-001.trace.jsonl", "project/work-orders/state.json", "project/work-orders/history-summary.json", "project/work-orders/factory-handoff.md"],
    "contracts_updated": ["typed agent handoff payload schema", "schema-valid module handoff contract", "free-text-only handoff rejection rule"],
    "diff_refs": [],
    "checks_run": ["node --check scripts/check-agent-handoff.mjs", "node scripts/check-agent-handoff.mjs", "node scripts/check-dto.mjs", "node scripts/check-quality-gates.mjs", "node scripts/check-template-cache.mjs --refresh", "node scripts/trace-logger.mjs"],
    "blockers": [],
    "feedback": [],
    "next_actions": ["QA independently reruns pnpm check:project and reviews the typed handoff diff"]
  },
  "context_budget": {
    "mode": "medium",
    "files_read_count": 12,
    "history_pruned": true,
    "full_repo_scan": false
  }
}
```
