# Global Agent Rules

## Always

- Work from the active work order.
- Read compact context first: `project/CONTEXT.md` and module `context.md`.
- Keep changes inside allowed paths.
- Update contracts and handoff when behavior changes.
- Prefer small, complete tasks over broad refactors.
- Use module docs before reading code.

## Never by default

- Full repo scan.
- Frontend/backend implementation cross-reading.
- Changing factory standards during product feature work.
- Inventing product behavior when requirements are unclear.
- Reading broad `docs/**` when a module contract answers the question.

## Escalation allowed

Escalate in `handoff.md` when requirements are unclear, security-sensitive or likely to cause breaking changes.
