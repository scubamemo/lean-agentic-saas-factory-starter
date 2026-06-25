# SaaS Factory Walkthrough

Subtitle: a practical, non-technical guide for using this repository with an AI
coding assistant.

This document is written for a project owner, founder, product lead or business
operator. It can be handed to someone who has a SaaS idea but does not write
code every day.

This is documentation only. It is not an agent source of truth and it is not
required operational context for coding agents. Agents should continue to follow
`AGENTS.md`, `.agents/**`, `project/work-orders/state.json` and the module
contracts.

## 1. What this repository is

This repository is a generic SaaS factory starter. It gives you a structured
way to turn a SaaS idea into a real application with help from AI coding tools.

It includes:

- a backend starter,
- a frontend starter,
- reusable project definition files,
- module templates,
- validation scripts,
- work-order files,
- QA and bugfix feedback loops,
- contract-first documentation so AI can build smaller pieces safely.

It is not a finished product. It is a factory for creating products.

The factory stays domain-neutral. Your future SaaS can be about operations,
compliance, bookings, analytics, workflows, support, education, internal tools
or another B2B process. The business domain belongs in your project files, not
inside the factory rules.

## 2. Your job as the project owner

You do not need to design the database or write code first.

Your responsibilities are to explain:

- what problem the SaaS solves,
- who uses it,
- what the first version must include,
- what should not be built yet,
- which screens are needed,
- which user roles exist,
- what each role can do,
- which features matter first,
- how you will know each feature works.

The AI coding assistant works best when your product instructions are concrete.
If you give it vague goals, it will guess. Guessing is where expensive rework
usually begins.

## 3. What not to touch

As a non-technical project owner, start with project definition files only.

Do not edit these areas unless a technical collaborator or AI work order
specifically asks for it:

- `backend/`
- `frontend/`
- `packages/`
- `scripts/`
- `.agents/`
- `docs/standards/`
- `project/work-orders/state.json`
- generated build folders such as `dist/`, `build/`, `.next/` or `coverage/`

Why: those files control implementation, validation, security boundaries and AI
coordination. Small accidental edits there can cause confusing failures.

## 4. The first files to fill

Start with these files:

```text
project/PROJECT.md
project/UI.md
project/MODULES.md
project/CONTEXT.md
```

Use them like this:

| File | Purpose | Who fills it |
|---|---|---|
| `project/PROJECT.md` | Product idea, users, MVP, out-of-scope items, roles and requirements | Project owner |
| `project/UI.md` | Screens, layout, navigation and UX expectations | Project owner with AI help |
| `project/MODULES.md` | Main parts of the app and build priority | Project owner with AI help |
| `project/CONTEXT.md` | Short summary the AI can read quickly | Project owner or AI after the above files are clear |

Keep these files readable. They are the product brief.

## 5. Required project definitions

Before asking AI to generate code, define these items.

### Product name

Use a real name or a working name.

Good:

```text
Name: TeamPermit
```

Not useful:

```text
Name: TBD
```

### One-line description

Explain the product in one sentence.

Good:

```text
TeamPermit helps service companies track permit requests, ownership, status and deadlines.
```

Weak:

```text
An AI-powered business platform.
```

### Primary users

Name the people who will log in.

Good:

```text
Operations managers, coordinators, field supervisors and tenant admins.
```

Weak:

```text
Everyone.
```

### Main problem solved

Describe the pain in plain language.

Good:

```text
Teams lose time because permit status, owners and due dates are scattered across email and spreadsheets.
```

Weak:

```text
It improves productivity.
```

## 6. TBD fields

`TBD` means “to be decided.”

It is fine for the starter to contain `TBD` fields before you customize it. But
before asking AI to build a feature, replace the relevant `TBD` values with one
of these:

- a concrete answer,
- `Not needed for MVP`,
- a clear open question.

Good:

```text
Integrations: Not needed for MVP.
```

Good:

```text
Open question: Should tenant admins invite users by email, or should users be created manually for MVP?
```

Bad:

```text
Integrations: TBD
Open questions: TBD
```

Why this matters: AI cannot know whether `TBD` means unknown, unimportant or
forgotten.

## 7. Defining the MVP

MVP means “minimum viable product.” It is the smallest version that solves the
core problem for a real user.

Good MVP scope:

```text
- Tenant admins can invite users.
- Users can create, view, update and archive records.
- Users can assign records to teammates.
- Users can filter records by status and due date.
- Users can see basic dashboard counts.
```

Too large for a first MVP:

```text
- Native mobile apps
- Payments
- AI assistant
- Advanced reporting
- Multiple third-party integrations
- Custom workflow builder
```

A strong MVP is not tiny because you lack ambition. It is focused because focus
makes the first product easier to finish, test and improve.

## 8. Defining out-of-scope items

Out-of-scope means “do not build this yet.”

This section is as important as the MVP section. It protects the AI from
overbuilding.

Good:

```text
- Native mobile app is out of scope for MVP.
- Payment billing is out of scope for MVP.
- External integrations are out of scope for MVP.
- Advanced analytics are out of scope for MVP.
```

Bad:

```text
Nothing is out of scope.
```

## 9. Defining phases

Phases help you plan the product beyond MVP without asking AI to build
everything at once.

Example:

```text
Phase 1: MVP
- Authentication and tenant basics
- Main records module
- Simple dashboard
- Basic tenant settings

Phase 2: Workflow improvements
- Notifications
- Activity timeline
- Advanced filters

Phase 3: Reporting and integrations
- Export reports
- External integrations
- Advanced analytics
```

Keep Phase 1 small. Put exciting but non-essential ideas into later phases.

## 10. Roles and permissions

Roles define what different users can do.

Start with the baseline roles unless your product truly needs more:

| Role | Meaning |
|---|---|
| `SuperAdmin` | Platform owner or support user. Can manage tenants and support customers. |
| `TenantAdmin` | Admin for one customer organization. Can manage tenant settings and users. |
| `User` | Regular user inside one tenant organization. Can use assigned features. |

Add extra roles only when permissions are genuinely different.

Good:

```text
Manager: can create records, assign work and view team-level summaries.
User: can update records assigned to them.
```

Bad:

```text
Admin, Owner, Manager, Supervisor, Staff, Editor, Operator, Viewer
```

Why bad: too many unclear roles make the app harder to build and test.

## 11. UI requirements

Use `project/UI.md` to describe screens and experience.

Cover:

- application feel,
- routes/pages,
- navigation,
- layout,
- mobile behavior,
- tables and lists,
- forms,
- loading states,
- empty states,
- error states,
- forbidden/no-permission states,
- destructive action confirmations.

Good UI direction:

```text
Modern B2B SaaS. Desktop-first admin layout with a left sidebar. Tables should
support loading, empty and error states. Forms should show field-level
validation messages. Destructive actions require confirmation.
```

Weak UI direction:

```text
Make it beautiful.
```

## 12. Modules

Modules are the major product areas. A module usually has its own screens,
data, permissions and tests.

Good MVP modules:

```text
dashboard
records
settings
```

Good module table:

```text
| Priority | Module | Pattern | Status | Notes |
|---|---|---|---|---|
| 1 | dashboard | Dashboard | planned | Summary cards and recent activity |
| 2 | records | CRUD | planned | Main business records with owner, status and due date |
| 3 | settings | Settings | planned | Tenant users and tenant settings |
```

Bad modules:

```text
everything
buttons
database
```

Why bad: those are either too broad or too technical.

For a first MVP, aim for 2 to 5 modules.

## 13. Features

A feature is something a user can do.

Good:

```text
Feature: Create a record
User: Tenant user
Description: A user can create a record with title, owner, status and due date.
```

Bad:

```text
Feature: Database layer
```

Why bad: that is implementation detail, not a user action.

## 14. Acceptance criteria

Acceptance criteria define what “done” means.

Good acceptance criteria are specific and testable:

```text
Feature: Create a record

Acceptance criteria:
- A user can open the create form from the records list.
- Title is required.
- Due date is optional.
- Saving creates the record in the current tenant only.
- After save, the user lands on the record detail page.
- Missing required fields show validation messages.
- A user without permission cannot create a record.
```

Weak:

```text
- Works well.
- Looks good.
- Handles edge cases.
```

The AI and QA need concrete checks, not vibes. Vibes are lovely; tests are what
keep the app from eating its own shoelaces.

## 15. Work state: `state.json`

The file `project/work-orders/state.json` is the source of truth for active work.

It tracks:

- current work order,
- module,
- task type,
- status,
- next owner,
- validation gates,
- approval flags,
- compact role-specific updates.

Project owners normally should not edit this file by hand. Use the work-order
script or ask the AI to update it carefully.

Important rule:

```text
state.json is the workflow source of truth.
```

Do not rely on random markdown notes or chat history to decide what state the
project is in.

## 16. Active work-order mirror

The file `project/work-orders/active-work-order.md` is a human-readable mirror
of `state.json`.

Use it to understand the active task. Do not treat it as more authoritative than
`state.json`.

Simple mental model:

```text
state.json = source of truth for automation
active-work-order.md = readable summary for humans
```

If the two disagree, `state.json` wins.

## 17. Generating a module

After defining modules in `project/MODULES.md`, generate one module at a time.

Command:

```bash
pnpm new:module records
```

Use kebab-case names:

Good:

```text
records
tenant-settings
team-activity
```

Bad:

```text
RecordsModule
Record Management
records_module
```

The command creates:

```text
project/modules/<module-name>/
packages/contracts/specs/<module-name>.spec.json
```

The module folder contains human-readable contracts for API behavior, UI
behavior, data shapes, permissions, test expectations and handoff notes.

## 18. Creating a work order

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

Keep work orders small. One focused module or feature at a time is easier to
validate than a giant “build everything” request.

## 19. Validation scripts

Validation scripts are safety rails. They check that the factory structure,
contracts, dependencies, security rules and builds are still healthy.

Run from the repository root.

Before work:

```bash
pnpm check:task
```

After AI changes:

```bash
pnpm check:project
```

If validation fails, copy the exact terminal output and ask the AI to fix only
the failing issue.

Good request:

```text
`pnpm check:project` failed with this output:

<paste terminal output>

Fix only the failing issue. Do not scan the full repo. Preserve current module contracts.
```

Bad request:

```text
Something is broken. Look everywhere and fix everything.
```

## 20. QA loop

QA checks whether the feature satisfies the test matrix and validation scripts.

QA should:

- run the relevant checks,
- compare results to `test-matrix.md`,
- record exact failures,
- identify the likely owner,
- route the issue back to the original developer role.

QA should not directly fix implementation code.

Simple loop:

```text
Developer implements -> QA checks -> QA reports failure -> original owner fixes -> QA checks again
```

## 21. Bugfix loop

When QA finds a bug, the project should not become a free-for-all.

The bugfix flow should capture:

- command run,
- stdout/stderr or concise failure output,
- failing test name,
- failing file and line if available,
- suspected owner,
- related contract or test-matrix row,
- next action.

Use `project/work-orders/bugfix.md` for structured bugfix context.

Good bugfix instruction:

```text
Fix the validation failure reported in project/work-orders/bugfix.md.
Read only the files named in the bugfix payload and the target module contracts.
Do not expand scope.
Run the failing command again after the fix.
```

## 22. How to ask AI to start

Use a focused prompt.

```text
Read:
- AGENTS.md
- PROJECT-OWNER-README.md
- docs/walkthrough/README.md
- project/PROJECT.md
- project/UI.md
- project/MODULES.md
- project/CONTEXT.md

Do not scan the full repo.
Do not edit backend, frontend, packages, scripts or .agents.

Help me prepare the SaaS project definition for code generation.
Replace relevant TBD fields with concrete decisions or clear open questions.
Keep the MVP small and mark out-of-scope items clearly.
```

After the project definition is ready:

```text
Generate or refine the `<module-name>` module contracts.
Read only the target module folder, project/CONTEXT.md and the project definition files.
Do not implement backend or frontend code until contracts are ready.
```

## 23. Exporting this walkthrough to PDF or DOCX

This file is plain Markdown so it can be exported to PDF or DOCX by external
tools such as a document editor, Markdown exporter or publishing workflow.

Do not make exported PDF/DOCX files required by `factory-check`.

Recommended approach:

1. Keep `docs/walkthrough/README.md` as the editable source.
2. Export a PDF or DOCX only when you need to share it with a stakeholder.
3. Do not treat exported files as source of truth.

## 24. Final checklist for a project owner

You are ready to begin AI-assisted code generation when:

- `project/PROJECT.md` has a clear product description, users, MVP and
  out-of-scope section.
- `project/UI.md` lists the important screens and UI expectations.
- `project/MODULES.md` lists the first 2 to 5 modules.
- `project/CONTEXT.md` summarizes the project in a compact way.
- Relevant `TBD` fields are replaced with decisions, “Not needed for MVP,” or
  clear open questions.
- The first module has been generated with `pnpm new:module <module-name>`.
- A focused work order exists.
- `pnpm check:task` passes.

If unsure, ask AI to review the project definition files before generating code.
That small pause often saves hours later.
