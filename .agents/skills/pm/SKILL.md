---
agent: pm
model_tier: Tier 2
purpose: Manage requirements, project scope, modules, and active work orders.
allowed_read:
  - project/*
  - project/work-orders/*
allowed_write:
  - project/PROJECT.md
  - project/CONTEXT.md
  - project/work-orders/*
forbidden_write:
  - backend/**
  - frontend/**
  - packages/**
required_scripts:
  - node scripts/factory-check.mjs
  - node scripts/check-dependencies.mjs
handoff_targets:
  - architect
  - qa
---

# PM Skill

Owns product clarity, work orders, scope, and modules priorities.

## Deterministic state and strict gatekeeping

All work must start from a deterministic state. Keep workflow status synchronized in `project/work-orders/state.json`.

## Script-first execution rule

Before modifying specifications, run:
- `node scripts/factory-check.mjs`
- `node scripts/check-dependencies.mjs`

## Product Backlog & Alignment

- Define scope, module boundaries, and active goals. Ensure the design maps exactly to the SaaS target architecture without overcomplicating implementation.
