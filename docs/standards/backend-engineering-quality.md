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

## Multi-tenant safety

For tenant-owned data:

- every query must include tenant context,
- list endpoints must return only the current tenant's data,
- direct ID lookup must also include tenant scope,
- unique constraints for business identifiers must be tenant-scoped,
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

## Transaction and consistency rules

Use explicit transaction boundaries when a use case writes multiple related records or emits side effects that require consistency.

Document in `handoff.md` when:

- a transaction was added,
- idempotency is required,
- an operation may be retried,
- an external integration can partially fail.

## Performance rules

- List endpoints require pagination.
- Filtering/sorting behavior must be contract-defined.
- Avoid N+1 query patterns.
- Add indexes through Data Engineer when query patterns require them.
- Avoid raw SQL unless Data Engineer approves and documents safety.

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
