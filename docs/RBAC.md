# RBAC Standard

## Default Roles

- `SuperAdmin`: platform çapında yönetim, tenant oluşturma, impersonation ve support işlemleri.
- `TenantOwner`: kendi tenant'ını yönetir.
- `TenantAdmin`: kullanıcı, rol ve ayarları yönetir.
- `Member`: modül bazlı işlem yapar.
- `ReadOnly`: sadece okuma yetkisi.

## Permission Naming

Format:

`<module>.<resource>.<action>`

Örnek:

- `module.entity.read`
- `module.entity.create`
- `module.entity.update`
- `module.entity.delete`
- `module.report.export`

## SuperAdmin Impersonation

SuperAdmin tenant kullanıcısı gibi sistemi test edebilir. Bu işlem:

- explicit başlatılır,
- audit log'a yazılır,
- UI'da görünür olmalıdır,
- dangerous write işlemleri için ek onay isteyebilir.
