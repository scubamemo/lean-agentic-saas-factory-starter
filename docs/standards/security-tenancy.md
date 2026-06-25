# Security and Tenancy Standard

Default tenancy is shared DB with `tenant_id`. Dedicated DB/app may be supported
for premium tenant organizations through configuration and provisioning.

SuperAdmin can manage tenants and impersonate for support only when actions are
audited and visibly marked.

Tenant-owned persisted entities must include tenant scope plus `createdAt` and
`updatedAt`. Use `docs/TENANCY.md`, `docs/RBAC.md`, and `docs/DATABASE.md` as
the canonical tenancy, role, and data-model references.
