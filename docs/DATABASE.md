# Database Standard

The default SaaS data model is a single shared database with `tenant_id`
isolation on every tenant-owned table. Dedicated database/application modes are
optional premium deployment choices handled through configuration and
provisioning.

## Recommended baseline tables

These platform tables are recommended for real SaaS projects, but they are not
mandatory for every generated application. Keep the starter lean and add tables
only when the active work order and module contracts require them.

| Table/model | Ownership | Purpose | Timestamp rule |
|---|---|---|---|
| `Tenant` | platform-owned | Tenant metadata and routing anchor | `createdAt`, `updatedAt` |
| `User` | platform-owned or tenant-owned by project choice | Auth identity/profile anchor | `createdAt`, `updatedAt` |
| `Role` | tenant-owned for tenant roles; platform-owned for platform roles | Named role container | `createdAt`, `updatedAt` |
| `Permission` | platform-owned catalog | Permission definitions | `createdAt`, `updatedAt` |
| `UserRole` | tenant-owned when assigning tenant roles | User-to-role assignment | `createdAt`, `updatedAt` |
| `AuditLog` | mixed; includes tenant when applicable | Security and operational evidence | `createdAt`, `updatedAt` |
| `TenantSetting` | tenant-owned | Tenant-scoped configuration | `createdAt`, `updatedAt` |
| `FeatureFlag` | platform-owned or tenant-owned by project choice | Feature rollout and entitlement flags | `createdAt`, `updatedAt` |

## Tenant isolation rules

- Tenant-owned tables require non-null `tenant_id`/`tenantId`.
- Tenant-owned tables require `createdAt` and `updatedAt`.
- Tenant-owned queries must be constrained by trusted tenant context.
- Cross-tenant access is only allowed through explicit SuperAdmin platform
  capabilities and must be audited.
- Access to another tenant's entity by ID should behave as not found unless a
  SuperAdmin support flow explicitly authorizes the lookup.

## Tenant-aware indexes and constraints

Tenant-owned indexes and unique constraints should include tenant ID:

```text
INDEX(tenant_id)
UNIQUE(tenant_id, resource_key)
UNIQUE(tenant_id, slug)
```

Global unique constraints should be reserved for platform-owned values.

## Dedicated mode data strategy

Dedicated instances are config-driven:

```text
TENANCY_MODE=shared|dedicated_db|dedicated_app
DATABASE_URL
TENANT_CONNECTION_RESOLVER=static|secret-manager|control-plane
TENANT_DATABASE_URL_<TENANT_KEY>
```

`Tenant.connectionRef` stores a reference to a secret or deployment record. It
must not store raw credentials.

Dedicated tenant databases should keep the same schema shape as shared mode.
Tenant-owned tables still include `tenant_id` to preserve portability,
consistent code paths and backup/restore flexibility.

## Migration rule

Every persistence-affecting module contract must document:

- new or changed table/model;
- new or changed column/field;
- index or constraint changes;
- whether data is tenant-owned or platform-owned;
- `createdAt` and `updatedAt` behavior;
- migration risk;
- rollback note;
- tenant isolation test evidence.

## Starter Prisma baseline

The starter Prisma schema intentionally includes only the lean platform anchor
needed by the factory: `Tenant`.

`Tenant` carries the metadata required for shared mode and future dedicated
mode routing: `slug`, `status`, `planCode`, `dbMode`, `connectionRef`, `region`,
`featuresJson`, `createdAt`, and `updatedAt`.

Add `User`, `Role`, `Permission`, `UserRole`, `AuditLog`, `TenantSetting`,
`FeatureFlag`, and feature-specific tenant-owned entities when a real project
work order and module contract require them.
