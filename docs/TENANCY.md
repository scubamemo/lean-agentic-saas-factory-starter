# TENANCY.md

## Karar

Ana model: **tek PostgreSQL database + `tenant_id` ile multi-tenant izolasyon**.

Bu karar eski “her tenant için kesin ayrı DB” varsayımının yerine geçer. Dedicated DB/app hâlâ desteklenen premium/enterprise opsiyondur, fakat default model değildir.

## Hedef Model

### 1. Shared Multi-Tenant Default

- Tüm standart tenant'lar aynı DB içinde yaşar.
- Operasyonel tenant tablolarında `tenant_id` zorunludur.
- Unique constraint'ler tenant bazında tanımlanır: ör. `UNIQUE(tenant_id, imei)`.
- Tenant isolation backend guard/repository/service seviyesinde zorunludur.
- Başka tenant'ın kaydı ID ile istenirse `404` döner; varlığını sızdırmaz.

### 2. Dedicated Premium Mode

Premium/enterprise müşteri için tenant `dedicated_db` veya `dedicated_app` moduna alınabilir.

- Modüller connection string bilmez.
- `backend/src/tenancy/tenant-connection.manager` tenant metadata'ya bakarak doğru datasource'u verir.
- Dedicated DB'ye taşınsa bile tenant tablolarında `tenant_id` kalır.
- Şema shared ve dedicated arasında aynı tutulur.
- Dedicated DB bilgisi secret manager referansı ile tutulur; düz şifre tutulmaz.

## Tenant Metadata

Platform tabloları minimum şu alanları desteklemelidir:

| Alan | Açıklama |
|---|---|
| `id` | Tenant UUID |
| `slug` | Subdomain/context anahtarı |
| `status` | provisioning, active, suspended, archived |
| `plan_code` | free/basic/standard/pro/enterprise |
| `db_mode` | shared, dedicated_db, dedicated_app |
| `connection_ref` | shared ise null veya shared ref; dedicated ise secret ref |
| `region` | lokasyon/cluster tercihi |
| `features_json` | feature flag/paket yetkileri |

## Tenant Resolver Sırası

1. SuperAdmin seçili tenant context'i
2. Auth token içindeki tenant claim
3. Subdomain: `tenant.saasapp.com`
4. Local dev header: `x-tenant-slug`

## SuperAdmin ve Impersonation

- Sadece `superAdmin` yeni tenant oluşturabilir.
- SuperAdmin, destek amacıyla tenant kullanıcısı gibi test context'i açabilir.
- Impersonation her zaman audit log'a yazılır.
- Impersonation sırasında gerçek aktör ve hedef tenant/user birlikte kaydedilir.
- SuperAdmin'e özel yetenekler tenant admin rollerinden ayrı tutulur.

## Yasaklar

- Modül içinde doğrudan connection string kullanmak.
- Tenant context olmadan tenant operasyonu yapmak.
- Tenant'a özel tablo/kolon oluşturmak.
- Shared DB varsayımını business logic içine gömmek.
- Dedicated DB varsayımını business logic içine gömmek.
- SuperAdmin erişimini audit logsuz çalıştırmak.
