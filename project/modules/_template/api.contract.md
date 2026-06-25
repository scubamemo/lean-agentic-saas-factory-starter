# API Contract

Backend/frontend integration must not start until this file and the primary
Spec-Kit JSON artifact are strict enough for implementation.

## Metadata

| Field | Value |
|---|---|
| Status | draft |
| Contract version | 0.1.0 |
| Owner | Architect / Backend Developer |
| Last verified by | TBD |

## Primary JSON Spec-Kit artifact

The executable source of truth for this module is:

```text
packages/contracts/specs/<module-name>.spec.json
```

This markdown file is a human-readable mirror. Agents must update the JSON spec first, then keep this markdown synchronized. Backend and frontend implementations must consume shared data shapes from `packages/contracts/` instead of redefining DTOs locally.

## Contract rule

This file must contain strict OpenAPI 3.1 specifications or JSON Schema definitions before backend/frontend integration begins. Tables may summarize endpoints, but the executable contract is the OpenAPI or JSON Schema block.

`api.contract.md`, `dto.md`, `data-model.md`, `permissions.md`, and
`packages/contracts/` are the only accepted backend/frontend communication
artifacts for API behavior. Frontend agents must not inspect backend
implementation to discover endpoints, schemas, errors, or permissions.

## Scope

- In scope endpoints: TBD
- Out of scope endpoints: TBD
- Public API compatibility notes: TBD

## OpenAPI 3.1 specification

```yaml
openapi: 3.1.0
info:
  title: <module-name> API
  version: 0.1.0
paths:
  /api/<module>:
    get:
      summary: List <module> records
      operationId: list<ModuleName>
      tags:
        - <module-name>
      parameters:
        - name: page
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
        - name: pageSize
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
      responses:
        '200':
          description: Paginated result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/<ModuleName>ListResponse'
        '401':
          description: Unauthorized
        '403':
          description: Forbidden
components:
  schemas:
    <ModuleName>Dto:
      type: object
      additionalProperties: false
      required:
        - id
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    <ModuleName>ListResponse:
      type: object
      additionalProperties: false
      required:
        - items
        - page
        - pageSize
        - total
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/<ModuleName>Dto'
        page:
          type: integer
        pageSize:
          type: integer
        total:
          type: integer
```

## Endpoint summary

| Method | Path | Permission | Request | Response | Errors |
|---|---|---|---|---|---|
| GET | `/api/<module>` | TBD | Query params | `<ModuleName>ListResponse` | 401, 403, 500 |

## Endpoints

Every endpoint must be represented in the OpenAPI block and summarized here.

| Operation ID | Method | Path | Purpose | Permission |
|---|---|---|---|---|
| `list<ModuleName>` | GET | `/api/<module>` | List records | TBD |

## Request schema

Request schemas must be strict and must appear in the OpenAPI block or linked
JSON Schema.

| Operation ID | Request location | Schema | Validation notes |
|---|---|---|---|
| `list<ModuleName>` | query | page, pageSize | pagination bounds defined in OpenAPI |

## Response schema

Response schemas must reference DTOs described in `dto.md` and executable
schemas under `packages/contracts/` when available.

| Operation ID | Success response | DTO/schema | Notes |
|---|---|---|---|
| `list<ModuleName>` | 200 | `<ModuleName>ListResponse` | paginated list |

## Error codes

| Code | Meaning | Frontend behavior | Notes |
|---|---|---|---|
| 400 | Validation error | show actionable validation message | when request validation fails |
| 401 | Unauthorized | request sign-in/session recovery | no valid session |
| 403 | Forbidden | show forbidden state | missing permission |
| 404 | Not found | show not-found/empty state | includes cross-tenant not found when configured |
| 500 | Server error | show retryable error state | do not expose internals |

## Permissions

| Permission | Endpoint(s) | Required role/capability | Notes |
|---|---|---|---|
| TBD | `GET /api/<module>` | TBD | Keep aligned with `permissions.md` |

## Request/response rules

- Request bodies must use strict schemas.
- Responses must reference DTOs described in `dto.md`.
- Pagination, filtering and sorting must be deterministic before implementation.
- Error responses must be stable enough for frontend UX and QA assertions.

## Tenant behavior

- Tenant-owned data must be scoped by tenant context.
- Cross-tenant reads must return 403 or 404 according to `docs/TENANCY.md`.
- SuperAdmin/impersonation behavior must be explicit if supported.

## Implementation ownership

- Backend implements documented endpoints only.
- Frontend consumes this contract and must not infer backend behavior from code.
- Contract changes require handoff update and `test-matrix.md` coverage.
- Backend agents must not inspect frontend implementation to infer UI needs.

## Contract verification checklist

- [ ] Request schemas are strict.
- [ ] Response schemas are strict.
- [ ] Error responses are defined.
- [ ] Permissions are mapped.
- [ ] Pagination/filter/sort behavior is defined where applicable.
- [ ] Tenant behavior is defined.
