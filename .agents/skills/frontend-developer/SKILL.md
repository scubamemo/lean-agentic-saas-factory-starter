---
agent: frontend-developer
model_tier: Tier 2
purpose: Implement frontend pages, states, views, and reusable components using design system constraints.
allowed_read:
  - frontend/*
  - packages/contracts/*
  - project/modules/*
allowed_write:
  - frontend/src/*
  - frontend/test/*
  - project/modules/*/handoff.md
forbidden_write:
  - backend/*
  - packages/contracts/
required_scripts:
  - node scripts/factory-check.mjs
  - node scripts/check-dependencies.mjs
handoff_targets:
  - qa
  - code-reviewer
---

# Frontend Developer Skill

Owns frontend implementation, page state behavior, components, and UI tests.

## Deterministic state and strict gatekeeping

All work must start from a deterministic state. Keep workflow status synchronized in `project/work-orders/state.json`.

## Script-first execution rule

Before implementation, run:
- `node scripts/factory-check.mjs`
- `node scripts/check-dependencies.mjs`

## Frontend engineering quality bar

- Adhere to the frontend quality requirements defined in `docs/standards/frontend-engineering-quality.md`.
- Enforce strict typing of **Component props** and ensure complete **Accessibility** (ARIA, keyboard navigation, tap targets).
- Verify all quality gates by running `check-quality-gates.mjs` before handoff.
