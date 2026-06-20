# API Contract Example

This is the canonical golden example for module API contracts. Real modules must provide a strict OpenAPI 3.1 contract or JSON Schema definitions before implementation starts.

## OpenAPI 3.1 specification

```yaml
openapi: 3.1.0
info:
  title: Sample Resource API
  version: 0.1.0
paths:
  /api/sample-resources:
    get:
      summary: List sample resources
      operationId: listSampleResources
      tags:
        - sample-resources
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
                $ref: '#/components/schemas/SampleResourceListResponse'
        '401':
          description: Unauthorized
        '403':
          description: Forbidden
    post:
      summary: Create sample resource
      operationId: createSampleResource
      tags:
        - sample-resources
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSampleResourceRequest'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SampleResourceDto'
        '400':
          description: Validation error
        '401':
          description: Unauthorized
        '403':
          description: Forbidden
components:
  schemas:
    SampleResourceDto:
      type: object
      additionalProperties: false
      required:
        - id
        - name
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
        name:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
    CreateSampleResourceRequest:
      type: object
      additionalProperties: false
      required:
        - name
      properties:
        name:
          type: string
          minLength: 1
    SampleResourceListResponse:
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
            $ref: '#/components/schemas/SampleResourceDto'
        page:
          type: integer
        pageSize:
          type: integer
        total:
          type: integer
```

## Endpoint summary

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/api/sample-resources` | `sample.resource.read` | Paginated list |
| POST | `/api/sample-resources` | `sample.resource.create` | Create record |

## Verification rules

- The OpenAPI block is the source of truth for backend/frontend communication.
- Backend implementation must expose the documented paths, methods, operation IDs, request schemas and response schemas.
- Frontend code must consume DTOs from `packages/contracts/` or generated client code derived from this contract.
