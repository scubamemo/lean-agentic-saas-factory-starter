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
inline style objects except explicitly approved dynamic CSS variables
new color scales outside project/UI.md
unapproved component libraries
copy-pasted one-off components when a reusable component exists
```

### Design system tokens

Design system tokens from `project/UI.md` are the source of truth for colors,
spacing, typography, radius, shadows, focus states, and density decisions.
Do not hardcode visual values when a project token or Tailwind/Shadcn-compatible
utility exists. New token needs must be routed to Designer/Architect through
`ui.contract.md` and handoff evidence.

## Component architecture

Prefer a small hierarchy:

| Type | Responsibility |
|---|---|
| Page | Route-level composition, permission boundary, data loading orchestration |
| Feature component | Module-specific interaction, local state, action composition |
| Reusable component | Generic UI behavior, no module-specific business rule |
| Hook/API wrapper | Query/mutation wiring and cache behavior |

### Page vs reusable component boundaries

Page components own route-level composition only. They may:

- read route/search params;
- bind permission and tenant-aware UI boundaries;
- call module-level query/mutation hooks;
- compose feature and reusable components;
- select loading/empty/error/forbidden/success states from `ui.contract.md`.

Page components must not:

- contain reusable visual primitives;
- duplicate form validation logic that belongs in a feature component or hook;
- define public DTO shapes;
- directly import backend implementation;
- hide business rules that are absent from `ui.contract.md`.

Reusable components must be generic and behavior-oriented. They should not know
module-specific permissions, endpoint URLs, tenant rules, or persistence fields.
If a component needs module-specific business context, keep it as a feature
component and document it as module-specific in `COMPONENTS.md` only if it is
intended for reuse inside that module.

### Component API design

Reusable components must have:

- explicit typed props,
- minimal public API,
- loading/empty/error/disabled behavior when relevant,
- accessibility notes,
- documentation in `frontend/src/components/COMPONENTS.md`.

Component props should be:

- named by user intent or UI behavior, not implementation detail;
- narrow and explicit rather than accepting broad `config`, `data`, or `options`
  bags;
- derived from `ui.contract.md`, `dto.md`, and `packages/contracts/` when they
  represent backend/frontend communication;
- stable enough that callers do not need to understand component internals;
- free of backend persistence models or Prisma-generated types.

Prefer composition over boolean prop explosions. If a component gains many
unrelated props, split it or move module-specific behavior into a feature
component.

### Component reuse

Before creating UI, inspect `frontend/src/components/` and
`frontend/src/components/COMPONENTS.md`. Reuse a matching component first,
refactor a similar component when the generalization is small and clear, and
create a new component only when reuse or refactor would violate the contract.
Every new or materially refactored reusable component must be documented in
`COMPONENTS.md`.

## State management rules

- Prefer local state for UI-only concerns.
- Colocate state with the smallest component that needs to read or update it.
- Prefer URL/query params for shareable filter/search/page state.
- Prefer API cache/query layer for server state.
- Use global state only for session, cross-page app state, or clearly shared concerns.
- Do not duplicate server DTOs into separate frontend-only data structures unless creating a view model for presentation.

### Local vs global state rules

Use local state for:

- open/closed UI controls;
- temporary form input before submit;
- transient validation display;
- selected tabs or purely visual toggles.

Use URL/search params for:

- shareable filters;
- sort order;
- pagination;
- search queries;
- selected resource identifiers when deep-linking is expected.

Use global/app state only for:

- authenticated session;
- tenant/workspace selection;
- feature flags or app-wide preferences;
- state genuinely shared across unrelated pages.

Do not introduce a global store for one page, one form, or one component tree.

### Query/cache layer expectations

Server state belongs in the project API/query layer, not ad-hoc component
fetching. Query and mutation wrappers must:

- use public types from `packages/contracts/` or generated `packages/api-client/`;
- preserve stable error codes from the API;
- invalidate or update cache entries after successful mutations when required;
- expose loading, pending, error, forbidden, and success states to the UI;
- avoid duplicating retry, pagination, filter, and sort behavior outside the
  shared query/client utilities.

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

State handling must be visible and testable. Do not collapse loading, empty,
error, forbidden, and success states into one generic fallback unless the
module `ui.contract.md` explicitly allows it.

## Form validation

Forms must validate at the UI boundary before submit and must also display
server-side validation failures returned by the API.

Form rules:

- required fields, formats, min/max constraints, and cross-field constraints
  come from `ui.contract.md`, `dto.md`, and `api.contract.md`;
- field errors must be associated with the relevant control;
- summary errors must be available for screen readers when multiple fields fail;
- user input must be preserved after recoverable validation or server errors;
- submit buttons must expose pending/disabled behavior without trapping focus;
- destructive submits require confirmation unless explicitly waived by contract.

## Accessibility bar

Generated UI must preserve:

- labels for controls,
- keyboard-reachable actions,
- visible focus states,
- semantic buttons/links,
- accessible error messages,
- no color-only meaning,
- dialog/modal focus behavior when applicable.

### Keyboard navigation

Interactive UI must be operable without a mouse:

- use real `button`, `a`, `input`, `select`, and `textarea` elements when
  semantics match;
- preserve tab order and visible focus;
- support Enter/Space activation for custom controls;
- provide Escape/close behavior for dialogs, popovers, and menus when relevant;
- return focus after closing overlays;
- avoid keyboard traps.

### Responsive behavior

Responsive behavior must follow `project/UI.md` and `ui.contract.md`.

- Layouts must remain usable on narrow and wide screens.
- Tables/lists must define wrapping, horizontal scroll, card fallback, or
  column-priority behavior when applicable.
- Touch targets must remain usable.
- Responsive changes must not remove required actions or hide error/forbidden
  states.
- Do not create breakpoint-specific business behavior unless the UI contract
  defines it.

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

## Maintainability checks before handoff

Before handoff, verify the implementation against the compact craftsmanship
bar instead of reading broad historical docs:

- SOLID: pages compose behavior; components render UI; hooks/API wrappers own data wiring.
- DRY: reusable UI and public DTO shapes are not copied into one-off components.
- KISS: local state and plain composition are preferred over global state or generic frameworks.
- YAGNI: no speculative component framework, theme layer, or state machine is added without contract need.
- High cohesion / low coupling: module-specific UI stays module-specific; reusable components avoid business rules.
- Typed interfaces: reusable component props and API data are contract-derived.
- Testability: states from `ui.contract.md` can be rendered and asserted independently.
- Observability: user-facing errors are stable and diagnosable without exposing secrets or tenant data.

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
