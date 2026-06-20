# Active Work Order

## ID

WO-0001

## Status

planned

Allowed values: planned, ready, in_progress, blocked, review, done

## Owner

pm

## Target module

TBD

## Goal

TBD

## Acceptance criteria

- TBD

## Allowed read paths

- START-HERE.md
- AGENTS.md
- project/PROJECT.md
- project/UI.md
- project/MODULES.md
- project/modules/<module>/**
- docs/standards/** as needed

## Allowed write paths

- project/modules/<module>/**
- backend/src/modules/<module>/**
- frontend/src/app/**
- frontend/src/components/**

## Forbidden paths by default

- unrelated modules
- frontend implementation for backend-only work
- backend implementation for frontend-only work
- factory standards unless this is a factory-maintenance work order

## Required output

- Summary
- Files changed
- Contracts updated
- Tests/checks run
- Handoff updated
- Next owner
