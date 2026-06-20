# ENVIRONMENT.md

## Local Değişkenler

`.env.example` gerçek secret içermez. Agent `.env` dosyasını okuyamaz veya ekrana basamaz.

## DB Konfigürasyonu

- `DATABASE_URL`: shared default DB.
- `PLATFORM_DATABASE_URL`: platform metadata alanı aynı DB içinde ayrı schema veya ayrı logical connection olabilir.
- `TENANCY_DEFAULT_DB_MODE=shared`: local varsayılan.
- `TENANCY_DEDICATED_ENABLED=false`: localde dedicated akış kapalı olabilir.
- `SECRETS_PROVIDER=local|aws|gcp|azure`.

## Dedicated Tenant Konfigürasyonu

Dedicated connection bilgisi app config'e hard-code edilmez. Platform DB `connection_ref` tutar; gerçek secret secret manager'dan çözülür.
