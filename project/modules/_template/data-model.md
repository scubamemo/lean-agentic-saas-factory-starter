# Data Model Contract

Persistence contract for <module-name>. Data Engineer owns Prisma-impacting
changes.

## Module

<module-name>

## Ownership

Data model changes that affect `backend/prisma/schema.prisma` are owned by the
Data Engineer role. Backend and Frontend developers must route schema changes
instead of editing Prisma directly.

## Entities

| Entity | Ownership | Purpose | Required fields | Notes |
|---|---|---|---|---|
| TBD | tenant-owned / platform-owned / mixed | TBD | TBD | TBD |

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

| From | To | Cardinality | Delete behavior | Notes |
|---|---|---|---|---|
| TBD | TBD | one-to-one / one-to-many / many-to-many | restrict / cascade / set-null | TBD |

## Indexes

| Index | Query supported | Required | Notes |
|---|---|---|---|
| TBD | TBD | yes/no | TBD |

## Uniqueness

Tenant-owned business uniqueness must be tenant-scoped.

Example:

```text
unique(tenantId, slug)
unique(tenantId, externalId)
```

## Migration notes

Document whether the change is additive, destructive, requires backfill, or
requires backup/rollback.

| Change | Migration risk | Rollback | Approval required |
|---|---|---|---|
| TBD | low / medium / high | TBD | yes/no |

## Prisma Guard

No destructive schema migration without:

- backup strategy,
- rollback strategy,
- affected tenants,
- validation query,
- downtime/online migration note,
- explicit human approval.

## Verification checklist

- [ ] Ownership is explicit for every entity.
- [ ] Tenant-owned entities include `tenantId`, `createdAt`, `updatedAt`.
- [ ] Indexes support expected queries.
- [ ] Unique constraints are tenant-scoped when required.
- [ ] Migration and rollback notes are present.
