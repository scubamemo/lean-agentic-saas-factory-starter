# Agent Routing

Run only the agent needed for the active work order. Do not run the whole agent set by default.

## Routing inputs

Choose the role from the smallest authoritative context:

```text
AGENTS.md
.agents/rules/global.md
.agents/rules/context-budget.md
project/work-orders/state.json
project/work-orders/history-summary.json
project/CONTEXT.md
target module context/artifacts
```

Do not route by scanning the repository. If routing is unclear, escalate to PM
or Architect with the exact missing decision.

| Task type | Primary agent | Supporting agent | Normal context |
|---|---|---|---|
| docs-only | pm | architect | project docs only |
| contract-only | architect | designer/backend/frontend as needed | module contracts only |
| backend-only | backend-developer | architect/qa | backend contract set |
| frontend-only | frontend-developer | designer/qa | frontend contract set |
| full-stack | architect | backend + frontend + qa | split into backend and frontend passes |
| bugfix | owner of broken area | qa/reviewer | smallest failing area |
| refactor | architect | relevant implementer | plan first |
| review | code-reviewer | qa | changed files + contracts |
| release | qa | code-reviewer | test matrix + handoff |

## Model Tiering Matrix

To optimize reasoning costs, agents are routed according to task complexity:
- **Tier 1** (High reasoning: Gemini 1.5 Pro, etc.): Reserved for planning, code review, architectural design, database migration safety analysis, and security checks.
- **Tier 2** (Fast/cheap: Gemini 1.5 Flash, etc.): Default for PM updates, boilerplate implementation, test execution, and running scripts. Use **cheap models** for all routine tasks.

## Module Generation Routing

- To generate new modules, run **scripts/new-module.mjs** rather than manually structuring folders.
## Role context packs

- Backend Developer: backend contract set plus explicitly named backend files.
  Never read/write frontend implementation.
- Frontend Developer: frontend contract set plus explicitly named frontend
  files. Never read/write backend implementation, `backend/prisma/`, or
  `packages/contracts/`.
- Data Engineer: data contracts, permissions, test matrix and Prisma schema.
  Owns `backend/prisma/schema.prisma`.
- QA: module contracts, test matrix, changed files listed in handoff DTO and
  evidence files. QA cannot implement fixes.
- Code Reviewer: module contracts, test matrix, changed files listed in handoff
  DTO and evidence files. Reviewer cannot implement fixes.

## Escalation routing

If a role needs forbidden context, route a blocker instead of opening the file:

- frontend detail needed by Backend -> Frontend Developer or Architect;
- backend detail needed by Frontend -> Backend Developer or Architect;
- Prisma/schema detail needed by any non-Data role -> Data Engineer;
- shared contract change needed by Frontend -> Architect/Backend/Data Engineer;
- implementation defect found by QA/Reviewer -> original owner through
  `project/work-orders/bugfix.md`.

## Model Tiering Matrix

Canonical machine-readable policy: `.agents/model-routing.json`.

Role is not the same thing as model tier. Use the active task risk, not the
agent name alone, to select a model. For example, Architect may use Tier 2 for a
small contract wording change or deterministic scaffold review, then escalate to
Tier 1 only when architecture/risk triggers are present.

| Tier | Cost profile | Primary use | Examples |
|---|---|---|---|
| Tier 1 | high-reasoning / expensive | Risk, architecture, review and complex decisions | architect, code-reviewer, critical QA failure, security/tenant isolation risk, complex business logic, high-risk refactor |
| Tier 2 | lightweight / cheap | Deterministic, bounded and script-assisted work | PM, designer, backend/frontend boilerplate, script execution, state updates, straightforward implementation |

Default to Tier 2 when the task is deterministic, contract-bounded and script
verifiable. Escalate to Tier 1 only when the work needs expensive reasoning for
architecture, business logic, review or risk decisions.

Tier 2 agents must use scripts for structure generation instead of reasoning
through folder/file creation. New module scaffolding must use:

```bash
node scripts/new-module.mjs <module-name>
```

Use `scripts/new-work-order.mjs` for deterministic work-order creation when a
new work order is needed.

Tier 1 agents should focus on business logic, architecture, review,
security/tenant risk, complex tradeoffs, and high-risk decisions. Tier 1 should
not spend expensive reasoning on script execution, simple state updates,
mechanical metadata edits, or generated scaffolding unless a lower tier failed
or escalated with evidence.

Model choice never bypasses checks, role ownership, context boundaries, or
human approval.

## Recommended model map

Use `.agents/model-routing.json` as the source for adapters. These display
names are tool-agnostic; adapter layers may map them to provider-specific IDs.

| Agent | Default tier | Tier 2 model | Tier 1 / escalation model |
|---|---|---|---|
| PM | Tier 2 | Gemini 3 Flash | Claude Sonnet 4.6 (thinking) |
| Architect | Tier 2 by default, Tier 1 on risk | Gemini 3.1 Pro (low) | Gemini 3.1 Pro (high), then Claude Opus 4.6 (thinking) for highest risk |
| Designer | Tier 2 | Gemini 3.5 Flash | Claude Sonnet 4.6 (thinking) |
| Backend Developer | Tier 2 | Gemini 3.5 Flash | Claude Sonnet 4.6 (thinking), then Claude Opus 4.6 (thinking) for hard failures |
| Frontend Developer | Tier 2 | Gemini 3.5 Flash | Claude Sonnet 4.6 (thinking) |
| Data Engineer | Tier 2 by default, Tier 1 on schema/data risk | Gemini 3.1 Pro (low) | Gemini 3.1 Pro (high), then Claude Opus 4.6 (thinking) for destructive or tenant-risk work |
| QA | Tier 2 | Gemini 3.5 Flash or GPT-OSS-120b | Claude Sonnet 4.6 (thinking), then Claude Opus 4.6 (thinking) for release blockers |
| Code Reviewer | Tier 1 for final review | Gemini 3.1 Pro (low) for mechanical checks | Claude Sonnet 4.6 (thinking), then Claude Opus 4.6 (thinking) for final/high-risk release |

## Escalation triggers

Escalate from Tier 2 to Tier 1 when any of these are present:

- repeated QA failure;
- schema/migration impact;
- tenant isolation risk;
- auth/session/permission changes;
- cross-module business rules;
- critical performance risk;
- major refactor;
- complex business logic with ambiguous acceptance criteria;
- security-sensitive behavior or secret/config risk;
- contradictory contracts or unclear ownership.

Escalation must include the smallest evidence bundle: failing command, relevant
contract/test-matrix row, changed files, and the specific decision needed. Do
not escalate by asking the Tier 1 agent to read the full repository.

## Specialist triggers

Use extra review only when relevant:

- Security: auth, permissions, tenant isolation, secrets, impersonation.
- Database: schema, migration, indexes, tenant-owned data.
- Integration: external API, webhook, background job.
- Performance: large lists, reporting, expensive queries, high-volume API.
