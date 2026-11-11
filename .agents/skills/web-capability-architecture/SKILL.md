---
name: web-capability-architecture
description: >-
  Design, review, or implement a web application's feature and data foundation
  around domain capabilities, explicit integrations, and validated contracts.
  Use before structuring a new web app or major frontend area, adding a workflow
  that spans routes and data, integrating a real API, or replacing fixture-backed
  behavior—even when the request names only a page or component.
---

# Web Capability Architecture

Use this skill to turn product journeys into maintainable web implementation
boundaries. It complements broader product or system architecture work: do not
replace a repository's existing architecture, terminology, or approved decisions
with a structure copied from another project.

## Discover before designing

1. Read the target repository's agent instructions, architecture decisions,
   domain documentation, route tree, data-access code, form conventions, API
   contracts, and test setup.
2. Separate verified behavior and contracts from assumptions, prototypes, and
   open questions. Inspect the actual API specification or server implementation
   before proposing wire types or operations.
3. Identify the user journey and the capability that owns it. A route, component,
   tab, or folder is not automatically a domain boundary. Give each route or
   screen one primary intent, and split flows when their intent, permissions,
   risk, lifecycle, or completion state differs.
4. Record non-trivial architecture or dependency choices in the target project's
   existing decision format before implementation. Ask only when an unresolved
   choice materially affects product behavior, security, or ownership.

## Establish one-way implementation boundaries

Use the repository's naming conventions, but keep these responsibilities
discoverable and dependencies one-way:

```text
route/composition → capability feature → named capability data source → shared transport
                           ↘ domain models ↗
data source: wire schema → validation → mapping → domain result
```

- **Routes and composition** select the journey, load/compose its data, and wire
  feature UI. Keep business rules and transport details out of route components.
- **Capability features** own their presentation, interaction state, and
  orchestration. They use named data-source operations; they do not call the
  generic HTTP transport directly or reach into another feature's internal data
  implementation.
- **Capability data sources** own explicit operations and the boundary to a
  backend or external service. Keep operation-specific request/response
  contracts, runtime schemas, error mapping, and wire-to-domain mappers beside
  the capability that owns them.
- **Domain models** express application concepts and invariants independently of
  the UI framework and transport format. Keep backend naming and optional/null
  quirks behind the mapper.
- **Shared core** contains genuinely reusable platform primitives such as HTTP
  transport, configuration, and logging. It must not depend on app-specific
  features or data sources.

Do not create a parallel HTTP client when an existing shared client meets the
requirements. Do not preserve a flawed abstraction merely because it exists:
inspect it, record any material change, and keep capability policy outside
generic transport. Avoid catch-all `services` aggregators, schema-driven generic
request facades, and feature-to-feature data dependencies that hide ownership.

## Make integrations explicit and trustworthy

- Model each operation as a named command or query with explicit method, path,
  allowed parameters, request type, response type, authorization, and error
  behavior. Never forward arbitrary incoming paths, headers, cookies, bodies,
  or request options to a backend.
- Treat network data as untrusted even when static types exist. Validate it at
  the boundary with the target project's approved runtime validator, then map it
  into domain data before application logic or rendering. Keep malformed,
  missing, and unknown values distinguishable; do not turn unexpected errors
  into a convenient success or a misleading not-found state.
- Confirm field names, null/absence semantics, status codes, error codes,
  permissions, and side effects from the authoritative contract. Do not invent
  endpoints, enums, business rules, or operational limits to complete a UI.
- Choose server-side or browser-side execution deliberately based on identity,
  secrets, SEO, caching, and interaction needs. Keep credentials server-only,
  use named typed configuration, and avoid implicit production origins or
  fallback targets. Request-specific state must not leak through shared globals
  or public caches.
- Make timeout, cancellation, response limits, redirect behavior, and retry
  policy explicit where relevant. Do not retry writes or ambiguous outcomes
  without an idempotency and recovery contract.
- Fixtures and mocks belong only to explicitly isolated tests, demos, or
  prototypes. Do not silently substitute them for live data on an application
  route or present simulated completion as a real backend result.

## Keep forms and journeys cohesive

- Follow the target repository's approved form-state and runtime-validation
  libraries. If none are established, record the choice before introducing one;
  do not impose another project's library pair.
- Keep form validation and wire-to-domain mapping separate. Provide field and
  cross-field errors, submission state, safe server-error mapping, and explicit
  success/failure states. Client validation improves feedback but never replaces
  server-side validation or authorization.
- Implement a thin, testable vertical slice from entry through a truthful
  completion or recovery state. Include loading, empty, validation, denied,
  unavailable, and retry/recovery states where applicable. Do not link a real
  result to a still-mocked next step as if the journey were complete.
- Migrate prototypes incrementally. Preserve existing behavior unless a change
  is approved, and make incomplete capabilities visibly unavailable rather than
  inventing their behavior.

## Validation plan

Use the target repository's test and quality standards. At minimum, consider:

- unit tests for domain invariants, schemas, and mappers;
- data-source tests for serialization, boundary validation, and error mapping;
- integration tests against locally runnable dependencies and the real local
  service/API when available; fake only external services that cannot run
  locally, at their protocol boundary;
- browser tests for critical success, unavailable, authorization, and recovery
  paths;
- the repository's full format, lint, build, and test gates.

Do not treat mocked response tests as proof of compatibility with a local backend
or database.

## Expected design output

For a planning or architecture request, return a concise, repository-specific
proposal containing:

1. Verified constraints and existing decisions.
2. Capability-to-journey and route/screen responsibilities.
3. Module boundaries and dependency direction.
4. Named data operations, contracts, validation/mapping, and server/browser
   execution boundaries.
5. Form and state approach consistent with the target project.
6. Vertical implementation slices and their tests.
7. Open questions, assumptions, and explicit non-goals.

For a small implementation request, keep the same checks proportional and avoid
expanding the task into a platform rewrite.

## Review checklist

- Does each route or screen have one primary intent?
- Does each feature own one coherent capability rather than a page-shaped mix of
  unrelated jobs?
- Are UI, domain, data-source, and shared transport responsibilities separated?
- Is every external response validated and mapped before domain/UI use?
- Are operations, authorization, configuration, failures, and retry semantics
  explicit?
- Are mocks isolated from real application behavior?
- Are form libraries, contracts, and business rules taken from the target
  project's decisions rather than invented here?
- Does the test plan cover the actual integration boundary and critical journey?

If a boundary is unclear, resolve ownership and contract questions before adding
more routes or extracting presentation components.
