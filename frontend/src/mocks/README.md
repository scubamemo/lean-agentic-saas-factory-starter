# Frontend Mocks

Contract-backed mocks live here only when a project enables mock API development.

Suggested runtime shape:

```text
frontend/src/mocks/
  handlers/
  data/
  scenarios/
```

Mock scenarios are specified in `project/modules/<module>/ui.contract.md` under `Mock scenarios` and must match:

- `project/modules/<module>/dto.md`
- `project/modules/<module>/api.contract.md`
- `project/modules/<module>/permissions.md`

Do not create a separate mock-data contract file unless the active work order explicitly changes the lean module contract standard.
