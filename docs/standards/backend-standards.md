# Backend Standards

- Tenant-owned data must be filtered by tenant context.
- API errors use stable error codes.
- Pagination is required for lists.
- Migrations must document destructive changes and backfill needs.
- SuperAdmin/impersonation actions must be auditable.

## Contract source of truth

`packages/contracts/` is the mandatory source of truth for public data models, DTOs, API schemas, event payloads and communication contracts.

Backend modules must not duplicate business logic or public data structures outside `packages/contracts/`. Persistence models, Prisma entities and internal service state may exist in backend code, but every public request/response/event shape must be imported from, generated from, or explicitly synchronized with `packages/contracts/` and the module `api.contract.md`.

Backend implementation must be contract-first:

```text
project/modules/<module>/api.contract.md
project/modules/<module>/dto.md
project/modules/<module>/data-model.md
project/modules/<module>/permissions.md
packages/contracts/
```

Backend agents must not inspect frontend implementation to infer UI
requirements, request/response needs or permission behavior. If frontend
requirements are missing, route to Architect/Designer through `handoff.md`.

Forbidden backend patterns:

- defining public DTO classes/interfaces in feature modules when the same shape belongs in `packages/contracts/`,
- importing frontend code or frontend-only types,
- bypassing `api.contract.md` when changing endpoint behavior,
- reading frontend implementation to discover contract requirements,
- changing `backend/prisma/schema.prisma` without validating module `data-model.md`, `dto.md` and `api.contract.md`.

Required backend workflow:

1. Read `project/work-orders/state.json` and target module artifacts.
2. Validate the API contract before implementation.
3. Consume shared DTOs/types from `packages/contracts/` where they exist.
4. Update `api.contract.md`, `dto.md`, `data-model.md` and `handoff.md` when behavior changes.
5. Run `node scripts/factory-check.mjs` before handoff.


## Strict SoC and dependency boundaries

No business logic or data structures should be duplicated outside of `packages/contracts/` when they are part of public communication between agents, backend, frontend or integrations.

Backend modules must not import frontend code. Backend module-to-module communication must not rely on direct internal imports for public data contracts; extract shared public shapes to `packages/contracts/` and expose behavior through documented APIs/events.

Backend SoC rules:

- Backend must not import from `frontend/`.
- Backend must not consume frontend-only types, components, mocks or test helpers.
- Backend/frontend shared request, response, event and permission structures must come from `packages/contracts/` or generated `packages/api-client/` outputs.
- Direct backend feature-to-feature imports are discouraged. If unavoidable, the Architect must approve the exact import and the public contract must still live in `packages/contracts/`.
- Backend must not rely on `packages/shared/` as a public domain-contract layer.

Before handoff, backend-impacting work must run:

```bash
node scripts/factory-check.mjs
node scripts/check-dependencies.mjs
```


## Engineering quality bar

Backend code must satisfy the project craftsmanship standards in:

```text
docs/standards/software-craftsmanship.md
docs/standards/backend-engineering-quality.md
docs/standards/testing-quality-bar.md
```

Required backend quality rules:

- Controllers/routes stay thin and transport-focused.
- Controllers/routes must not contain business logic, persistence queries, SDK calls or tenant filter construction.
- Business use cases live in services/use-case handlers.
- Data access and persistence details are isolated from HTTP boundaries.
- Public DTOs and communication schemas come from `packages/contracts/` or module contract artifacts.
- Tenant-owned queries must carry tenant context.
- DTO validation must happen before service/use-case business logic runs.
- API errors must use a stable error taxonomy documented in `api.contract.md`.
- Transaction boundaries, retry behavior and idempotency requirements must be explicit for multi-write or integration workflows.
- Pagination, filter and sort behavior must be contract-defined for every list endpoint.
- Raw SQL, schema changes, index changes and migration risk route to Data Engineer.
- Audit logging is required for superAdmin, impersonation, permission, destructive, tenant-sensitive and high-risk config actions.
- Performance guardrails must prevent unbounded lists, N+1 reads, cross-tenant scans and synchronous long-running request paths.
- Pattern use must be justified by real variation, volatility or testability needs.
- Use adapters for external systems, strategies for visible business variation, factories for complex creation, and repository/data-access only when it reduces coupling or centralizes tenant-safe persistence.
- Do not add a pattern for simple CRUD unless the current work order justifies it.
- Every behavior change updates/re-validates `api.contract.md` and `test-matrix.md`.

Before backend handoff, also run:

```bash
node scripts/check-quality-gates.mjs
```


## Standardized JSON contract source of truth

Backend implementation must treat `packages/contracts/specs/<module>.spec.json` as the executable source of truth for public API behavior and data shapes. `api.contract.md` is a human-readable mirror.

Before backend handoff:

```bash
node scripts/check-spec-kit-contracts.mjs
node scripts/security-scanner.mjs
```

If the backend implementation declares routes that do not match the JSON spec, update the JSON spec first or fix the implementation. Do not duplicate public DTOs, schemas, permission constants or event payloads outside `packages/contracts/`.
