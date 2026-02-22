import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray, expectObjectWithKeys } from './utils/response-assertions';

test.describe('Categories values API', () => {
  test('GET /categories first item has non-empty name and slug @regression', async ({ request }) => {
    const response = await request.get('/categories');
    const body = await expectJsonResponse(response);

    expect(response.status()).toBe(200);
    expectArray(body);
    expect(body.length).toBeGreaterThan(0);

    const first = body[0] as Record<string, unknown>;
    expectObjectWithKeys(first, ['id', 'name', 'slug']);
    expect(String(first.name).trim().length).toBeGreaterThan(0);
    expect(String(first.slug).trim().length).toBeGreaterThan(0);
  });
});