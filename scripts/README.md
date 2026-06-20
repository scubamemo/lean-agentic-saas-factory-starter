# Scripts

This starter intentionally keeps scripts lightweight.

## Commands

```bash
pnpm check:factory
pnpm check:task
pnpm check:project
pnpm new:module <module-name>
pnpm new:work-order <WO-0001> <module-name> [task-type]
pnpm export:template
```

## Design goal

Use scripts to catch obvious drift without rebuilding the heavy v10 registry/sidecar system.
