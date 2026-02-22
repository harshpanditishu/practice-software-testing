import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray } from './utils/response-assertions';

test.describe('Products API', () => {
  test('GET /products returns 200 and non-empty data collection @smoke', async ({ request }) => {
    const response = await request.get('/products');
    const body = await expectJsonResponse(response) as Record<string, unknown>;

    expect(response.status()).toBe(200);
    expect(body.current_page).toBeDefined();
    expectArray(body.data);
    expect(body.data.length).toBeGreaterThan(0);
  });
});
