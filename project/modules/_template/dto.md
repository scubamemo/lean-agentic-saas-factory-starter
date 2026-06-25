# DTO Contract

Define request, response and event shapes shared by backend and frontend. DTOs
must stay aligned with `api.contract.md`, `ui.contract.md`, and
`packages/contracts/` executable artifacts.

## Metadata

| Field | Value |
|---|---|
| Module | <module-name> |
| Status | draft |
| Contract version | 0.1.0 |
| Owner | Architect / Backend Developer |
| Last verified by | TBD |

## Rules

- DTO names use `<ModuleName>` placeholders until module generation replaces them.
- Public DTOs must not expose persistence-only fields.
- Tenant-owned DTOs may expose `tenantId` only when the API contract explicitly allows it.
- Date/time fields use ISO 8601 strings.
- Request and response shapes must be strict and versioned through contracts.
- `packages/contracts/` is the shared data/communication layer for executable
  public DTOs, schemas, events, permissions and generated API-client types.
- Backend and frontend agents must communicate through this file,
  `api.contract.md`, `ui.contract.md`, `permissions.md`, `data-model.md`, and
  `packages/contracts/`; not by reading each other's implementation.

## Public DTOs

Public DTOs are the only data structures backend and frontend may share for
this module. Internal persistence models and UI-only view models must not be
treated as public communication contracts.

## Shared shapes

```ts
export interface <ModuleName>Dto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface <ModuleName>ListResponse {
  items: <ModuleName>Dto[];
  page: number;
  pageSize: number;
  total: number;
}
```

## Request DTOs

| DTO | Purpose | Validation source | Notes |
|---|---|---|---|
| TBD | TBD | `api.contract.md` | TBD |

## Response DTOs

| DTO | Purpose | API usage | UI usage |
|---|---|---|---|
| `<ModuleName>Dto` | Public module record | response body | display/state |
| `<ModuleName>ListResponse` | Paginated list | list endpoint | list/table view |

## Mapping rules

- Backend maps persistence models to DTOs at API boundaries.
- Frontend consumes DTOs from contracts or generated clients.
- Do not duplicate business logic in DTO mapping.
- If executable DTOs exist in `packages/contracts/`, update or generate those
  first and keep this markdown as a compact mirror.

## Verification checklist

- [ ] DTOs match OpenAPI/JSON Schema.
- [ ] DTOs support UI states in `ui.contract.md`.
- [ ] DTOs avoid persistence-only leakage.
- [ ] DTO changes are reflected in `packages/contracts/` when executable artifacts exist.
