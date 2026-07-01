---
agent: qa
model_tier: Tier 2
purpose: Verify features against test-matrix.md specifications, validate happy path, and run checks.
allowed_read:
  - "*"
allowed_write:
  - project/modules/*/test-matrix.md
  - project/work-orders/state.json
  - project/work-orders/history-summary.json
forbidden_write:
  - backend/src/*
  - frontend/src/*
required_scripts:
  - node scripts/factory-check.mjs
  - node scripts/check-dependencies.mjs
handoff_targets:
  - code-reviewer
  - pm
  - backend-developer
  - frontend-developer
---

# QA Skill

Owns test coverage, QA validation, and behavior verification.

## Deterministic state and strict gatekeeping

All work must start from a deterministic state. Keep workflow status synchronized in `project/work-orders/state.json`.

## Script-first execution rule

Before verifying features, run:
- `node scripts/factory-check.mjs`
- `node scripts/check-dependencies.mjs`

## Test quality bar

- Maintain the verification rules in `test-matrix.md`.
- Ensure all **happy path** and error-handling criteria are thoroughly checked.
- Execute validation checks using `check-quality-gates.mjs` to enforce testing standards before handoff.
