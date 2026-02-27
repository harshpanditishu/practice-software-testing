import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray, expectObjectWithKeys } from './utils/response-assertions';

test.describe('Brands API', () => {
  test('GET /brands returns 200 and valid collection @smoke', async ({ request }) => {
    const response = await request.get('/brands');
    const body = await expectJsonResponse(response);

    expect(response.status()).toBe(200);
    expectArray(body);
    expect(body.length).toBeGreaterThan(0);
    expectObjectWithKeys(body[0], ['id', 'name', 'slug']);
  });
});
