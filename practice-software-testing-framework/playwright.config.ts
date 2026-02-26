import { defineConfig } from '@playwright/test';

const uiProdBaseURL = process.env.UI_BASE_URL ?? 'https://www.practicesoftwaretesting.com';
const uiLocalBaseURL = process.env.LOCAL_UI_BASE_URL ?? 'http://localhost:4200';
const apiBaseURL = process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com';

export default defineConfig({
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'ui-prod',
      testDir: './tests/ui',
      use: { baseURL: uiProdBaseURL },
    },
    {
      name: 'ui-local',
      testDir: './tests/ui',
      use: { baseURL: uiLocalBaseURL },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: apiBaseURL,
        extraHTTPHeaders: {
          Accept: 'application/json',
        },
      },
    },
  ],
});
