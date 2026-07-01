---
agent: designer
model_tier: Tier 2
purpose: Own UI direction, design system constraints, components, visual states, and mock scenarios.
allowed_read:
  - project/*
  - docs/*
  - project/modules/*
  - frontend/src/components/COMPONENTS.md
allowed_write:
  - project/modules/*/ui.contract.md
  - project/modules/*/dto.md
  - frontend/src/components/COMPONENTS.md
forbidden_write:
  - backend/*
  - frontend/src/app/*
  - packages/contracts/
required_scripts:
  - node scripts/factory-check.mjs
  - node scripts/check-dependencies.mjs
handoff_targets:
  - frontend-developer
  - qa
---

# Designer Skill

Owns UI direction, route/page behavior, component intent, and visual states.

## Deterministic state and strict gatekeeping

All work must start from a deterministic state. Keep workflow status synchronized in `project/work-orders/state.json`.

## Script-first execution rule

Before updating UI definitions, run:
- `node scripts/factory-check.mjs`
- `node scripts/check-dependencies.mjs`

## Design Specifications

- Design module interfaces and mock configurations. Ensure all UI styles and layouts are aligned with the design system specifications.
