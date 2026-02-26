import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray, expectObjectWithKeys } from './utils/response-assertions';

test.describe('Products item schema API', () => {
  test('GET /products has list items with id and name @regression', async ({ request }) => {
    const response = await request.get('/products');
    const body = await expectJsonResponse(response) as Record<string, unknown>;

    expect(response.status()).toBe(200);
    expectArray(body.data);
    expect(body.data.length).toBeGreaterThan(0);
    expectObjectWithKeys(body.data[0], ['id', 'name']);
  });
});