# Code Review Quality Bar

The Code Reviewer is the final quality gate. Review must be strict, concise, and evidence-based.

## Review decision values

Use one of:

```text
PASS
PASS_WITH_WARNINGS
FAIL
```

A feature must not be released unless QA evidence exists and review is `PASS` or explicitly accepted `PASS_WITH_WARNINGS`.

## Blocking review criteria

Fail the review if any of these are true:

- Contract behavior changed without updating/re-validating `api.contract.md` or `ui.contract.md`.
- Public DTOs or data structures are duplicated outside `packages/contracts/`.
- Backend imports frontend or frontend imports backend.
- Tenant isolation is unclear or bypassable.
- Schema changes bypass Data Engineer ownership.
- Tests do not map to `test-matrix.md` acceptance criteria.
- Frontend violates design system rules.
- QA failed or evidence is missing.
- The implementation uses broad full-repo context instead of the lazy context protocol.

## Craftsmanship review rubric

Reviewers must evaluate:

| Area | Questions |
|---|---|
| Responsibility boundaries | Is business logic in the correct layer? Are controllers/pages thin enough? |
| SOLID / coupling | Are dependencies narrow? Are abstractions justified? |
| Simplicity | Is there unnecessary pattern use or speculative abstraction? |
| Duplication | Is logic or DTO shape repeated across modules/apps? |
| Error handling | Are errors stable, typed, and contract-compatible? |
| Tenant/security | Are tenant filters, permissions, audit and impersonation handled? |
| Test quality | Are negative, permission and edge cases covered? |
| UI quality | Does UI follow design system, accessibility, and state requirements? |
| Performance | Are pagination, N+1 and index risks considered? |

## Overengineering detection

Flag code when it adds:

- factories without complex creation,
- strategies with only one implementation and no visible variation,
- generic base classes hiding concrete behavior,
- unnecessary global state,
- duplicated wrapper layers without testability benefit.

## Review output format

Write a compact review note in `handoff.md`:

```text
Decision: PASS | PASS_WITH_WARNINGS | FAIL
Contracts: pass/fail
Tests: pass/fail
Security/tenant isolation: pass/fail
Craftsmanship: pass/fail
Design system: pass/fail or n/a
Blocking issues: <short list>
Required owner: <agent>
```

If the decision is `FAIL`, do not fix the code. Route back through `project/work-orders/bugfix.md` and `state.json.validation_errors`.
