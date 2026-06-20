# Project Context Capsule

Keep this file short. Agents should read this before the longer project documents.

## Product summary

TBD

## Current profile

- Profile: mvp
- Architecture profile: simple-saas
- Tenancy: shared database with tenant_id isolation
- Dedicated instance support: yes, via configuration/provisioning when needed

## Users and roles

- SuperAdmin: platform owner/support; can manage tenants and impersonate with audit.
- TenantAdmin: customer admin; manages tenant users/settings.
- User: tenant user; uses assigned features.

## UI direction summary

TBD

## Active modules

| Module | Status | Notes |
|---|---|---|
| TBD | planned | TBD |

## Global engineering constraints

- Backend/frontend implementation cross-reading is forbidden unless the work order explicitly allows it.
- Contract-first handoff is required for backend/frontend collaboration.
- Tenant-owned data must be protected by tenant context.
- Security, permissions, migrations and public API changes require explicit review notes in `handoff.md`.

## Open project questions

- TBD


## Structured handoff and cyclic workflow rules

- Use structured State Transition DTOs for agent handoffs.
- Follow `.agents/rules/guardrails.md` before writing files.
- Use Data Engineer for Prisma schema, tenant isolation and destructive migration review.
- Use cyclic feedback: QA/Reviewer report failures; original developer fixes.
- Keep `project/CONTEXT.md` and module `context.md` updated when project or contract decisions change.


## Artifact-driven autonomous loop

The active work order is the source of truth. Agents use task-focused MCP-compatible DTO handoffs and load only the target module context/contracts.

Default chain:

```text
Plan -> Backend -> Frontend -> QA -> Code Reviewer
```

Required artifacts:

```text
api.contract.md
ui.contract.md
dto.md
data-model.md
permissions.md
test-matrix.md
handoff.md
```

Frontend must follow the Tailwind/Shadcn-compatible Design System and may not create ad-hoc CSS.
