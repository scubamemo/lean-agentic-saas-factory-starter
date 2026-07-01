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
packages/contracts/
packages/api-client/
docs/standards/frontend-standards.md
```

Frontend must not inspect backend implementation unless the active work order explicitly allows it.

Frontend implementation must be contract-first. `ui.contract.md`,
`api.contract.md`, `dto.md`, `permissions.md`, `packages/contracts/` and
generated or maintained `packages/api-client/` outputs are the accepted
communication artifacts between frontend and backend.

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
inline style objects except approved dynamic CSS variables
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
4. Documented in `frontend/src/components/COMPONENTS.md`.
5. Validated against `ui.contract.md` states and actions.

Before creating a component, inspect `frontend/src/components/` and
`frontend/src/components/COMPONENTS.md`. Reuse an existing component when it has
the same purpose. Refactor a similar component when a small generalization is
clearer than duplication. New reusable components are allowed only when reuse
or refactor would violate `ui.contract.md` or reduce clarity.

Every `COMPONENTS.md` entry must include:

- component name;
- purpose;
- props summary;
- allowed usage;
- related module if module-specific;
- accessibility notes.

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
- reading backend implementation to discover endpoints, DTOs, errors or permissions,
- redefining backend DTOs inside `frontend/`,
- creating UI behavior that conflicts with `ui.contract.md`,
- using ad-hoc CSS, inline theme styles or unapproved design tokens,
- using inline style objects unless explicitly approved for dynamic CSS variables,
- creating reusable components without inspecting and updating `frontend/src/components/COMPONENTS.md`,
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

Frontend SoC rules:

- Frontend must not import from `backend/`.
- Frontend must never import from `backend/prisma/`, Prisma migrations, generated Prisma types or backend persistence internals.
- Frontend/backend shared request, response, event and permission structures must come from `packages/contracts/` or generated `packages/api-client/` outputs.
- Frontend must not import `packages/shared/` unless the exact target is explicitly UI-safe under `packages/shared/ui-safe/` or `packages/shared/src/ui-safe/`.
- Direct frontend feature-to-feature imports are discouraged. If unavoidable, the Architect must approve the exact import and shared public shapes must still live in `packages/contracts/`.

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
- Page vs reusable component boundaries must follow `docs/standards/frontend-engineering-quality.md`.
- Component APIs must be narrow, behavior-oriented and free of backend persistence models.
- State must be colocated with the smallest component that needs it.
- Server/API state should use the project API/query layer; do not duplicate DTO shapes.
- Local UI state is preferred unless state is cross-page/session/global.
- Global state is allowed only for session, tenant/workspace, feature flags or genuinely cross-page concerns.
- Forms must validate from `ui.contract.md`, `dto.md` and `api.contract.md`, preserve recoverable input, and show accessible errors.
- Loading, empty, error, forbidden, success and validation states must match `ui.contract.md`.
- Accessibility, keyboard navigation and visible focus are mandatory for interactive UI.
- Responsive behavior must preserve required actions, state feedback and usability.
- Styling must use project design system tokens from `project/UI.md`; inline hardcoded styles and ad-hoc CSS outside the design system are forbidden.
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
