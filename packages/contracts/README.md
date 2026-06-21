# Contracts Package

`packages/contracts/` is the mandatory source of truth for shared data models, DTOs, schemas and machine-readable communication contracts in generated projects.

## Mandatory SoT rules

- Backend and frontend modules must not duplicate business data structures outside this package.
- Shared DTOs, API schemas, event payloads, permission constants and generated client contract types belong here.
- Module-level `project/modules/<module>/api.contract.md`, `dto.md` and `data-model.md` describe intent; production code should consume generated or maintained contract artifacts from this package.
- Backend implementation may map persistence entities to contract DTOs, but it must not redefine public communication shapes ad hoc.
- Frontend implementation must use contract DTOs/types from this package or generated API-client types derived from this package.

## Recommended layout

```text
packages/contracts/
  openapi/
  schemas/
  src/
    index.ts
    permissions.ts
    dto/
    events/
```

## Agent rules

- Architect owns contract shape decisions.
- Data Engineer owns persistence alignment and schema compatibility.
- Backend Developer consumes contracts and updates module artifacts when implementation changes.
- Frontend Developer consumes contracts and must not write directly to this package unless the active work order explicitly assigns contract maintenance.
- Code Reviewer must reject duplicated public DTO/data structures outside this package.

## Duplication ban

Backend and frontend modules must not duplicate business logic or public data models outside `packages/contracts/`. Public data models, DTOs, schemas, events and permission constants must be defined here or generated from contracts maintained here.


## Dependency boundary enforcement

All cross-domain communication between `backend/`, `frontend/` and generated modules must flow through this package or generated outputs in `packages/api-client/`.

`frontend/` must not import `backend/` directly. `backend/` must not import `frontend/` directly. Backend module-to-module public data exchange must be represented as contracts here instead of direct internal imports.


## Spec-Kit JSON contracts

`packages/contracts/specs/*.spec.json` is the primary executable contract format. Module markdown files under `project/modules/<module>/` are human-readable mirrors only.

Each spec follows `packages/contracts/spec-kit.module.schema.json` and contains the spec-driven development package used by the factory:

```text
spec        what/why, user stories, acceptance criteria and non-goals
plan        implementation approach and quality gates
data_model  entities and tenant isolation expectations
contracts   OpenAPI 3.1, JSON schemas and permissions
tasks       implementation task slices
quickstart_checks validation commands
```

This mirrors the Spec-Kit style of moving from constitution/principles to specification, plan, contracts and executable tasks while keeping the JSON contract machine-verifiable.
