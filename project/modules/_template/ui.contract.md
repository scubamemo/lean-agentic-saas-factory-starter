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

## Components

| Component | Purpose | Props source | Reusable | Documentation target |
|---|---|---|---|---|
| TBD | TBD | `dto.md` | Yes/No | `frontend/src/components/COMPONENTS.md` |

## Forms and actions

| Action | Trigger | API/DTO | Validation | Confirmation |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD |

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

## Contract verification checklist

- [ ] All routes/pages are defined.
- [ ] All data sources map to `api.contract.md`.
- [ ] All props map to `dto.md`.
- [ ] Permissions map to `permissions.md`.
- [ ] Reusable components are documented.
- [ ] Visual states are testable through `test-matrix.md`.
