# Agent Hook Policy

This document defines when validation scripts must be run during the agent lifecycle.

## Mandatory Lifecycle Hooks

Every agent must run the validation checks at the following points:

### 1. Pre-Development Phase (Read Gate)
Before reading implementation files or writing code:
- Run `node scripts/factory-check.mjs`
- Run `node scripts/check-dependencies.mjs`
- Run `node scripts/check-template-cache.mjs`
- Run `node scripts/task-ready-check.mjs`

### 2. Pre-Commit / Pre-Handoff Phase (Write Gate)
Before submitting a state transition or handoff:
- Run `node scripts/check-quality-gates.mjs`
- Run `node scripts/check-dto.mjs`
- Run `node scripts/check-agent-handoff.mjs`
- Run `node scripts/security-scanner.mjs`
- Run `node scripts/check-spec-kit-contracts.mjs`

### 3. State Transition Commit
- Update `project/work-orders/state.json` first, then mirror to `project/work-orders/active-work-order.md`.
