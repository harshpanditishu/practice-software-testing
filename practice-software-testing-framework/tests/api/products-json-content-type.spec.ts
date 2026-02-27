import { test, expect } from '@playwright/test';
import { expectJsonResponse } from './utils/response-assertions';

test.describe('Products content type API', () => {
  test('GET /products responds with application/json content type @regression', async ({ request }) => {
    const response = await request.get('/products');
    await expectJsonResponse(response);

    expect(response.status()).toBe(200);
    expect((response.headers()['content-type'] ?? '').toLowerCase()).toContain('application/json');
  });
});