# Database Standard

## Default Model

Default SaaS model: tek shared DB + her tenant-owned tabloda `tenant_id`.

## Required Common Tables

- `tenants`
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
