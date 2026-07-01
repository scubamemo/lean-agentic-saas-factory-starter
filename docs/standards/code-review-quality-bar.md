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

- Architecture boundaries are violated or unclear.
- Contract behavior changed without updating/re-validating `api.contract.md` or `ui.contract.md`.
- Public DTOs or data structures are duplicated outside `packages/contracts/`.
- Backend imports frontend or frontend imports backend.
- Tenant isolation is unclear or bypassable.
- RBAC/permission behavior is missing, ambiguous, or inconsistent with `permissions.md`.
- Schema changes bypass Data Engineer ownership.
- Tests do not map to `test-matrix.md` acceptance criteria.
- Frontend violates design system rules.
- Accessibility requirements are missing for interactive UI.
- Dependency boundaries fail or are not evidenced.
- Secret scanner result is missing or failed.
- QA failed or evidence is missing.
- The implementation uses broad full-repo context instead of the lazy context protocol.

Reviewer cannot implement code. On any blocking issue, the reviewer records a
finding and routes it to the owner agent; the reviewer must not patch backend,
frontend, Prisma, contract package, or implementation files.

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

## Mandatory review checklist

The reviewer must check and record pass/fail/n/a for:

- architecture boundaries;
- contract alignment;
- `packages/contracts` usage for public DTOs, events, permissions and API shapes;
- tenant isolation;
- RBAC/permission behavior;
- test coverage against `test-matrix.md`;
- SOLID/craftsmanship;
- unnecessary abstraction;
- stable error handling;
- performance risk;
- frontend design-system compliance;
- accessibility;
- dependency boundaries from `node scripts/check-dependencies.mjs`;
- secret scanner result from `node scripts/security-scanner.mjs`.

Do not read the full repository unless explicitly escalated by the active work
order or a failing deterministic script. Start from the handoff DTO, changed
files, contracts, QA evidence and script output.

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
packages/contracts usage: pass/fail/n/a
Architecture boundaries: pass/fail
Tests: pass/fail
Security/tenant isolation: pass/fail
RBAC/permissions: pass/fail/n/a
Craftsmanship: pass/fail
Design system: pass/fail or n/a
Accessibility: pass/fail/n/a
Dependency boundaries: pass/fail
Secret scanner: pass/fail
Performance risk: pass/fail/n/a
Blocking issues: <short list>
Required owner: <agent>
```

If the decision is `FAIL`, do not fix the code. Route back through `project/work-orders/bugfix.md` and `state.json.validation_errors`.

## FAIL finding format

Every `FAIL` must include an actionable finding with:

```text
Issue: precise observed problem
Owner agent: backend-developer | frontend-developer | data-engineer | architect | designer | qa | pm
Required fix: specific change expected from owner
Related artifact: file path, contract section, test-matrix row, or script output
Suggested script to run: exact command
```

Vague findings such as "needs cleanup", "tests insufficient", or "check
security" are invalid. A failing review must make the next owner able to act
without reading the full repository.

## Lazy standard loading

Reviewer should not read all standards by default. Start with changed contracts,
changed files listed in the handoff DTO, QA evidence, and
`node scripts/check-quality-gates.mjs` output. Load only the short standard that
matches the concern:

- backend layering or tenant behavior -> `backend-engineering-quality.md`;
- frontend component, accessibility, or design-system behavior -> `frontend-engineering-quality.md`;
- test evidence or failure routing -> `testing-quality-bar.md`;
- SOLID/DRY/KISS/YAGNI or pattern concerns -> `software-craftsmanship.md`.
