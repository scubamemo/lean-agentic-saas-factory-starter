# TECHSTACK.md

## Kilitli Teknoloji Seçimi

### Backend

- Node.js 22 LTS
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis + BullMQ
- JWT + refresh token

### Frontend

- Next.js
- TypeScript
- React Hook Form + Zod
- TanStack Query veya REST client
- shadcn/ui veya sade component sistemi

### Altyapı

- Docker / Docker Compose
- GitHub Actions CI
- S3 uyumlu object storage
- Local `.env`; production'da secret manager
- Terraform/OpenTofu ileride opsiyonel

## Bilinçli Olarak Seçilmeyenler

- İlk MVP'de microservice yok.
- İlk MVP'de event sourcing yok.
- Kubernetes zorunlu değil.
- Tenant başına ayrı DB ana model değil; premium opsiyon olarak desteklenir.

## Değişiklik Kuralı

Bu dosya agent tarafından değiştirilemez. Stack değişikliği gerekiyorsa önce `docs/adr/` altında karar dokümanı önerilir ve kullanıcı onayı beklenir.
