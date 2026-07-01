# Common Feature Patterns

Use this compact pattern library only when the active work order needs guidance. Do not read it by default.

## CRUD module

Use for a tenant-owned resource with list/detail/create/update/delete.

Required contracts:

- `api.contract.md`
- `dto.md`
- `data-model.md`
- `permissions.md`
- `ui.contract.md`
- `test-matrix.md`

Quality notes:

- list endpoints must paginate,
- tenant-owned queries must filter by tenant context,
- tenant-owned persisted entities must include `tenantId`, `createdAt`, and `updatedAt`,
- destructive actions require confirmation,
- UI must define loading, empty, error, forbidden, and success states.

## Dashboard

Use for summary pages and analytics-style UI.

Quality notes:

- define data freshness,
- define empty/loading/error states,
- avoid expensive unbounded queries,
- prefer pre-aggregated or paginated data when needed.

## Settings page

Use for tenant/platform configuration.

Quality notes:

- define permission requirements,
- validate partial updates,
- audit sensitive changes,
- document default values.

## Import/export

Use for CSV/XLSX/API batch movement.

Quality notes:

- validate file size and row count,
- isolate tenant data,
- define background job behavior when long-running,
- document error report format.

## Approval flow

Use for submit/review/approve/reject workflows.

Quality notes:

- define states and transitions,
- define actor permissions,
- define audit events,
- ensure invalid transitions return deterministic errors.

## Notification

Use for in-app/email/webhook notifications.

Quality notes:

- define trigger events,
- define idempotency,
- define retry behavior,
- avoid leaking cross-tenant data.

## External integration

Use for third-party APIs and webhooks.

Quality notes:

- define auth method,
- rate limits,
- retries,
- idempotency keys,
- mapping rules,
- failure logging.

## Report page

Use for filterable, exportable reports.

Quality notes:

- define date range limits,
- pagination or async export,
- indexes for filters,
- permission visibility.
