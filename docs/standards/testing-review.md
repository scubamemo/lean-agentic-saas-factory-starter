# Testing and Review Standard

Minimum per feature:

- acceptance criteria mapped in `test-matrix.md`,
- API/data/permission checks for backend changes,
- UI state checks for frontend changes,
- regression note for every bugfix,
- reviewer result in module handoff.


## Extended quality bars

Use these standards for detailed QA and review decisions:

```text
docs/standards/testing-quality-bar.md
docs/standards/code-review-quality-bar.md
docs/standards/software-craftsmanship.md
```

QA must reject features that only prove happy paths when permission, tenant, error, validation, UI-state or migration risks are relevant.

Code Reviewer must evaluate architecture boundaries, SOLID/craftsmanship, duplication, test evidence, design-system compliance and performance risk before release.
