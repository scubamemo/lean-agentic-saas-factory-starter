# RBAC Standard

RBAC must remain tenant-aware and domain-neutral. Roles define who can act;
permissions define what action is allowed.

## Canonical roles

### superAdmin

Platform-level role. It is not scoped to one tenant.

Capabilities:

- create tenants;
- manage tenant lifecycle and routing metadata;
- assign or revoke platform support access;
- start and stop tenant impersonation;
- inspect audit evidence needed for support and compliance.

Tenant creation is SuperAdmin-only.

### tenantAdmin

Tenant-scoped administrator for one tenant organization.

Capabilities:

- manage users inside the tenant;
- assign tenant roles according to project policy;
- manage tenant settings;
- view tenant-scoped audit/configuration evidence when permitted.

Tenant admins cannot create platform tenants or bypass tenant isolation.

### tenantUser

Tenant-scoped application user.

Capabilities:

- use assigned module features;
- read or write tenant-owned data only through explicit permissions;
- never access another tenant's data.

## Permission naming convention

Use lowercase dot-separated permission names:

```text
<module>.<resource>.<action>
```

Examples:

```text
module.resource.read
module.resource.create
module.resource.update
module.resource.delete
module.report.export
tenant.settings.manage
tenant.users.manage
platform.tenants.create
platform.tenants.update
platform.impersonation.start
platform.impersonation.stop
```

Guidance:

- Use `platform.*` for SuperAdmin-only capabilities.
- Use `tenant.*` for tenant administration capabilities.
- Use `<module>.<resource>.<action>` for module permissions.
- Prefer explicit permissions over broad role checks in implementation.

## SuperAdmin-only tenant creation

Tenant creation must require a SuperAdmin capability such as:

```text
platform.tenants.create
```

Tenant creation must create or initialize the platform tenant metadata needed
for the configured tenancy mode. If the tenant is dedicated, provisioning must
store only a connection reference or deployment reference, not raw secrets.

## Impersonation authorization

Impersonation must require explicit SuperAdmin permissions:

```text
platform.impersonation.start
platform.impersonation.stop
```

Impersonation must:

- be deliberately started by the SuperAdmin;
- identify the real actor and the effective tenant context;
- be visible in the UI/session;
- write audit events for start and stop;
- preserve tenant isolation for the effective tenant;
- avoid granting platform-only privileges to the impersonated tenant user.

## Implementation expectations

- Backend authorization is mandatory; frontend checks are only UX hints.
- Tenant context and permission checks must both pass for tenant-owned data.
- Permission changes are audit-worthy.
- QA must include forbidden and cross-tenant cases for modules with
  tenant-owned data.
