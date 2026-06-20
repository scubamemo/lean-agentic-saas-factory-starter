# Architecture

Bu doküman domain-bağımsız SaaS mimari kararlarını tanımlar.

## Default Architecture

- Frontend: web application.
- Backend: API application.
- Database: relational database.
- Auth: role/permission based access control.
- Tenancy: shared database + `tenant_id` by default.
- Premium/enterprise: dedicated database or dedicated app instance can be provisioned.

## Logical Layers

- Presentation/UI
- API/controllers/routes
- Application services/use-cases
- Domain logic
- Data access/repositories
- Integration adapters
- Observability/audit

## Module Boundary Rule

Her modül kendi public contract'ı ile konuşur. Başka modülün internal implementation'ı doğrudan kullanılmaz.

## Agent Boundary Rule

Agent'lar başka agent'ın implementation alanını okumaz. Gerekirse escalation ile sınırlı dosya erişimi açılır ve handoff log'a yazılır.
