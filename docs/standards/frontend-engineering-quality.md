# Frontend Engineering Quality Standard

This standard defines the frontend quality bar for generated UI.

## Required read set

Frontend agents should use:

```text
project/work-orders/state.json
project/CONTEXT.md
project/UI.md
project/modules/<module>/context.md
project/modules/<module>/MODULE.md
project/modules/<module>/ui.contract.md
project/modules/<module>/api.contract.md
project/modules/<module>/dto.md
project/modules/<module>/permissions.md
frontend/src/components/COMPONENTS.md
```

Do not inspect backend implementation to infer behavior.

## Design system enforcement

Use only the project-approved design system:

```text
Tailwind utility classes
Shadcn-compatible composition
approved design tokens from project/UI.md
existing reusable components from frontend/src/components/
```

Forbidden:

```text
ad-hoc global CSS
inline styles for layout/theming
new color scales outside project/UI.md
unapproved component libraries
copy-pasted one-off components when a reusable component exists
```

## Component architecture

Prefer a small hierarchy:

| Type | Responsibility |
|---|---|
| Page | Route-level composition, permission boundary, data loading orchestration |
| Feature component | Module-specific interaction, local state, action composition |
| Reusable component | Generic UI behavior, no module-specific business rule |
| Hook/API wrapper | Query/mutation wiring and cache behavior |

Reusable components must have:

- explicit typed props,
- minimal public API,
- loading/empty/error/disabled behavior when relevant,
- accessibility notes,
- documentation in `frontend/src/components/COMPONENTS.md`.

## State management rules

- Prefer local state for UI-only concerns.
- Prefer URL/query params for shareable filter/search/page state.
- Prefer API cache/query layer for server state.
- Use global state only for session, cross-page app state, or clearly shared concerns.
- Do not duplicate server DTOs into separate frontend-only data structures unless creating a view model for presentation.

## Data access rules

Frontend request/response types must come from `packages/contracts/` or generated `packages/api-client/` outputs when available.

UI behavior must be driven by:

```text
ui.contract.md
api.contract.md
dto.md
permissions.md
```

## Required UI states

Every route/page must implement applicable states from `ui.contract.md`:

```text
loading
empty
error
forbidden
success
submitting
validation error
permission-limited state
```

Destructive actions require confirmation unless `ui.contract.md` explicitly says otherwise.

## Accessibility bar

Generated UI must preserve:

- labels for controls,
- keyboard-reachable actions,
- visible focus states,
- semantic buttons/links,
- accessible error messages,
- no color-only meaning,
- dialog/modal focus behavior when applicable.

## Frontend testing expectations

Update `test-matrix.md` for:

```text
loading state
empty state
error state
forbidden state
success state
form validation
destructive action confirmation
permission-limited rendering
responsive behavior when required
```

## Frontend handoff quality

Before handoff, run:

```bash
node scripts/factory-check.mjs
node scripts/check-contract-artifacts.mjs
node scripts/check-dto.mjs
node scripts/check-dependencies.mjs
node scripts/check-quality-gates.mjs
```

The handoff must mention whether existing components were reused, refactored, or newly documented.
