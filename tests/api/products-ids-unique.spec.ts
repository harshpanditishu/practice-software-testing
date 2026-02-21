import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray, expectObjectWithKeys } from './utils/response-assertions';

test.describe('Products identity API', () => {
  test('GET /products first page has unique product ids @regression', async ({ request }) => {
    const response = await request.get('/products');
    const body = await expectJsonResponse(response) as Record<string, unknown>;

    expect(response.status()).toBe(200);
    expectArray(body.data);
    expect(body.data.length).toBeGreaterThan(0);

    const ids = body.data.map((item) => {
      expectObjectWithKeys(item, ['id']);
      return String((item as Record<string, unknown>).id);
    });

    expect(new Set(ids).size).toBe(ids.length);
  });
});