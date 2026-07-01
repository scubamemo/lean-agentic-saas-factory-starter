# Software Craftsmanship Standard

This standard defines the engineering quality bar for generated code. It is intentionally compact so agents can apply it without reading large books or scanning the whole repository.

## Non-negotiable principles

Generated code must optimize for correctness, clarity, testability, and maintainability before cleverness.

Use these principles in this order:

1. **Correctness**: behavior matches `api.contract.md`, `ui.contract.md`, `dto.md`, `data-model.md`, `permissions.md`, and `test-matrix.md`.
2. **Simplicity**: prefer the simplest design that satisfies current requirements.
3. **Explicit boundaries**: keep application requirements, API, UI, persistence, integration, and test concerns separated.
4. **High cohesion / low coupling**: related logic should live together; unrelated modules must communicate through contracts.
5. **Testability**: business decisions must be easy to test without booting unrelated systems.
6. **Observability**: important failures and security-sensitive actions must be diagnosable.
7. **No speculative abstraction**: do not add patterns for hypothetical future requirements.

## SOLID, interpreted pragmatically

### Single Responsibility

A class, function, component, or service should have one reason to change.

Split when a unit mixes several of these concerns:

- HTTP transport / routing
- validation / parsing
- business rule decisions
- persistence queries
- external API calls
- formatting response DTOs
- audit logging / notification side effects

### Open / Closed

Extend behavior through small, named strategies only when variation is already visible in requirements or contracts. Do not create strategy hierarchies for a single implementation.

### Liskov Substitution

If using polymorphism or interfaces, implementations must honor the same input/output guarantees, error behavior, and tenant/security constraints.

### Interface Segregation

Expose narrow interfaces. A service, hook, or port should not force callers to depend on methods they do not use.

### Dependency Inversion

Business logic must not depend directly on SDK clients, HTTP libraries, database clients, or UI framework details when the dependency is volatile or external. Use a narrow adapter/port boundary.

## DRY, KISS, YAGNI

- **DRY**: remove duplicated business logic and public data structures; do not over-abstract harmless repetition.
- **KISS**: prefer straightforward names, small files, small functions, and direct control flow.
- **YAGNI**: do not add extension points, factories, providers, queues, global state, or plugin systems until requirements demand them.

## Function and class quality

A unit should generally be small enough that its purpose is obvious from the name and tests.

Flag for refactor when:

- a function mixes more than one layer of responsibility,
- a method requires many unrelated parameters,
- control flow has deeply nested branches,
- errors are swallowed or converted into ambiguous messages,
- code repeats the same rule in more than one module,
- names describe implementation details instead of domain meaning.

## Typed interfaces and contract seams

Typed interfaces are required at boundaries, not everywhere as ceremony.

Use explicit types for:

- public DTOs and events exported through `packages/contracts/`;
- API request and response shapes;
- service/use-case inputs and outputs when they cross a module boundary;
- adapter ports around external SDKs, storage, queues, email, payments, or AI providers;
- UI component props that are reusable or contract-driven.

Avoid broad `any`, loosely shaped objects, magic strings, and duplicated
interface definitions. If a type describes backend/frontend communication, it
belongs in `packages/contracts/` or a generated client derived from that
contract. Internal helper types can stay local when they do not leak across
module, app, or package boundaries.

## Testability and observability

Code is not senior-level if it works only when manually inspected.

Testability requirements:

- isolate business decisions from transport, persistence, and UI framework code;
- make tenant, permission, and actor context explicit inputs;
- keep functions deterministic where possible;
- use narrow adapters for external systems so tests can replace them;
- map tests to `test-matrix.md` acceptance criteria.

Observability requirements:

- preserve stable error codes for expected failures;
- log or trace security-sensitive actions through approved project mechanisms;
- include enough context to diagnose failures without exposing secrets or tenant data;
- avoid swallowing errors or converting them into vague messages;
- document operational risks in `handoff.md` when behavior is hard to observe.

## Pattern selection rules

Use patterns to reduce coupling, isolate volatility, or improve testability. Do not use patterns to make simple CRUD look sophisticated.

| Problem | Preferred pattern | Avoid |
|---|---|---|
| External provider or SDK | Adapter / Port | Calling SDK directly from business service |
| Multiple real business variations | Strategy | Strategy for one implementation |
| Complex object creation | Factory | Factory for simple DTO mapping |
| Cross-entity business rule | Domain service | Controller-level rule logic |
| Persistence abstraction needed | Repository / data-access service | Leaking query details into controller/UI |
| Command-style write flow | Command handler / use-case service | One huge service method with side effects everywhere |
| Side effects after a business action | Application/domain event | Hidden side effects inside unrelated services |
| Simple CRUD | Plain service + contract DTOs | Premature architecture layers |

Every non-trivial pattern must be justified in `handoff.md` under the implementation summary.

## Prohibited shortcuts

- Duplicating public DTOs outside `packages/contracts/`.
- Reading the opposite side implementation to infer behavior.
- Adding inline UI styles or unapproved CSS systems.
- Adding raw SQL without Data Engineer approval.
- Adding destructive migrations without backup and rollback notes.
- Returning untyped error strings where stable error codes are required.
- Marking work complete without evidence in `test-matrix.md`.

## Agent checklist

Before handoff, implementation agents must be able to answer:

```text
Does the code match the contracts?
Is the responsibility boundary clear?
Is there duplicated business logic or public DTO shape?
Are errors typed/stable enough for frontend and QA?
Is tenant isolation preserved?
Are tests mapped to acceptance criteria?
Is the design simpler than the alternatives?
```
