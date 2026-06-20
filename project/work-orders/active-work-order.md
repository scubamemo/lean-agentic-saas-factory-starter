# Active Work Order

## ID

WO-0001

## Task type

planned

Allowed values: docs-only, contract-only, backend-only, frontend-only, full-stack, bugfix, refactor, review, release

## Status

planned

Allowed values: planned, ready, in_progress, blocked, review, done

## Context mode

small

Allowed values: small, medium, large

- small: one module, up to 8 files read, implementation allowed.
- medium: one or two modules, up to 20 files read, plan before code.
- large: no direct implementation; split into smaller work orders.

## Owner

pm

## Target module

TBD

## Goal

TBD

## Acceptance criteria

- TBD

## Must read

- START-HERE.md
- AGENTS.md
- project/CONTEXT.md
- project/work-orders/active-work-order.md
- project/modules/<module>/context.md
- project/modules/<module>/MODULE.md

## Read by role

Backend:

- project/modules/<module>/api.contract.md
- project/modules/<module>/dto.md
- project/modules/<module>/data-model.md
- project/modules/<module>/permissions.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md

Frontend:

- project/modules/<module>/ui.contract.md
- project/modules/<module>/api.contract.md
- project/modules/<module>/dto.md
- project/modules/<module>/permissions.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md

QA/reviewer:

- project/modules/<module>/api.contract.md
- project/modules/<module>/ui.contract.md
- project/modules/<module>/test-matrix.md
- project/modules/<module>/handoff.md
- changed files listed in handoff

## Optional read

- project/PROJECT.md only if product context is missing from `project/CONTEXT.md`.
- project/UI.md only if UI context is missing from `project/CONTEXT.md` or `ui.contract.md`.
- project/MODULES.md only if module ownership is unclear.
- docs/standards/** only if the task touches that specific standard.

## Allowed write paths

- project/modules/<module>/**
- backend/src/modules/<module>/** for backend work
- backend/test/** for backend tests
- frontend/src/app/** for frontend routes/pages
- frontend/src/components/** for frontend components
- frontend/test/** for frontend tests

## Forbidden paths by default

- unrelated modules
- frontend implementation for backend-only work
- backend implementation for frontend-only work
- factory standards unless this is a factory-maintenance work order
- broad docs/ or project/ rewrites unless this is a docs/refactor work order

## Required output

- Summary
- Files read
- Files changed
- Contracts updated
- Tests/checks run
- Handoff updated
- Next owner
