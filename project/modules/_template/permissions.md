# Permissions

Permission source for <module-name>. Use this file for backend authorization,
frontend visibility, QA checks and review evidence.

## Naming convention

Use lowercase dot-separated permissions:

```text
<module>.<resource>.<action>
```

Examples for replacement:

```text
<module-name>.resource.read
<module-name>.resource.create
<module-name>.resource.update
<module-name>.resource.delete
```

Platform permissions use `platform.*`; tenant administration permissions use
`tenant.*`. See `docs/RBAC.md`.

## Permission matrix

| Permission | Role(s) | API usage | UI usage | Test coverage |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | `test-matrix.md` |

## Access rules

- Backend authorization is mandatory.
- Frontend permission checks are UX hints and must not replace backend checks.
- Tenant-owned data requires both tenant context and permission checks.
- SuperAdmin behavior must be explicit and audited when supported.
- Impersonation must follow `docs/TENANCY.md` and `docs/RBAC.md`.

## Forbidden and edge cases

| Case | Expected behavior | Evidence |
|---|---|---|
| Missing session | 401 | `test-matrix.md` |
| Missing permission | 403 | `test-matrix.md` |
| Wrong tenant | 403 or 404 per `api.contract.md` | `test-matrix.md` |

## Verification checklist

- [ ] Every API endpoint maps to a permission.
- [ ] Every protected UI action maps to a permission.
- [ ] Forbidden states are represented in `ui.contract.md`.
- [ ] QA has negative test cases.
