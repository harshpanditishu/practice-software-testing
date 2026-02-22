# Playwright API Testing (Local Run)

This project includes API tests built with Playwright + TypeScript under `tests/api`.

## Prerequisites
- Node.js 18+
- npm

## Install dependencies
From the repository root:

```bash
npm install
```

## Run API tests
Run all API tests:

```bash
npm run test:api
```

Equivalent direct command:

```bash
npx playwright test tests/api
```

## Optional: Run headed

```bash
npm run test:api:headed
```

## Configure API base URL
By default, tests use:

- `https://api.practicesoftwaretesting.com`

To override for local/dev environments, set `API_BASE_URL` before running tests.

PowerShell example:

```powershell
$env:API_BASE_URL = "https://api.practicesoftwaretesting.com"
npm run test:api
```

## Current test coverage
- `health.spec.ts` (API availability via payment check)
- `products-list.spec.ts`
- `product-details.spec.ts`
- `brands-list.spec.ts`
- `categories-list.spec.ts`
