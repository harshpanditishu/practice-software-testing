import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray } from './utils/response-assertions';

test.describe('Products request headers API', () => {
  test('GET /products succeeds with explicit Accept header @regression', async ({ request }) => {
    const response = await request.get('/products', {
      headers: {
        Accept: 'application/json',
      },
    });

    const body = await expectJsonResponse(response) as Record<string, unknown>;
    expect(response.status()).toBe(200);
    expectArray(body.data);
  });
});