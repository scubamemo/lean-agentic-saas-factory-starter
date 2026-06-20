# Reusable Components Catalog

Document reusable frontend components here.

All components must follow:

```text
project/UI.md
project/modules/<module>/ui.contract.md
docs/standards/frontend-standards.md
```



## Component creation protocol

Before adding a new component, the Frontend Developer must inspect this catalog and the files under `frontend/src/components/`.

Decision rules:

1. If an existing component covers the same purpose, reuse it.
2. If an existing component is close but too narrow, refactor it into a reusable component.
3. Create a new component only when reuse or refactor would make the existing component less clear.
4. Document every new or materially refactored reusable component in the catalog below.
5. Do not use hardcoded inline styles, ad-hoc CSS files, or project-external styling systems.
6. Component behavior must match the target module `ui.contract.md` and the global `docs/standards/frontend-standards.md`.

## Required component documentation fields

For each reusable component, keep the table row up to date with:

```text
Component name
Purpose
Props source
State coverage
Used by modules
Accessibility/interaction notes
```

## Component catalog

| Component | Purpose | Props source | State coverage | Used by modules | Accessibility / interaction notes |
|---|---|---|---|---|---|
| TBD | TBD | `dto.md` / local props | loading / empty / error / forbidden / success / validation as needed | TBD | TBD |

## Rules

- Scan existing components before creating a new one.
- Reuse or refactor functionally similar components before introducing new components.

- Use Tailwind/Shadcn-compatible composition.
- Do not add ad-hoc CSS.
- Prefer reusable components over one-off duplicates.
- Document loading, empty, error, forbidden, success, and validation states when relevant.
