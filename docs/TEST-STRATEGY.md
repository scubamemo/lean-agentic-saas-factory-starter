# Test Strategy

## Test Levels

- Unit tests: domain/application logic.
- Integration tests: API + DB + auth/tenant isolation.
- Contract tests: backend/frontend contract uyumu.
- E2E smoke tests: kritik user journeys.
- Regression tests: public behavior değişmedi mi?

## Required Test Topics

Her modül için:

- tenant isolation
- permission checks
- validation errors
- happy path
- edge cases
- audit/event behavior
- public API compatibility

## Agent Rule

QA agent implementation değiştirmez. Test planı, test raporu, failing case ve kabul kriterlerini günceller.
