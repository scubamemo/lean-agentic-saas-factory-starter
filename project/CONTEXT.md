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
