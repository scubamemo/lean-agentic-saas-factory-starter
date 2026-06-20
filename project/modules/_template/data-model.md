# Data Model Contract

## Module

<module-name>

## Ownership

Data model changes that affect `backend/prisma/schema.prisma` are owned by the Data Engineer role.

## Entities

Describe tenant-owned and platform-owned entities.

### Tenant-owned entity requirements

Every tenant-owned entity must include:

```text
tenantId
createdAt
updatedAt
```

Recommended when relevant:

```text
createdById
updatedById
deletedAt
```

## Relationships

Document relations and ownership boundaries.

## Indexes

List expected query patterns and required indexes.

## Uniqueness

Tenant-owned business uniqueness must be tenant-scoped.

Example:

```text
unique(tenantId, slug)
unique(tenantId, externalId)
```

## Migration notes

Document whether the change is additive, destructive, requires backfill, or requires backup/rollback.

## Prisma Guard

No destructive schema migration without:

- backup strategy,
- rollback strategy,
- affected tenants,
- validation query,
- downtime/online migration note.
