# Project Owner Guide

This guide is for a non-developer SaaS founder or project owner who wants to use
this repository with an AI coding tool to generate a real B2B SaaS application.

You do not need to understand the internal agent system. Your job is to describe
the product clearly: who uses it, what screens they need, what features matter
first, and what “done” means. The AI coding tool can then turn that information
into contracts, modules, work orders, code and tests.

## What this repo is

This repo is a reusable SaaS factory starter. It is not already your finished
product.

Think of it as a well-organized workshop:

- You describe the SaaS product.
- You define the first version, called the MVP.
- You split the product into modules.
- You ask the AI to generate one module or feature at a time.
- You run validation scripts so problems are caught early.

The factory is intentionally generic. It can be used for many SaaS ideas, such
as scheduling, compliance, internal operations, analytics, customer portals,
membership tools, workflow tools, or other B2B products. The repo itself should
not be changed into one hardcoded business domain.

## What not to edit first

Start by editing only the project input files listed below. Do not begin by
editing backend or frontend code.

Avoid editing these unless an AI developer or technical collaborator tells you
to:

- `backend/`
- `frontend/`
- `packages/`
- `scripts/`
- `.agents/`
- `docs/standards/`
- `project/work-orders/state.json`

Those areas control how the factory works, how validation runs, and how the AI
agents coordinate. A non-technical project owner usually does not need to touch
them directly.

## Files to fill first

Fill these in this order:

1. `project/PROJECT.md` — what the SaaS is, who it helps, what the MVP includes.
2. `project/UI.md` — what screens, layout and user experience you want.
3. `project/MODULES.md` — the major parts of the app.
4. `project/CONTEXT.md` — a short summary for the AI to read quickly.

After those are clear, you can generate a module and create a work order.

## How to handle TBD fields

`TBD` means “to be decided.” It is safe in the starter template, but before you
ask the AI to build a feature, replace each relevant `TBD` with a concrete
answer.

You do not have to know every detail on day one. Use one of these choices:

- Replace `TBD` with a real decision if you know it.
- Replace `TBD` with `Not needed for MVP` if it is out of scope.
- Replace `TBD` with a clear open question if you need help deciding.

Good:

```text
Performance: The MVP should feel fast for up to 50 users per tenant.
```

Good:

```text
Integrations: Not needed for MVP.
```

Good:

```text
Open question: Should tenant admins invite users by email or create them manually?
```

Bad:

```text
Performance: TBD
Integrations: TBD
Open questions: TBD
```

Why bad: the AI cannot tell whether the item is unknown, unimportant, or
forgotten.

## How to fill `project/PROJECT.md`

This is the main product brief. Use plain language.

### Project / application

Fill:

- Name: the product name or working name.
- One-line description: one sentence describing the app.
- Primary users: who logs in and uses it.
- Main problem solved: the painful problem this SaaS fixes.

Good:

```text
Name: TeamPermit
One-line description: A SaaS app that helps field service companies track permits and approval tasks.
Primary users: Operations managers, coordinators and field supervisors.
Main problem solved: Teams lose time because permit status, ownership and deadlines are scattered across spreadsheets and email.
```

Bad:

```text
Name: TeamPermit
One-line description: An AI-powered platform with dashboards.
Primary users: Everyone.
Main problem solved: Makes work better.
```

Why bad: it sounds polished, but it does not tell the AI what to build.

### MVP in scope

The MVP is the smallest useful version of the product.

Include only the features required for someone to get real value. If everything
is “must-have,” the AI will generate too much too soon.

Good MVP:

```text
- Tenant admins can invite users.
- Users can create, edit and archive permit records.
- Users can assign a permit to a teammate.
- Users can see permits by status and due date.
- Tenant admins can configure basic status labels.
```

Bad MVP:

```text
- Full mobile app
- Advanced AI assistant
- Payments
- Enterprise reporting
- All integrations
- Custom workflow builder
```

Why bad: this is probably several product phases, not one MVP.

### Out of scope

Out-of-scope means “do not build this yet.” This is very important. It protects
your budget, timeline and AI context.

Good:

```text
- Native mobile apps are out of scope for MVP.
- Payment billing is out of scope for MVP.
- External integrations are out of scope for MVP.
- Custom workflow automation is out of scope for MVP.
```

Bad:

```text
- Nothing is out of scope.
```

Why bad: the AI may overbuild.

### Roles and permissions

Keep roles simple at first.

The starter already recommends:

- `SuperAdmin`: platform owner or support user. Can manage tenants and support customers.
- `TenantAdmin`: admin for one customer organization.
- `User`: normal user inside one customer organization.

Add project-specific roles only if they behave differently.

Good:

```text
| Role | Purpose | Key permissions |
|---|---|---|
| SuperAdmin | Platform owner/support | Create tenants, view tenant health, impersonate with audit |
| TenantAdmin | Customer admin | Invite users, manage settings, view all tenant records |
| Manager | Team manager | Create records, assign work, view team reports |
| User | Normal user | View and update assigned records |
```

Bad:

```text
Admin, Manager, User, Viewer, Editor, Owner, Operator, Supervisor, Staff
```

Why bad: too many roles without clear permission differences makes the app hard
to build and test.

### Non-functional requirements

These are product qualities, not screens.

Examples:

- Security: who can see what.
- Performance: how fast or how many users.
- Audit/logging: what actions must be recorded.
- Integrations: external systems.
- Data retention: how long data is kept.

Good:

```text
Security: Users must only see data from their own tenant organization.
Audit/logging: Record who creates, edits, archives and impersonates.
Integrations: Not needed for MVP.
Data retention: Keep active tenant data unless manually archived.
```

## How to fill `project/UI.md`

This file tells the AI what the product should feel like and which screens are
needed.

### Application feel

Describe the vibe and complexity.

Good:

```text
Modern B2B SaaS. Simple admin layout. Data-heavy tables, clear filters, fast forms, calm colors, desktop-first but usable on tablet.
```

Bad:

```text
Beautiful and futuristic.
```

Why bad: it does not guide layout, components or behavior.

### Routes

Routes are app pages. You can describe them in normal product language.

Good:

```text
| Route | Purpose | Module | Permission |
|---|---|---|---|
| `/` | Dashboard with summary cards and upcoming work | dashboard | User |
| `/records` | List and filter records | records | User |
| `/records/new` | Create a record | records | User |
| `/settings/users` | Manage tenant users | settings | TenantAdmin |
```

Bad:

```text
| Route | Purpose | Module | Permission |
|---|---|---|---|
| `/page1` | Stuff | TBD | TBD |
```

### Layout rules

Tell the AI what navigation should exist.

Good:

```text
Navigation: Left sidebar on desktop with Dashboard, Records and Settings.
Header/sidebar: Header shows current tenant, current user and logout.
Mobile behavior: Collapse sidebar into a menu button.
```

### Design constraints

Use this section for important UI rules.

Good:

```text
- Use a clean table layout for record lists.
- Every list needs loading, empty and error states.
- Destructive actions require confirmation.
- Forms show validation messages next to the field.
- Do not use bright colors except for status badges and destructive actions.
```

## How to fill `project/MODULES.md`

Modules are the major product areas. Each module should have its own purpose,
screens, data and permissions.

Good modules:

```text
| Priority | Module | Pattern | Status | Notes |
|---|---|---|---|---|
| 1 | dashboard | Dashboard | planned | Shows summary, recent activity and upcoming work |
| 2 | records | CRUD | planned | Main business records with status, owner and due date |
| 3 | settings | Settings | planned | Tenant settings and user management |
```

Bad modules:

```text
| Priority | Module | Pattern | Status | Notes |
|---|---|---|---|---|
| 1 | everything | CRUD | planned | Whole app |
| 2 | buttons | UI | planned | All buttons |
```

Why bad: modules should represent product capabilities, not random technical
pieces.

### How many modules should the MVP have?

For most first versions, use 2 to 5 modules.

Good first set:

- `dashboard`
- `records`
- `settings`

Add more only when a feature has its own data, permissions or screens.

## How to fill `project/CONTEXT.md`

This file is a short summary for the AI. Keep it compact.

The AI should be able to read this file and understand:

- what the app is,
- who uses it,
- which modules are active,
- what is in scope,
- what must not be built yet,
- any important security or tenancy rules.

Good:

```text
Application summary:
TeamPermit helps field service companies track permit records, ownership, status and due dates.

UI direction summary:
Modern B2B admin UI with sidebar navigation, data tables, forms and clear empty/error states.

Active modules:
dashboard, records, settings

Open project questions:
- Should record statuses be fixed for MVP or configurable by TenantAdmin?
```

Bad:

```text
Application summary:
See PROJECT.md.
```

Why bad: the point of `CONTEXT.md` is to save the AI from reading long files
every time.

## How to define phases

Phases help you avoid trying to build the whole company in version one.

Use simple phase names:

```text
Phase 1: MVP
Phase 2: Team workflow improvements
Phase 3: Reporting and integrations
Phase 4: Enterprise controls
```

Good:

```text
Phase 1 MVP:
- Login and tenant basics
- Dashboard
- Core records module
- Basic settings

Phase 2:
- Advanced filters
- Activity timeline
- Email notifications

Phase 3:
- External integrations
- Advanced reports
```

Bad:

```text
Phase 1:
- Everything required for launch, scale and enterprise sales.
```

## How to define features

A feature is something a user can do.

Good feature:

```text
Feature: Create a record
User: Tenant user
Description: A user can create a new record with title, status, owner and due date.
```

Bad feature:

```text
Feature: Database
```

Why bad: “database” is technical infrastructure, not a user-facing feature.

## How to define acceptance criteria

Acceptance criteria tell the AI and QA how to know a feature works.

Use clear, testable statements.

Good:

```text
Feature: Create a record
Acceptance criteria:
- A user can open the create form from the records list.
- Title is required.
- Due date is optional.
- Saving creates a record in the current tenant only.
- After save, the user returns to the record detail page.
- If required fields are missing, validation messages are shown.
- A user without permission cannot create a record.
```

Bad:

```text
Acceptance criteria:
- Works well.
- Looks good.
- Handles all edge cases.
```

Why bad: the AI cannot reliably test vague statements.

## How to generate a module

After `project/MODULES.md` lists a module, generate its module folder.

Use kebab-case names:

Good names:

- `dashboard`
- `records`
- `tenant-settings`
- `team-activity`

Bad names:

- `RecordsModule`
- `Record Management`
- `records_module`

Command:

```bash
pnpm new:module records
```

This creates:

```text
project/modules/records/
packages/contracts/specs/records.spec.json
```

After generating the module, fill the module files:

- `MODULE.md` — purpose, scope, paths and risks.
- `context.md` — short module summary.
- `api.contract.md` — backend/API behavior.
- `ui.contract.md` — pages, states and actions.
- `dto.md` — data shapes passed between backend and frontend.
- `data-model.md` — persistence needs.
- `permissions.md` — who can do what.
- `test-matrix.md` — how QA checks the feature.
- `handoff.md` — structured handoff between AI agents.

If you are not technical, ask the AI to fill these from your product notes.

## How to create a work order

A work order tells the AI what to work on next.

Command:

```bash
pnpm new:work-order WO-0001 records full-stack
```

Format:

```bash
pnpm new:work-order <WORK-ORDER-ID> <module-name> <task-type>
```

Common task types:

- `docs-only`
- `contract-only`
- `backend-only`
- `frontend-only`
- `data-model`
- `full-stack`
- `bugfix`
- `refactor`
- `review`
- `release`

Good:

```bash
pnpm new:work-order WO-0002 records contract-only
pnpm new:work-order WO-0003 records backend-only
pnpm new:work-order WO-0004 records frontend-only
```

Bad:

```bash
pnpm new:work-order build-my-whole-app everything full-stack
```

Why bad: work orders should be small enough to validate and review.

## How to run validation scripts

Validation scripts catch missing files, contract problems, dependency boundary
issues, security mistakes and build errors.

Run these from the repository root.

Before asking the AI to code:

```bash
pnpm check:task
```

After the AI makes changes:

```bash
pnpm check:project
```

If `pnpm check:project` passes, the repo is in a much safer state.

If it fails, copy the terminal output and ask the AI to fix the exact failure.
Do not ask the AI to “scan everything.” The script output should guide the next
step.

Good bugfix request:

```text
The command `pnpm check:project` failed. Here is the terminal output:

<paste output>

Fix only the failing issue. Do not scan the full repo. Preserve the current module contracts.
```

Bad bugfix request:

```text
Something is broken. Look everywhere and fix whatever you find.
```

## How to ask the AI to start

Use a focused prompt. Give the AI the files to read and the task to perform.

Do not ask it to read the whole repository.

Good:

```text
Read AGENTS.md, project/CONTEXT.md, project/PROJECT.md, project/UI.md and project/MODULES.md.
Do not scan the full repo.

Help me turn this SaaS idea into a clear MVP plan.
Update only project/PROJECT.md, project/UI.md, project/MODULES.md and project/CONTEXT.md.
Keep the factory domain-neutral and do not edit backend or frontend code.
```

Bad:

```text
Read everything and build the app.
```

## Ready-to-copy prompt: project definition

```text
You are helping a non-technical SaaS founder define a project.

Read:
- AGENTS.md
- PROJECT-OWNER-README.md
- project/PROJECT.md
- project/UI.md
- project/MODULES.md
- project/CONTEXT.md

Do not scan the full repo.
Do not edit backend, frontend, packages, scripts or .agents.

My SaaS idea is:
<describe the idea, users, problem, business process and important screens>

Please update:
- project/PROJECT.md
- project/UI.md
- project/MODULES.md
- project/CONTEXT.md

Make the MVP small and realistic.
Clearly mark out-of-scope items.
Replace relevant TBD fields with concrete decisions or clear open questions.
```

## Ready-to-copy prompt: module generation

First run:

```bash
pnpm new:module <module-name>
```

Then prompt the AI:

```text
I generated module `<module-name>`.

Read:
- AGENTS.md
- project/CONTEXT.md
- project/PROJECT.md
- project/UI.md
- project/MODULES.md
- project/modules/<module-name>/MODULE.md
- project/modules/<module-name>/context.md

Do not scan the full repo.
Do not edit backend or frontend implementation.

Fill the module artifacts for this module:
- MODULE.md
- context.md
- api.contract.md
- ui.contract.md
- dto.md
- data-model.md
- permissions.md
- test-matrix.md
- handoff.md

Use contract-first language and keep the module focused on the MVP.
```

## Ready-to-copy prompt: feature development

First create a work order:

```bash
pnpm new:work-order WO-0001 <module-name> full-stack
```

Then prompt the AI:

```text
Read:
- AGENTS.md
- project/work-orders/state.json
- project/work-orders/active-work-order.md
- project/CONTEXT.md
- project/modules/<module-name>/context.md
- project/modules/<module-name>/api.contract.md
- project/modules/<module-name>/ui.contract.md
- project/modules/<module-name>/dto.md
- project/modules/<module-name>/data-model.md
- project/modules/<module-name>/permissions.md
- project/modules/<module-name>/test-matrix.md
- project/modules/<module-name>/handoff.md

Do not scan the full repo.
Implement only the active work order.
Respect backend/frontend boundaries.
Run deterministic validation scripts before declaring completion.
Update the module handoff with a schema-valid Agent Handoff Payload.
```

## Ready-to-copy prompt: QA loop

```text
Act as QA for the active work order.

Read:
- AGENTS.md
- project/work-orders/state.json
- project/work-orders/active-work-order.md
- project/CONTEXT.md
- project/modules/<module-name>/test-matrix.md
- project/modules/<module-name>/handoff.md
- only changed files listed in the handoff payload

Do not scan the full repo.
Do not fix implementation code.

Run validation scripts and compare the result to test-matrix.md.
If something fails, write exact failure evidence and route it back to the likely owner.
```

## Ready-to-copy prompt: bugfix

```text
The QA loop found a failure.

Read:
- AGENTS.md
- project/work-orders/state.json
- project/work-orders/bugfix.md
- project/modules/<module-name>/handoff.md
- the exact files named by QA

Do not scan the full repo.
Fix only the reported issue.
Do not expand scope.
Run the failing command again, then run pnpm check:project if appropriate.
Update the handoff payload with the scripts run and result.
```

## Practical example: from idea to first feature

Example idea:

```text
I want a SaaS app for service companies to track work requests. Managers create
requests, assign them to team members, and track status.
```

Step 1: Fill project files.

```text
project/PROJECT.md
project/UI.md
project/MODULES.md
project/CONTEXT.md
```

Step 2: Choose MVP modules.

```text
dashboard
requests
settings
```

Step 3: Generate the first module.

```bash
pnpm new:module requests
```

Step 4: Ask the AI to fill module contracts.

Use the module generation prompt above.

Step 5: Create a work order.

```bash
pnpm new:work-order WO-0001 requests contract-only
```

Step 6: Ask the AI to implement or refine the work order.

Use the feature development prompt above.

Step 7: Validate.

```bash
pnpm check:project
```

Step 8: If validation fails, use the bugfix prompt.

## Final checklist before asking AI to code

You are ready to start AI-assisted code generation when:

- `project/PROJECT.md` explains the app, users, MVP and out-of-scope items.
- `project/UI.md` lists the important pages and UI expectations.
- `project/MODULES.md` lists 2 to 5 MVP modules.
- `project/CONTEXT.md` summarizes the project in a short form.
- The first module has been generated with `pnpm new:module <module-name>`.
- The active work order was created with `pnpm new:work-order`.
- `pnpm check:task` passes.

If you are unsure, ask the AI to review only these project-owner files first.
That is usually cheaper, safer and faster than asking it to build immediately.
