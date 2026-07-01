# Global Agent Rules

## Always

- Work from the active work order.
- Read compact context first: `project/CONTEXT.md` and module `context.md`.
- Keep changes inside allowed paths.
- Update contracts and handoff when behavior changes.
- Prefer small, complete tasks over broad refactors.
- Use module docs before reading code.
- **Script-first execution**: Run automated check scripts before performing manual code reviews.
- **Hash-based standard verification**: Use the hash-based checks with `template-structure-cache.json` to bypass reading full standards unless needed.

## Never by default

- Full repo scan.
- Frontend/backend implementation cross-reading.
- Changing factory standards during product feature work.
- Inventing product behavior when requirements are unclear.
- Reading broad `docs/**` when a module contract answers the question.

## Efficiency and Model Tiering

- Run local scripts first to minimize context usage.
- Prefer `Tier 2` models for simple implementation tasks to save reasoning tokens.
- Maintain rolling summaries in `history-summary.json` instead of reading old handoff histories.

## Escalation allowed

Escalate in `handoff.md` when requirements are unclear, security-sensitive or likely to cause breaking changes.
