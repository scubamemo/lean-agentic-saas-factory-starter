# Testing Quality Bar

This standard prevents agents from satisfying QA with only happy-path checks.

## Source of truth

Each module must maintain:

```text
project/modules/<module>/test-matrix.md
```

`test-matrix.md` is the source of test expectations. Every acceptance criteria maps to at least one test row. No feature may be marked complete unless every acceptance criteria maps to at least one test row with evidence, or the row is explicitly deferred by PM with a reason.

Every test-matrix row must identify:

- requirement id;
- acceptance criteria;
- test type;
- expected test file;
- status;
- owner.

Valid status values are:

```text
planned
pass
fail
deferred-with-pm-approval
not-applicable-with-reason
```

`pass` requires reproducible evidence: command run, test file path, and the
contract or requirement covered.

## Minimum coverage expectations

### Backend-impacting work

Include applicable evidence for:

- happy path,
- validation error,
- permission error,
- tenant isolation,
- not found,
- conflict,
- pagination/filter behavior,
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

## QA pass/fail rule

QA cannot mark pass unless `test-matrix.md` is satisfied.

QA must fail or block the work when:

- any acceptance criteria has no mapped test row;
- any required backend or frontend scenario is missing without a justified
  `not-applicable-with-reason`;
- any required row remains `planned` or `fail`;
- evidence is not reproducible;
- the expected test file is missing or not named;
- PM deferral is claimed without an explicit PM-approved reason.

QA may pass only when all applicable rows are `pass` or explicitly
`deferred-with-pm-approval`/`not-applicable-with-reason`.

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

## Test design quality

Tests should protect behavior, not implementation trivia.

Prefer tests that:

- assert contract-visible behavior and stable error codes;
- cover one reason for failure per test;
- use readable setup data with fake/example values only;
- keep tenant, actor, role, and permission context explicit;
- avoid sleeps, network calls, order-dependent fixtures, and hidden shared state;
- fail with enough message/context for QA to route the bugfix owner.

Avoid tests that:

- only snapshot large payloads without behavioral assertions;
- duplicate production logic in assertions;
- depend on generated folder contents unless the script explicitly validates generated output;
- require full-repo scans or broad historical markdown context.
