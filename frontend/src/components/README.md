# Components

Reusable components must follow the project-level UI direction and the module-level UI contract:

- `project/UI.md` for global UI direction, layout conventions, navigation principles and visual tone.
- `project/modules/<module>/ui.contract.md` for module-specific routes/pages, components, form behavior, mock scenarios and visual QA expectations.
- `docs/standards/frontend-standards.md` for frontend implementation rules.
- `frontend/src/components/COMPONENTS.md` for reusable component documentation.

Do not create separate split UI contract files unless a work order explicitly changes the factory standard. In the lean baseline, component and route concerns belong inside `ui.contract.md`.

Shared components may live here only when they are reusable across modules. Module-specific components should be placed near the route/page or module implementation chosen by the active work order.

No ad-hoc CSS or unapproved style systems are allowed.
