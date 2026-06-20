# SECURITY.md

## Kesin Yasaklar

- `.env`, secret, token, private key içeriği okumak veya ekrana basmak.
- Production DB'ye bağlanmak.
- Onaysız `DROP`, `TRUNCATE`, toplu `DELETE` çalıştırmak.
- Testleri silerek build'i yeşile çevirmek.
- Hata gizleyen boş `catch` bloğu kullanmak.
- Güvenlik kontrolünü sadece frontend'de yapmak.
- İnternetten indirilen script'i doğrudan çalıştırmak.

## Tenant Güvenliği

- Her tenant operasyonunda tenant context zorunludur.
- Başka tenant kaydına erişim `404` gibi davranır.
- Tenant isolation testleri her modülün DoD parçasıdır.
- SuperAdmin impersonation audit logsuz yapılamaz.

## Veri Güvenliği

- Şifreler hash'li tutulur.
- TC, telefon, e-posta gibi PII loglanmaz veya maskelenir.
- Secret ref düz secret değildir.
- Audit log metadata'sı PII içermemelidir.

## Agent Güvenliği

Agent sadece görev kapsamındaki dosyalara erişmeli ve değişiklik öncesi etki alanını yazmalıdır. Onay gerektiren değişikliklerde kod yazmadan durmalıdır.
