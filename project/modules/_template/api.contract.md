# API Contract

## Metadata

| Field | Value |
|---|---|
| Status | draft |
| Contract version | 0.1.0 |
| Owner | Architect / Backend Developer |
| Last verified by | TBD |

## Contract rule

This file must contain strict OpenAPI 3.1 specifications or JSON Schema definitions before backend/frontend integration begins. Tables may summarize endpoints, but the executable contract is the OpenAPI or JSON Schema block.

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

## Tenant behavior

- Tenant-owned data must be scoped by tenant context.
- Cross-tenant reads must return 403 or 404 according to `docs/TENANCY.md`.
- SuperAdmin/impersonation behavior must be explicit if supported.

## Contract verification checklist

- [ ] Request schemas are strict.
- [ ] Response schemas are strict.
- [ ] Error responses are defined.
- [ ] Permissions are mapped.
- [ ] Pagination/filter/sort behavior is defined where applicable.
- [ ] Tenant behavior is defined.
