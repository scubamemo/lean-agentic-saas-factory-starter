# Testing Quality Bar

This standard prevents agents from satisfying QA with only happy-path checks.

## Source of truth

Each module must maintain:

```text
project/modules/<module>/test-matrix.md
```

No feature may be marked complete unless each relevant acceptance criterion is mapped to test evidence or explicitly deferred by PM with a reason.

## Minimum coverage expectations

### Backend-impacting work

Include applicable evidence for:

- happy path,
- input validation failure,
- permission denied,
- tenant isolation,
- not found,
- conflict / duplicate,
- pagination/filter/sort,
- transaction or side-effect behavior,
- audit/superAdmin/impersonation behavior when touched.

### Frontend-impacting work

Include applicable evidence for:

- loading,
- empty,
- error,
- forbidden,
- success,
- form validation,
- destructive action confirmation,
- permission-limited UI,
- accessibility basics,
- responsive behavior when required.

### Data-model-impacting work

Include applicable evidence for:

- tenant-scoped uniqueness,
- indexes for expected query patterns,
- non-destructive migration path,
- backup/rollback note for destructive changes,
- seed/demo impact,
- contract compatibility.

## QA failure routing

QA and Code Reviewer must not fix implementation. On failure they must:

1. isolate the smallest failing command and output,
2. classify the failure,
3. update `validation_errors` in `state.json`,
4. update `project/work-orders/bugfix.md`,
5. route back to the responsible owner through a State Transition DTO.

## Evidence quality

Good evidence is short and reproducible:

```text
command run
status pass/fail
relevant stdout/stderr excerpt
linked requirement id
linked contract artifact
changed files or test file path
```

Avoid pasting long logs. Put only the reduced failure excerpt in `handoff.md` or `bugfix.md`.
