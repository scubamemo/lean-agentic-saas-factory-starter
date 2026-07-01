# Agentic SaaS Factory Starter

Google Antigravity tarzı ajanlar ve diğer çok ajanlı kodlama araçları için
optimize edilmiş, genel amaçlı ve tekrar kullanılabilir bir SaaS factory
starter.

Bu repository bir factory’dir; bitmiş bir iş uygulaması değildir. Bilerek
domain-neutral tutulur. Envanter, muhasebe, RFID, perakende, CRM, ERP veya
başka herhangi bir B2B SaaS alanı ileride proje girdisi olarak verilebilir;
fakat starter’ın kendisi bu varsayımları kodlamamalıdır.

Factory bilerek lean tutulur: AI token kullanımını azaltan ve kod kalitesini
artıran kontrolleri korur; gereksiz büyük registry, sidecar ve mikro-gate
sistemlerinden kaçınır.

## Çalışma modeli

- Tek kompakt proje bağlamı: `project/CONTEXT.md`
- Tek proje özeti: `project/PROJECT.md`
- Tek UI özeti: `project/UI.md`
- Tek modül haritası: `project/MODULES.md`
- Tek yetkili iş emri durumu: `project/work-orders/state.json`
- İnsan tarafından okunabilir ayna: `project/work-orders/active-work-order.md`
- Modül başına kompakt bağlam: `project/modules/<module>/context.md`
- Modül başına birleşik handoff kaydı: `project/modules/<module>/handoff.md`

## Bu factory nasıl çalışır?

Ajanlar `AGENTS.md` dosyasından başlar, sonra implementasyon okumadan önce
kompakt bağlamı ve kontratları yükler. Hedef her işi modül kapsamlı,
contract-first ve script-validated tutmaktır:

1. Proje girdileri `project/CONTEXT.md` içine özetlenir.
2. İşler `project/work-orders/state.json` içinde temsil edilir; owner, status,
   izinli path’ler ve quality gate’ler için source of truth budur.
3. `project/work-orders/active-work-order.md` insanlar için state’i aynalar ama
   `state.json` yerine geçmez.
4. Her modül kendi `context.md`, kontratlar, DTO’lar, data model, permissions,
   test matrix ve structured `handoff.md` dosyalarını taşır.
5. Backend ve frontend ajanları birbirlerinin implementasyonunu okuyup
   düzenlemek yerine kontratlar ve `packages/contracts` üzerinden çalışır.
6. `scripts/` içindeki validator’lar handoff veya release öncesinde
   deterministic gate sağlar.

Temel prensipler:

- Contract-first development: entegrasyon işinden önce kontratları güncelle veya doğrula.
- Script-first validation: geniş manuel inceleme yerine deterministic check’leri tercih et.
- `state.json` source of truth’tur: workflow state prose’dan çıkarılmaz.
- Varsayılan olarak full-repo scan yoktur: ajanlar yalnızca kompakt bağlamı,
  active work order’ı ve ilgili modül artifact’lerini okur.
- Module-scoped context: her modül kendi kompakt bağlamına ve kontrat setine sahiptir.
- Backend/frontend implementation isolation: her taraf kendi yetkili path’lerinde kalır.
- `packages/contracts`, executable shared shape ve schema’lar için ortak iletişim katmanıdır.
- QA doğrudan implementasyon fix’i yapmaz; evidence raporlar ve failure’ları route eder.
- Code reviewer fix implement etmez; finding raporlar ve owner’a route eder.
- Model routing cost-aware’dır: `.agents/model-routing.json`, ajanları default
  Tier 2 modellere ve Tier 1 escalation modellere map eder; rol adı tek başına
  pahalı modeli zorunlu kılmaz.

## Başlangıç

1. Node.js 22 kullan ve pinned package manager’ı etkinleştir: `corepack enable`.
2. `pnpm install --frozen-lockfile` çalıştır.
3. `START-HERE.md` dosyasını oku.
4. `project/PROJECT.md`, `project/UI.md` ve `project/MODULES.md` dosyalarını doldur.
5. Ajanların kompakt context ile başlayabilmesi için bunları `project/CONTEXT.md` içine özetle.
6. İlk modül için `project/modules/_template` şablonunu kullan.
7. `project/work-orders/state.json` dosyasını oluştur/güncelle, sonra
   `active-work-order.md` aynasını senkronize et.
8. `pnpm check:project` çalıştır.
9. Yalnızca work order’ın izin verdiği write path’leri içinde kod üret.

PDF/DOCX export’a uygun, teknik olmayan proje sahibi walkthrough’u için
`docs/walkthrough/README.md` dosyasına bak. Bu kullanıcı-facing dokümandır;
ajanlar için zorunlu operational context değildir.

Committed `pnpm-lock.yaml` zorunludur. CI ve lokal validasyon
`pnpm install --frozen-lockfile` kullanmalıdır; validator’lar tool’ları implicit
olarak indirmez.

## Yaygın komutlar

Bu starter, `packageManager` alanı üzerinden `pnpm@9.15.4` varsayar.
`corepack enable` ile etkinleştir, sonra `pnpm install --frozen-lockfile`
çalıştır.

Root-level automation komutları:

```bash
pnpm check:factory       # tam factory/template validation zinciri
pnpm check:task          # active work-order readiness check
pnpm check:project       # factory + task + backend/frontend package check’leri
pnpm check:dependencies  # dependency boundary validation
pnpm check:quality       # engineering quality gate validation
pnpm check:security      # offline secret/security scanner
pnpm new:module <name>   # project/modules/<name> ve eşleşen spec JSON oluşturur
pnpm new:work-order WO-0001 <module-name> full-stack
pnpm export:template     # temiz reusable project template export eder
pnpm export:tool-adapter # tool-specific adapter dosyalarını export eder
```

Root factory validator’ları plain Node script’leridir; dependency’ler
kurulduktan sonra `npm run check:factory` da çalışır. Project-wide check’ler
pnpm workspace/package komutlarını kullanır çünkü committed lockfile pnpm
tabanlıdır.

## Ana klasörler

```text
.agents/       Agent skills, rules ve workflows
project/       Project-specific application, UI, module ve work-order docs
docs/          Reusable engineering standards
factory/       Simple profiles, quality gates ve project instantiation guide
backend/       Domain-neutral backend skeleton
frontend/      Domain-neutral frontend skeleton
packages/      Shared contract ve support packages
scripts/       Minimal validation/export helpers
```

## Non-goals

- Domain-specific sample app yok.
- Büyük registry sistemi yok.
- Her log için mandatory JSON sidecar yok.
- Varsayılan olarak full repo scan yok.
- Varsayılan olarak frontend/backend implementation cross-reading yok.

## Lean artifact-driven cyclic workflow

Bu starter lean workflow’u korur ve structured DTO handoff’ları, directory RBAC
guardrail’ları, Prisma/schema ownership için Data Engineer rolünü, task
readiness check’leri, module/work-order generator’ları ve cyclic QA/review
feedback’i ekler.

## Artifact-driven loop

Varsayılan development zinciri:

```text
Plan -> Backend -> Frontend -> QA -> Code Reviewer
```

Her handoff yetkili `state.json`, active-work-order aynası, module
`handoff.md`, State Transition DTO ve ilgili kontratı güncellemelidir. QA
failure’ları `project/work-orders/bugfix.md` üzerinden desteklenen
`FAILED -> IN_PROGRESS` loop’unu kullanır ve işi original owner’a geri route
eder.
