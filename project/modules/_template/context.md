# Module Context

Compact context capsule for <module-name>. Keep this file to 20-40 bullets and
update it whenever contracts or scope change.

## Module summary

- Purpose: TBD
- Current phase: planned / contract / backend / frontend / qa / review / done
- Primary actors: TBD
- Data ownership: tenant-owned / platform-owned / mixed / none

## Current scope

- In scope: TBD
- Out of scope: TBD
- Acceptance anchor: `MODULE.md`

## Backend context

- API source: `api.contract.md`
- DTO source: `dto.md`
- Data source: `data-model.md`
- Permission source: `permissions.md`
- Backend-owned paths: see `MODULE.md`
- Backend must not read frontend implementation unless explicitly authorized.

## Frontend context

- UI source: `ui.contract.md`
- API/DTO source: `api.contract.md` and `dto.md`
- Permission source: `permissions.md`
- Frontend-owned paths: see `MODULE.md`
- Frontend must not read backend implementation unless explicitly authorized.

## Data context

- Prisma-impacting changes are owned by Data Engineer.
- Tenant-owned entities require `tenantId`, `createdAt`, `updatedAt`, tenant-safe indexes and tenant-scoped uniqueness.
- Dedicated instance behavior must follow `docs/TENANCY.md`.

## QA/review context

- Test source: `test-matrix.md`
- Handoff source: `handoff.md`
- QA and Reviewer validate changed files listed in handoff DTO only.
- QA and Reviewer must not implement fixes.

## Current risks

- TBD

## Do not read unless needed

- Unrelated modules.
- Opposite-side implementation code.
- Historical work-order markdown.
- Broad standards docs not referenced by the active work order, module contract or failing validator.
