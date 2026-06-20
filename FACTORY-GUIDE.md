# Factory Guide

This starter is meant to be copied for many SaaS projects. Keep reusable factory rules separate from project-specific content.

## Project-specific files

These are expected to change for each application:

```text
project/PROJECT.md
project/UI.md
project/MODULES.md
project/CONTEXT.md
project/DECISIONS.md
project/work-orders/active-work-order.md
project/modules/<module>/**
backend/src/modules/**
frontend/src/app/**
frontend/src/components/**
```

## Reusable files

These should change rarely:

```text
.agents/**
docs/**
factory/**
scripts/**
backend/src/common/**
backend/src/tenancy/**
frontend/src/lib/**
packages/**
```

## Keep it lean

Add a new gate, script or template only if it prevents repeated real mistakes. Prefer improving the active work order, `project/CONTEXT.md` and module contracts over adding another process layer.

## Context maintenance

When `project/PROJECT.md`, `project/UI.md` or `project/MODULES.md` changes meaningfully, update `project/CONTEXT.md`. When module contracts change meaningfully, update the module `context.md`.
