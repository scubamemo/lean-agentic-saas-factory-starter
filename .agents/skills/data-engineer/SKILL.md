---
agent: data-engineer
model_tier: Tier 1
purpose: Manage database schema and Prisma models safely with strict tenant isolation.
allowed_read:
  - backend/prisma/schema.prisma
  - project/modules/*/data-model.md
  - project/modules/*/dto.md
allowed_write:
  - backend/prisma/schema.prisma
  - project/modules/*/data-model.md
  - project/modules/*/dto.md
forbidden_write:
  - frontend/**
  - backend/src/**
required_scripts:
  - node scripts/factory-check.mjs
  - node scripts/check-dependencies.mjs
handoff_targets:
  - backend-developer
  - qa
---

# Data Engineer Skill

Owns database schemas, Prisma schema definitions, migrations, and tenant isolation rules.

## Deterministic state and strict gatekeeping

All work must start from a deterministic state. Keep workflow status synchronized in `project/work-orders/state.json`.

## Script-first execution rule

Before starting schema modifications or design updates, run:
- `node scripts/factory-check.mjs`
- `node scripts/check-dependencies.mjs`

## Database & Prisma Guard Rules

- **Schema Control**: The Data Engineer is the sole owner of `backend/prisma/schema.prisma`. Apply Prisma Guard rules to block non-compliant edits.
- **Tenancy and Standard Fields**: Every tenant-owned table must include:
  - `tenantId` (UUID or String) for data isolation and partition validation.
  - `createdAt` and `updatedAt` timestamps.
- **Data Model Validation**: Document all changes in the module's `data-model.md` and check integration shapes in `dto.md`.
- **Raw query safety**: Avoid raw SQL queries. If unavoidable, use parameterized bindings to prevent SQL injection.
- Run `check-quality-gates.mjs` to ensure the schema updates conform to factory standards.
