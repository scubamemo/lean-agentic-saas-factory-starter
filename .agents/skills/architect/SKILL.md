---
agent: architect
model_tier: Tier 1
purpose: Own module boundaries, contracts, and speculative architecture limits.
allowed_read:
  - project/*
  - docs/*
  - project/modules/*
allowed_write:
  - project/MODULES.md
  - project/CONTEXT.md
  - project/modules/*
forbidden_write:
  - backend/src/*
  - frontend/src/*
required_scripts:
  - node scripts/factory-check.mjs
  - node scripts/check-dependencies.mjs
handoff_targets:
  - designer
  - backend-developer
  - data-engineer
---

# Architect Skill

Owns module boundaries, contracts, and technical decisions.

## Deterministic state and strict gatekeeping

All work must start from a deterministic state. Keep workflow status synchronized in `project/work-orders/state.json`.

## Script-first execution rule

Before modifying boundaries or definitions, run:
- `node scripts/factory-check.mjs`
- `node scripts/check-dependencies.mjs`

## Engineering design quality bar

- Maintain the module contracts strictly. Ensure no **speculative architecture** is introduced.
- Review design criteria and **Tier 1 escalation triggers** for security or data isolation issues before handoff.
- Validate design gates using `check-quality-gates.mjs` to maintain craftsmanship standards.
