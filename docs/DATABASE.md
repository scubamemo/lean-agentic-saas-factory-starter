# Database Standard

## Default Model

Default SaaS model: single shared DB + `tenant_id` on every tenant-owned table. Premium/dedicated modes are supported by configuration, not by changing the default development model.

## Recommended Common Tables

- `tenants` — present in the starter Prisma schema
- `users`
- `roles`
- `permissions`
- `user_roles`
- `audit_logs`
- `feature_flags`
- `tenant_settings`

## Tenant Isolation

- Tenant-owned tablolarda `tenant_id` zorunludur.
- Query'lerde tenant scope backend service layer tarafından uygulanır.
- Cross-tenant erişim sadece super admin capability ile explicit ve audit log'lu yapılır.

## Dedicated Mode

Premium/enterprise müşteriler için config üzerinden dedicated DB veya dedicated app instance desteklenir.

Önerilen config alanları:

- `TENANCY_MODE=shared|dedicated_db|dedicated_app`
- `DATABASE_URL`
- `TENANT_DATABASE_URL_<TENANT_KEY>` veya secret manager mapping.

## Migration Rule

Her feature contract'ında DB etkisi açıkça yazılır:

- yeni tablo
- yeni kolon
- index
- constraint
- migration risk
- rollback notu


## Starter Prisma Baseline

The starter keeps Prisma intentionally lean. `Tenant` is included as the platform anchor model with fields for shared/dedicated mode planning: `slug`, `status`, `planCode`, `dbMode`, `connectionRef`, `region`, `featuresJson`, `createdAt`, and `updatedAt`.

Add `User`, `Role`, `Permission`, `AuditLog`, `TenantSetting`, and feature-specific tenant-owned entities only when the active work order and module contracts require them.
