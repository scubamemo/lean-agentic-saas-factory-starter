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
