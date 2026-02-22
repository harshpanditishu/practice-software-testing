import { defineConfig } from '@playwright/test';

const baseURL = process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com';

export default defineConfig({
  testDir: './tests/api',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
});
