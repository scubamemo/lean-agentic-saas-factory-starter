# Feature Contract Standard

Each module keeps these essential contracts:

- `api.contract.md` for endpoints and request/response behavior.
- `dto.md` for shared payload shapes.
- `data-model.md` for entities, persistence and tenant ownership.
- `permissions.md` for role/permission behavior.
- `ui.contract.md` for page states and user actions.
- `test-matrix.md` for acceptance criteria to test mapping.

Only add extra contracts when the module truly needs them.
