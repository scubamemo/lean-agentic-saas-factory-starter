# Factory Alignment Test Matrix

| Requirement ID | Acceptance criteria | Test type | Evidence/status |
|---|---|---|---|
| FACTORY-001 | `project.config.json.factoryVersion` matches root package version | validator | pass: `pnpm check:project` |
| FACTORY-002 | Frozen workspace installation succeeds from committed lockfile | integration | pass: `pnpm install --frozen-lockfile` |
| FACTORY-003 | Export resets workflow state and excludes maintenance artifacts without mutating source | integration | pass: `pnpm check:export` |
| FACTORY-004 | Backend and frontend have real smoke tests and do not allow zero-test success | unit | pass: backend Jest and frontend Vitest |
| FACTORY-005 | Backend and frontend production builds succeed | build | pass: `pnpm check:project` |
| FACTORY-006 | CI runs frozen install and the full project gate | configuration | pass: `.github/workflows/ci.yml` reviewed |

## Minimum checks

- Factory, DTO, contract, dependency, cache, quality, security, constitution,
  skill, handoff, untrusted-input, and export validators pass.
- Backend and frontend typecheck, lint, test, and build pass.
- QA independently re-runs the full project gate before approval.
