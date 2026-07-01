# Agent Routing

Run only the agent needed for the active work order. Do not run the whole agent set by default.

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

## Specialist triggers

Use extra review only when relevant:

- Security: auth, permissions, tenant isolation, secrets, impersonation.
- Database: schema, migration, indexes, tenant-owned data.
- Integration: external API, webhook, background job.
- Performance: large lists, reporting, expensive queries, high-volume API.
