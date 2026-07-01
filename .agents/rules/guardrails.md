# Agent Guardrails & Directory Authorization Matrix

This document defines the strict workspace write authorization boundaries (RBAC) and pre-write check procedures for the multi-agent factory.

## Directory Authorization Matrix

To enforce separation of concerns (SoC) and maintain contract integrity, the following write boundaries apply:

- **Frontend Developers must never write** files under:
  - `backend/prisma/` (Prisma schema or migrations)
  - `packages/contracts/` (API/domain specifications)
- **Backend Developers must never write** files under:
  - `frontend/` (Frontend code, UI components, pages)
- **Data Engineers** are the sole owners of `backend/prisma/schema.prisma` and database migrations.

## Styling Guardrails

- Developers must not add **ad-hoc global CSS** to the frontend. All styling must adhere strictly to the established design system tokens and Tailwind CSS rules.

## Pre-Write Check

Before editing or creating any file, the agent must perform the following Pre-Write Check:
1. Verify if the target file path lies within the role's allowed write paths.
2. Ensure that the file changes do not duplicate logic defined in `packages/contracts/`.
3. Confirm that the task JSON state in `project/work-orders/state.json` is updated before updating the mirror markdown.
