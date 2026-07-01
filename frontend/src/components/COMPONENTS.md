# Reusable Components Catalog

This catalog is the required reuse checkpoint for frontend agents. Before
creating or changing a reusable component, inspect this file and the files under
`frontend/src/components/`.

All UI code must comply with:

```text
project/UI.md
project/modules/<module>/ui.contract.md
docs/standards/frontend-standards.md
docs/standards/frontend-engineering-quality.md
```

## Component creation protocol

1. Inspect `frontend/src/components/` and this catalog before creating a
   component.
2. If an existing component covers the same purpose, reuse it.
3. If an existing component is close but too narrow, refactor it instead of
   creating a duplicate.
4. Create a new reusable component only when reuse/refactor would reduce
   clarity or violate the target `ui.contract.md`.
5. Document every new or materially refactored reusable component in this file
   in the same change.
6. Validate the component against `project/UI.md`, the target module
   `ui.contract.md`, `permissions.md`, and `test-matrix.md`.

## Styling constraints

- Use Tailwind/Shadcn-compatible composition.
- Do not add ad-hoc CSS files.
- Do not use inline style objects for layout, spacing, color or typography.
- Inline style objects are allowed only when the `ui.contract.md` or
  Architect/Designer explicitly approves dynamic CSS variables that cannot be
  represented with Tailwind utilities.
- Do not introduce unapproved UI libraries, color scales, design tokens or
  one-off duplicated components.

## Required component documentation fields

Each reusable component entry must include:

- component name;
- purpose;
- props summary;
- allowed usage;
- related module if module-specific;
- accessibility notes.

## Component catalog

No reusable UI components are currently implemented in this starter template.
When a component is added, replace this sentence with entries using the format
below.

### Component entry format

```text
Component name: DescriptiveComponentName
Purpose: What reusable UI problem it solves.
Props summary: Main props and contract source.
Allowed usage: Where it may be used and when it must not be used.
Related module: Global reusable component or module name.
Accessibility notes: Keyboard, focus, label, semantics and state notes.
```

## Review checklist

- Existing components were inspected before creation.
- Similar components were reused or refactored before new components were
  introduced.
- New reusable components are documented here.
- Component behavior matches `project/UI.md` and module `ui.contract.md`.
- Loading, empty, error, forbidden, success and validation states are handled
  when applicable.
- Accessibility notes are documented for interactive components.
