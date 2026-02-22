# Prompt: Playwright MCP API Automation Setup (TypeScript)

## Role
You are an automation engineer agent using Playwright MCP tools.

## Objective
Set up Playwright API testing from scratch in this local repository, then scaffold API test automation for https://practicesoftwaretesting.com/ using TypeScript and Playwright community best practices.

## Verified Findings (Input Data)
- Website: https://practicesoftwaretesting.com/
- API docs/source analyzed: https://api.practicesoftwaretesting.com/docs
- OpenAPI version: 3.0.0
- API title/version: Toolshop API v5.0.0
- Total implemented API operations: **73**
- Method distribution:
	- GET: 35
	- POST: 18
	- PUT: 8
	- PATCH: 5
	- DELETE: 7

Use these findings as the baseline for the automation scope.

## Required Tasks
1. Initialize Playwright test framework locally (from scratch) with TypeScript support.
2. Configure project for API testing (not UI E2E):
	 - Use `@playwright/test`
	 - Add reusable `request` context strategy
	 - Add environment-based base URL handling
	 - Add clean npm scripts to run API tests
3. Create a dedicated folder for API test scripts.
4. Implement **exactly 5 API test scripts** for **positive scenarios**.
5. Follow Playwright-recommended and community-accepted best practices.

## Folder and File Expectations
Create (or align to) this structure:
- `tests/api/`
	- `health.spec.ts`
	- `products-list.spec.ts`
	- `product-details.spec.ts`
	- `brands-list.spec.ts`
	- `categories-list.spec.ts`
- `playwright.config.ts` (API-focused config)
- Optional reusable helpers/fixtures under `tests/api/utils/` only if needed.

## Test Scenario Requirements (Positive Only)
Implement these 5 positive flows:
1. Health check / API availability returns success.
2. Get products list returns 200 and non-empty data.
3. Get product details by valid product id returns 200 and expected schema keys.
4. Get brands list returns 200 and valid collection.
5. Get categories list returns 200 and valid collection.

Each script must include:
- clear test titles
- status code assertions
- response shape/content assertions
- deterministic checks (avoid flaky/random assertions)

## Best Practices to Enforce
- Keep tests independent and idempotent.
- Use `test.describe` and descriptive naming.
- Centralize base URL and common headers.
- Avoid hard-coded magic values where reusable constants make sense.
- Prefer APIRequestContext via Playwright fixtures.
- Keep one primary behavior per test.
- Ensure clean error messages on assertion failure.

## Constraints
- TypeScript only.
- Positive scenarios only (no negative tests).
- Create only the required 5 API scripts.
- Do not add UI/browser interaction tests.
- Do not introduce unnecessary libraries beyond Playwright and minimal tooling.

## Execution Commands (Expected)
Provide and validate scripts similar to:
- `npm run test:api`
- `npx playwright test tests/api`

## Acceptance Criteria
- Playwright is fully set up locally for API testing.
- `tests/api` folder exists.
- Exactly 5 positive API `.spec.ts` files are present.
- Tests compile and are runnable via npm script.
- Assertions are meaningful and stable.

## Output Format Required from Agent
Return a concise implementation summary including:
1. Files created/updated
2. Commands executed
3. Test cases implemented
4. Any assumptions made (e.g., endpoint paths or sample IDs)

