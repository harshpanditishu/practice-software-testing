import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray } from './utils/response-assertions';

test.describe('Products metadata API', () => {
  test('GET /products returns pagination metadata and data array @regression', async ({ request }) => {
    const response = await request.get('/products');
    const body = await expectJsonResponse(response) as Record<string, unknown>;

    expect(response.status()).toBe(200);
    expect(body.current_page).toBeDefined();
    expect(body.total).toBeDefined();
    expectArray(body.data);
  });
});