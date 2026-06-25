# Tenancy Standard

This factory uses a shared-database multi-tenant model by default. Dedicated
database or dedicated application deployments are optional premium operating
modes selected by configuration and provisioning, not by changing module
business logic.

## Canonical default

The default model is:

```text
one PostgreSQL database + tenant_id isolation on every tenant-owned entity
```

Rules:

- Standard tenants share the same database.
- Every tenant-owned persisted entity uses a non-null `tenant_id`/`tenantId`.
- Tenant-owned entities include `createdAt` and `updatedAt`.
- Backend guards, services, repositories and raw queries must apply trusted
  tenant context.
- Cross-tenant reads must behave as not found, for example `404`, unless the
  caller is explicitly using a SuperAdmin capability.
- Tenant-per-database is not the default and must not be assumed by modules.

## Optional premium dedicated modes

Premium tenants may be provisioned into:

- `shared`: default shared database.
- `dedicated_db`: same application, tenant-specific database connection.
- `dedicated_app`: tenant-specific application deployment and database
  connection.

Dedicated modes are config-driven. Module code must not know connection strings
or branch on deployment topology. Dedicated tenants still keep `tenant_id` on
tenant-owned tables so shared and dedicated schemas remain compatible.

## Tenant context propagation

Tenant context is resolved once at the request/job boundary and then propagated
through trusted application services.

Recommended resolver order:

1. SuperAdmin selected tenant context for explicit support/impersonation flows.
2. Auth/session claim containing `tenantId`.
3. Host/subdomain routing when the project chooses that strategy.
4. Local development header such as `x-tenant-id` or `x-tenant-slug`.

Guidance:

- Do not accept arbitrary tenant IDs from request bodies for tenant-owned
  operations.
- Background jobs must carry an explicit trusted `tenantId`.
- Logs and audit events should include tenant ID when safe, but must not expose
  secrets or unnecessary personal data.

## Tenant-aware unique constraints

Tenant-owned uniqueness must normally be scoped by tenant:

```text
UNIQUE(tenant_id, resource_key)
UNIQUE(tenant_id, slug)
UNIQUE(tenant_id, external_ref)
```

Global uniqueness is reserved for platform-owned identifiers such as tenant
slug, platform user email when the project chooses global identity, or provider
IDs. Each module data contract must state whether a unique value is tenant-owned
or platform-owned.

## SuperAdmin role

`superAdmin` is a platform role, not a tenant role.

SuperAdmin can:

- create and manage tenants;
- suspend, archive or restore tenants according to project policy;
- inspect tenant metadata needed for support;
- start an explicit tenant impersonation flow;
- route or provision dedicated tenant instances.

SuperAdmin must not silently bypass audit requirements. Any cross-tenant action
must be authorized, scoped and auditable.

## Tenant impersonation flow

Impersonation exists for support and troubleshooting only.

Required flow:

1. SuperAdmin selects a target tenant and, when needed, a target tenant user.
2. The system records an impersonation start audit event.
3. The active session is visibly marked as impersonating.
4. All actions keep both actor identities:
   - real actor: the SuperAdmin;
   - effective actor: the tenant user/context being impersonated.
5. Sensitive writes may require extra confirmation or may be blocked by project
   policy.
6. The system records an impersonation stop audit event.

Audit events for impersonation must include tenant ID, real actor ID, effective
actor ID when present, action, timestamp, result and safe metadata.

## Audit logging

Audit logging is required for:

- tenant creation, suspension, archival and restoration;
- dedicated instance provisioning/routing changes;
- SuperAdmin cross-tenant access;
- impersonation start and stop;
- permission and role changes;
- security-sensitive configuration changes.

Audit metadata must avoid secrets and unnecessary personal data.

## Connection routing strategy

Connection routing belongs in a tenancy infrastructure service, not in feature
modules.

Recommended strategy:

1. Load tenant metadata from the platform database by tenant slug or ID.
2. Read `dbMode` and `connectionRef`.
3. For `shared`, use `DATABASE_URL`.
4. For `dedicated_db` or `dedicated_app`, resolve `connectionRef` through a
   secret manager or deployment configuration.
5. Cache resolved connection metadata safely with invalidation on tenant
   routing changes.

Feature modules receive a tenant-scoped data access boundary and do not choose
the datasource directly.

## Config and environment strategy

Baseline environment:

```text
DATABASE_URL
TENANCY_MODE=shared
```

Future dedicated support may add:

```text
TENANCY_MODE=shared|dedicated_db|dedicated_app
TENANT_CONNECTION_RESOLVER=static|secret-manager|control-plane
TENANT_DATABASE_URL_<TENANT_KEY>
TENANT_APP_BASE_URL_<TENANT_KEY>
```

Production deployments should prefer secret references over raw tenant database
URLs in committed configuration. `connectionRef` stores a reference, not a
secret value.

## Module contract requirements

Every module that persists tenant-owned data must document:

- whether each entity is tenant-owned, platform-owned or mixed;
- `tenant_id`/`tenantId` placement;
- tenant-aware indexes and unique constraints;
- `createdAt` and `updatedAt`;
- tenant isolation tests;
- migration and rollback notes when persistence changes.
