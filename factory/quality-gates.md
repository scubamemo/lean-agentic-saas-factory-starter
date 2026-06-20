# Quality Gates

Use these gates as a practical checklist, not bureaucracy.

## Ready to code

- `project/CONTEXT.md` contains enough product/UI/module context for the task.
- Active work order exists.
- Target module exists.
- Allowed read/write paths are clear.
- Acceptance criteria are clear.
- Context mode is small or medium for implementation work.

## Ready for handoff

- Contracts updated when behavior changed.
- Implementation stayed inside allowed paths.
- Tests/checks documented.
- Blockers and risks documented.
- Next owner is named.
- `handoff.md` lists files read and changed.

## Ready for done

- No open blocking questions.
- Test matrix has evidence or explicit planned gaps.
- Reviewer result is PASS or PASS_WITH_WARNINGS.
- Tenant/security implications reviewed when relevant.

## Escalate instead of coding

- Large task with unclear module boundaries.
- Public API breaking change.
- Tenant isolation or permission model change.
- Destructive migration or data backfill.
- Product behavior not specified by project/module docs.


## V13 lightweight gates

- Run `pnpm check:task` before implementation.
- Run `pnpm check:project` before marking production-ready work as done.
- Handoffs must include State Transition DTOs.
- QA and Reviewer must not fix implementation failures; they route feedback DTOs back to the original developer.
- Data model changes touching Prisma must be owned or approved by Data Engineer.
