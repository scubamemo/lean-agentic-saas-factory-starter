# Scripts

This starter intentionally keeps scripts lightweight.

## Commands

```bash
pnpm check:factory
pnpm check:task
pnpm check:project
pnpm check:dependencies
pnpm check:quality
pnpm check:security
pnpm new:module <module-name>
pnpm new:work-order <WO-0001> <module-name> [task-type]
pnpm export:template
pnpm export:tool-adapter
```

`pnpm` is the pinned package manager for this repository. Root factory
validation is implemented with local Node scripts, so `npm run check:factory`
can also run after dependencies are installed. Full project checks use pnpm so
backend and frontend package checks follow the committed lockfile.

## Design goal

Use scripts to catch obvious drift without rebuilding the heavy v10 registry/sidecar system.


## Engineering quality gates

```bash
node scripts/check-quality-gates.mjs
```

Performs lightweight structural checks for engineering excellence without asking agents to read the full repository: required standards exist, module contracts contain quality sections, `test-matrix.md` has evidence structure, `handoff.md` records checks, and component/catalog rules remain enforced.
