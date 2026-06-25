# Backend Engineering Quality Standard

This standard defines the backend quality bar for generated SaaS modules.

## Required read set

Backend agents should not scan the whole repository. Use:

```text
project/work-orders/state.json
project/CONTEXT.md
project/modules/<module>/context.md
project/modules/<module>/MODULE.md
project/modules/<module>/api.contract.md
project/modules/<module>/dto.md
project/modules/<module>/data-model.md
project/modules/<module>/permissions.md
project/modules/<module>/test-matrix.md
packages/contracts/
```

Read broader docs only when a script, work order, or failing check names them.

## Layering rules

Backend modules must keep these boundaries clear:

| Layer | Responsibility | Must not do |
|---|---|---|
| Controller / route | HTTP mapping, auth/permission guard binding, request/response boundary | Business decisions, persistence details, cross-module orchestration |
| Service / use case | Business workflow, validation orchestration, transaction boundary | Raw transport formatting, UI-specific behavior |
| Data access / repository | Persistence queries, tenant filters, indexes-aware access | Business rule decisions unrelated to persistence |
| Adapter | External systems and SDKs | Leaking SDK-specific types into contracts |
| Contract mapping | Convert internal persistence models to public DTOs | Invent DTOs outside `packages/contracts/` |

Controllers must not contain business logic. A controller may:

- bind route metadata, guards, and permission decorators;
- parse/validate transport inputs through approved DTO/schema mechanisms;
- pass actor, tenant, pagination, and request context into a service/use case;
- map service results to HTTP status codes and public response DTOs.

A controller must not:

- decide business eligibility, state transitions, pricing, limits, or workflow outcomes;
- perform Prisma/database queries;
- call external SDKs directly;
- build tenant filters manually outside the tenant context abstraction;
- duplicate service validation in ad-hoc branches.

Services/use cases own business decisions and transaction boundaries. Data
access/repository modules own persistence details, query shape, tenant filters,
and indexes-aware access. Keep these seams explicit so behavior can be tested
without booting the full app.

## Multi-tenant safety

For tenant-owned data:

- every query must include tenant context,
- list endpoints must return only the current tenant's data,
- direct ID lookup must also include tenant scope,
- unique constraints for business identifiers must be tenant-scoped,
- persisted entities must include `tenantId`, `createdAt`, and `updatedAt`,
- superAdmin/impersonation must be auditable,
- cross-tenant access must return the behavior defined in `api.contract.md`.

If tenant ownership is unclear, stop and route to Architect/Data Engineer before implementation.

## Contract-first backend development

Public request, response, event, and permission shapes must originate from:

```text
packages/contracts/
project/modules/<module>/api.contract.md
project/modules/<module>/dto.md
project/modules/<module>/permissions.md
```

Backend code may map persistence models into public contract DTOs, but it must not hand-write duplicate public DTOs inside feature modules.

## Validation and error handling

Every endpoint must define:

- input validation behavior,
- stable error code names,
- permission failures,
- tenant access failures,
- not-found behavior,
- conflict behavior when applicable.

Do not expose raw database, Prisma, validation-library, or SDK errors directly to API consumers.

### Stable error taxonomy

Backend APIs must use stable, contract-visible error codes. Prefer a small
taxonomy that can be mapped consistently by frontend, QA, and integrations:

| Category | Example code shape | Typical HTTP behavior |
|---|---|---|
| Validation | `VALIDATION_FAILED` | 400 |
| Authentication | `AUTH_REQUIRED` | 401 |
| Authorization | `PERMISSION_DENIED` | 403 |
| Tenant isolation | `TENANT_ACCESS_DENIED` | 403 or 404 as defined by contract |
| Not found | `RESOURCE_NOT_FOUND` | 404 |
| Conflict | `RESOURCE_CONFLICT` | 409 |
| Rate/limit | `LIMIT_EXCEEDED` | 429 |
| External dependency | `DEPENDENCY_UNAVAILABLE` | 502/503 |
| Unexpected | `INTERNAL_ERROR` | 500 |

Do not invent one-off string errors inside controllers or services. If a new
error code is required, update `api.contract.md`, tests, and handoff evidence.

### DTO validation

DTO validation must happen before business logic runs.

- Public request/response DTO shapes come from `packages/contracts/` and module
  `dto.md`/`api.contract.md`.
- Runtime validation must reject unknown or invalid public inputs according to
  the contract.
- Validation errors must return stable error codes and field-level details when
  the contract requires them.
- Internal persistence models must not leak as public response DTOs.

## Transaction and consistency rules

Use explicit transaction boundaries when a use case writes multiple related records or emits side effects that require consistency.

Document in `handoff.md` when:

- a transaction was added,
- idempotency is required,
- an operation may be retried,
- an external integration can partially fail.

### Idempotency

Use idempotency when a write operation may be retried by clients, queues,
webhooks, or external integrations. Document the idempotency key source,
deduplication window, conflict behavior, and retry-safe response in
`api.contract.md` and `handoff.md`.

Do not add idempotency infrastructure to simple non-retried CRUD writes unless
the contract or integration behavior requires it.

## Performance rules

- List endpoints require pagination.
- Filtering/sorting behavior must be contract-defined.
- Avoid N+1 query patterns.
- Add indexes through Data Engineer when query patterns require them.
- Avoid raw SQL unless Data Engineer approves and documents safety.

### Pagination, filter, and sort standard

Every list endpoint must define:

- pagination mode and limits;
- default page size and maximum page size;
- allowed filter fields and operators;
- allowed sort fields and default sort;
- stable ordering for pagination;
- tenant scoping behavior;
- empty-state response shape.

Filtering and sorting must be implemented in data access, not controllers.
Unbounded list endpoints are not allowed.

### Raw query restrictions

Raw SQL/query APIs are restricted. They require Data Engineer approval and must:

- use parameterized inputs only;
- include tenant scope for tenant-owned data;
- document selected columns and result shape;
- explain why typed ORM/query-builder access is insufficient;
- include tests for permission and tenant isolation behavior;
- include index/performance notes for expected data volume.

### Audit logging

Audit logging is required for security-sensitive or tenant-sensitive actions,
including permission changes, tenant administration, superAdmin actions,
impersonation, destructive writes, high-risk config changes, and external
integration side effects. Audit records must include actor, tenant context,
action, target, timestamp, outcome, and correlation/request identifier when
available. Do not log secrets or full sensitive payloads.

### Performance guardrails

Backend work must avoid:

- loading unbounded result sets;
- per-row external calls or N+1 database reads;
- synchronous long-running work in request/response paths when a queued flow is required;
- cross-tenant scans for tenant-scoped endpoints;
- adding indexes or denormalization without Data Engineer review;
- expensive computation in controllers.

If expected data volume or query pattern is unclear, route to Architect/Data
Engineer before implementation.

## Design pattern guidance

Patterns are tools, not decorations.

Use:

- Adapter for external systems, SDKs, storage providers, email, payment, AI, or
  other volatile dependencies.
- Strategy for visible business variation already present in the contract or
  active requirements.
- Factory for complex creation that combines validation, defaults,
  normalization, or multiple collaborating objects.
- Repository/data-access service when it reduces coupling to persistence,
  centralizes tenant filters, or makes query behavior testable.

Avoid:

- a pattern for simple CRUD unless justified in `handoff.md`;
- strategies with one implementation and no visible variation;
- factories that only call a constructor or spread a DTO;
- generic base services that hide concrete business rules;
- repositories that merely rename one ORM call without improving boundaries.

Every introduced pattern must name the current problem it solves: coupling,
volatility, testability, transaction safety, or visible business variation.

## Backend testing expectations

For each backend behavior, update `test-matrix.md` with evidence for applicable cases:

```text
happy path
validation error
permission denied
tenant isolation
not found
conflict / duplicate
pagination/filter/sort
side-effect/audit behavior
```

## Maintainability checks before handoff

Before handoff, verify the implementation against the compact craftsmanship
bar instead of reading broad historical docs:

- SOLID: controllers, services, adapters, and data access each have one clear reason to change.
- DRY: business rules and public DTO shapes are not duplicated across modules or apps.
- KISS: the implementation uses direct control flow unless complexity is required by the contract.
- YAGNI: no factories, strategies, queues, providers, events, or base classes exist only for imagined future features.
- High cohesion / low coupling: module internals stay together and external communication uses contracts.
- Typed interfaces: public request/response/event shapes come from `packages/contracts/`.
- Testability: business decisions can be tested without booting unrelated systems.
- Observability: stable error codes and audit-relevant behavior are visible to QA and operators.

## Backend handoff quality

Before handoff, run script-first checks and record the result in `handoff.md`:

```bash
node scripts/factory-check.mjs
node scripts/check-contract-artifacts.mjs
node scripts/check-dto.mjs
node scripts/check-dependencies.mjs
node scripts/check-quality-gates.mjs
```

A backend handoff without contract update/re-validation, test matrix evidence, and tenant-isolation notes is incomplete.
