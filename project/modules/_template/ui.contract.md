# UI Contract

Use this single file for route, component, mock and visual expectations. Keep it compact but strict.

## Metadata

| Field | Value |
|---|---|
| Status | draft |
| Contract version | 0.1.0 |
| Owner | Architect / Designer |
| Design system | Tailwind/Shadcn |
| Last verified by | TBD |

## Design system constraints

- Use Tailwind utility classes and Shadcn-compatible component composition.
- Do not create ad-hoc CSS or inline layout/theme styles.
- New reusable components must be documented in `frontend/src/components/`.
- Business behavior must come from this contract, not implementation guesses.
- Reuse existing components before creating new ones.
- Accessibility behavior must be testable through `test-matrix.md`.
- `ui.contract.md`, `api.contract.md`, `dto.md`, `permissions.md`, and
  `packages/contracts/` are the only accepted frontend/backend communication
  artifacts for UI/API behavior.
- Frontend agents must not inspect backend implementation to infer endpoints,
  DTOs, errors or permissions.

## Routes / pages

| Route | Purpose | Data source | Permission | States |
|---|---|---|---|---|
| TBD | TBD | `api.contract.md` | TBD | loading, empty, error, forbidden, success |

## Page behavior

- Default state: TBD
- Empty state: TBD
- Error state: TBD
- Forbidden state: TBD
- Success state: TBD
- Loading state: TBD
- Mobile/responsive behavior: TBD

## UI states

| State | Trigger | Required UI behavior | Test evidence |
|---|---|---|---|
| loading | request pending | TBD | `test-matrix.md` |
| empty | no records | TBD | `test-matrix.md` |
| error | recoverable failure | TBD | `test-matrix.md` |
| forbidden | missing permission | TBD | `test-matrix.md` |
| success | data/action complete | TBD | `test-matrix.md` |

## Components

| Component | Purpose | Props source | Reusable | Documentation target |
|---|---|---|---|---|
| TBD | TBD | `dto.md` | Yes/No | `frontend/src/components/COMPONENTS.md` |

## User actions

| Action | Trigger | API/DTO | Validation | Confirmation |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD |

## Validation

| Field/action | Rule | Error message behavior | Source |
|---|---|---|---|
| TBD | TBD | TBD | `api.contract.md` / `dto.md` |

## Permission behavior

| Permission | Visible UI | Disabled/hidden behavior | Forbidden copy |
|---|---|---|---|
| TBD | TBD | TBD | TBD |

## Mock scenarios

Mock data must match `dto.md` and `api.contract.md`.

- Happy path: TBD
- Empty state: TBD
- Error state: TBD
- Forbidden state: TBD
- Permission-limited state: TBD

## Visual QA expectations

- Loading state visible.
- Empty state useful.
- Error state actionable.
- Forbidden state clear.
- Mobile behavior defined when relevant.
- Destructive actions require confirmation.
- Design system components used consistently.
- Keyboard navigation and focus handling are defined for interactive flows.

## Accessibility expectations

- Interactive controls have accessible names.
- Keyboard navigation reaches every interactive element.
- Focus state is visible.
- Validation errors are announced or associated with fields.
- Color is not the only signal for state.

## Contract verification checklist

- [ ] All routes/pages are defined.
- [ ] All data sources map to `api.contract.md`.
- [ ] All props map to `dto.md`.
- [ ] Permissions map to `permissions.md`.
- [ ] Reusable components are documented.
- [ ] Visual states are testable through `test-matrix.md`.
