# Buradan Başla

Bu dosyayı yeni bir SaaS projesi için ilk context dosyası olarak kullan.

## Zorunlu proje girdileri

Kod üretiminden önce şu dosyaları doldur:

```text
project/PROJECT.md      Uygulama, kullanıcılar, kapsam, mimari ve profil
project/UI.md           UI yönü, route’lar, layout, Design System ve component kuralları
project/MODULES.md      Planlanan modüller ve öncelikler
project/CONTEXT.md      Ajanların kullandığı kompakt proje context’i
project/work-orders/state.json
project/work-orders/active-work-order.md
```

Perakende, muhasebe veya RFID gibi örnek B2B domain’leri yalnızca gerçek bir
proje onları seçtiğinde proje dokümanlarına aittir; factory kurallarına
gömülmemelidir.

## Antigravity için önerilen ilk prompt

```text
Read START-HERE.md, AGENTS.md, project/CONTEXT.md,
project/work-orders/state.json, its active-work-order mirror, and the target
module context/contracts. Do not scan the full repo. Use schema-valid handoff
payloads and State Transition DTOs for every handoff. If project/CONTEXT.md is
incomplete, read only the missing source file among project/PROJECT.md,
project/UI.md or project/MODULES.md. Follow the authorized paths and update
module handoff before ending.
```

İstersen aynı prompt’u Türkçe görev metniyle de verebilirsin; dosya adları ve
komutlar İngilizce kalmalıdır.

## Minimal development loop

1. PM `project/PROJECT.md` dosyasını doldurur veya refine eder.
2. Architect `project/MODULES.md` içinde modül sınırlarını tanımlar.
3. Architect/Designer `api.contract.md` ve `ui.contract.md` hazırlar.
4. PM/Architect mevcut proje gerçeklerini `project/CONTEXT.md` içine kompakt şekilde özetler.
5. Backend agent yalnızca backend path’lerinde implement eder ve API/data artifact’lerini günceller.
6. Frontend agent backend implementasyonunu değil, contract/handoff dosyalarını okur ve Design System’i takip eder.
7. QA `test-matrix.md` üzerinden doğrulama yapar.
8. Code Reviewer merge/release öncesi kalite ve handoff kontrolü yapar.

## Zorunlu autonomous loop

```text
Plan -> Backend -> Frontend -> QA -> Code Reviewer
```

QA veya Code Reviewer işi fail ederse:

```text
FAILED -> original owner -> IN_PROGRESS -> QA
```

QA ve Code Reviewer production implementasyonu fix etmez. Feedback payload ve
bugfix work order oluşturur.

## Kod yazmak yerine durup sorman gereken durumlar

Task aşağıdakilerden birini etkiliyorsa target module `handoff.md` içinde
blocker aç:

- tenant isolation,
- permissions,
- destructive migration,
- public API behavior,
- payment/billing,
- security-sensitive authentication/session behavior,
- unclear application behavior.

## Hızlı başlangıç yardımcıları

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm new:module <module-name>
pnpm new:work-order WO-0001 <module-name> backend-only
pnpm check:task
pnpm check:project
```

Implementasyon işleri için `.agents/workflows/cyclic-development.md` kullan.

## Türkçe kullanıcı notu

Teknik olmayan proje sahibi için daha açıklayıcı rehber:

```text
PROJECT-OWNER-README.md
docs/walkthrough/README.md
```

Bu iki dosya kullanıcı-facing dokümantasyondur. Agent source-of-truth yerine
geçmez; ajanlar operasyonel kurallar için `AGENTS.md`, `.agents/**`,
`project/work-orders/state.json` ve modül contract dosyalarını takip etmelidir.
