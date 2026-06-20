# UI Contract

Use this single file for route, component, mock and visual expectations. Keep it compact.

## Routes / pages

| Route | Purpose | Data source | Permission | States |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | loading, empty, error, forbidden, success |

## Page behavior

- Default state: TBD
- Empty state: TBD
- Error state: TBD
- Forbidden state: TBD
- Success state: TBD

## Components

| Component | Purpose | Props source | Reusable |
|---|---|---|---|
| TBD | TBD | dto.md | Yes/No |

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

## Visual QA expectations

- Loading state visible.
- Empty state useful.
- Error state actionable.
- Forbidden state clear.
- Mobile behavior defined when relevant.
- Destructive actions require confirmation.
