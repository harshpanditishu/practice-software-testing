# OpenAPI API Test Suite

This folder adds comprehensive API coverage for documented endpoints **without changing existing tests** in `tests/api`.

## What this suite adds

- `openapi-uncovered-operations.spec.ts`
  - Iterates all OpenAPI operations from `tests/api/apiDocumentation/apiDocumentation.json`.
  - Excludes legacy-covered operations already tested by existing suites.
  - Executes each uncovered operation with generated request data.
  - Validates responses against documented and common negative status ranges.

- `openapi-common-scenarios.spec.ts`
  - Adds widely-used positive and negative scenarios:
    - product listing/detail positive + invalid-id negative
    - brands/category search/tree checks
    - auth-negative checks
    - cart lifecycle scenario
    - payment positive/negative validation checks

## Run commands

From `practice-software-testing-framework`:

- Run only OpenAPI suite:
  - `npx playwright test tests/api/openapi --project=api`

- Run all API tests (legacy + openapi):
  - `npx playwright test tests/api --project=api`

## Notes

- Existing tests are untouched.
- This setup is designed to scale with future OpenAPI endpoint additions.
- If the API contract changes, update `openapi-helpers.ts` request generation defaults.
