# Frontend Standards

These rules apply to all frontend agents and UI code.

## Source of truth

Frontend implementation must be based on:

```text
project/UI.md
project/modules/<module>/ui.contract.md
project/modules/<module>/api.contract.md
project/modules/<module>/dto.md
project/modules/<module>/permissions.md
docs/standards/frontend-standards.md
```

Frontend must not inspect backend implementation unless the active work order explicitly allows it.

## Design system enforcement

The project design system is Tailwind/Shadcn-compatible by default.

Allowed:

```text
Tailwind utility classes
Shadcn-compatible component composition
existing reusable components from frontend/src/components/
project-approved design tokens
module-specific composition described in ui.contract.md
```

Forbidden unless approved by Architect/Designer:

```text
ad-hoc CSS files
inline styles for layout/theming
new color scales outside project/UI.md
unapproved UI libraries
copy-pasted one-off components that should be reusable
business behavior invented in implementation instead of ui.contract.md
```

## Component rules

Any new reusable component must be:

1. Built from the design system.
2. Typed with explicit props.
3. Reusable across modules or clearly documented as module-local.
4. Documented in `frontend/src/components/COMPONENTS.md` or the nearest README under `frontend/src/components/`.
5. Validated against `ui.contract.md` states and actions.

## Required UI states

Each page/component must handle applicable states:

```text
loading
empty
error
forbidden
success
submitting
validation error
```

## Forms

Forms must:

- validate required fields,
- show actionable error messages,
- preserve user input on recoverable errors,
- confirm destructive actions,
- obey permissions from `permissions.md`.

## Mock and contract behavior

Mock scenarios are defined inside `ui.contract.md`. Mock responses must match `dto.md` and `api.contract.md`.

Do not create separate mock contract files unless the active work order explicitly changes the lean module standard.

## QA expectations

UI is not complete until:

- `ui.contract.md` is implemented,
- reusable components are documented,
- `test-matrix.md` evidence is updated,
- loading/empty/error/forbidden/success states are verified,
- `pnpm --dir frontend check` passes when frontend changed.

## Contract source of truth and duplication ban

`packages/contracts/` is the mandatory source of truth for shared data models, DTOs, API schemas, event payloads and communication contracts.

Frontend modules must not duplicate business logic or public data structures outside `packages/contracts/`. UI view models may adapt contract data for presentation, but request/response DTOs, event payloads and permission constants must come from `packages/contracts/` or generated client code derived from it.

Forbidden frontend patterns:

- importing backend modules directly,
- redefining backend DTOs inside `frontend/`,
- creating UI behavior that conflicts with `ui.contract.md`,
- using ad-hoc CSS, inline theme styles or unapproved design tokens,
- writing to `packages/contracts/` unless the active work order explicitly assigns contract maintenance to the frontend agent.

Required frontend workflow:

1. Read `project/work-orders/state.json`, `project/UI.md`, target `ui.contract.md`, `api.contract.md`, `dto.md` and `permissions.md`.
2. Consume contract DTOs/types from `packages/contracts/` or generated `packages/api-client/` outputs.
3. Reuse existing components from `frontend/src/components/` before creating new components.
4. Document reusable components in `frontend/src/components/COMPONENTS.md`.
5. Run `node scripts/factory-check.mjs` before handoff.


## Strict SoC and dependency boundaries

No business logic or data structures should be duplicated outside of `packages/contracts/` when they are part of public communication between agents, backend, frontend or integrations.

Frontend must not import backend code directly. Frontend must not import `packages/shared/` except explicitly UI-compatible utilities under `packages/shared/ui-safe/` or `packages/shared/src/ui-safe/`. All backend/frontend communication must use `packages/contracts/` or generated `packages/api-client/` outputs.

Before handoff, frontend-impacting work must run:

```bash
node scripts/factory-check.mjs
node scripts/check-dependencies.mjs
```


## Frontend engineering quality bar

Frontend code must satisfy:

```text
docs/standards/software-craftsmanship.md
docs/standards/frontend-engineering-quality.md
docs/standards/testing-quality-bar.md
```

Required frontend quality rules:

- Page components compose behavior; reusable components avoid module-specific business rules.
- Component props must be typed, minimal and contract-aligned.
- Server/API state should use the project API/query layer; do not duplicate DTO shapes.
- Local UI state is preferred unless state is cross-page/session/global.
- Loading, empty, error, forbidden, success and validation states must match `ui.contract.md`.
- Accessibility basics are mandatory for interactive UI.
- Existing components must be reused or refactored before new components are created.
- Every new or refactored reusable component must update `frontend/src/components/COMPONENTS.md`.

Before frontend handoff, also run:

```bash
node scripts/check-quality-gates.mjs
```


## Standardized JSON contract consumption

Frontend implementation must consume public data structures from `packages/contracts/` or generated `packages/api-client/` outputs derived from `packages/contracts/specs/*.spec.json`.

Frontend must not infer DTOs from backend implementation and must not import backend files directly. Before frontend handoff:

```bash
node scripts/check-spec-kit-contracts.mjs
node scripts/check-dependencies.mjs
node scripts/security-scanner.mjs
```
