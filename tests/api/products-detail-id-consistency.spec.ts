import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray, expectObjectWithKeys } from './utils/response-assertions';

test.describe('Products details consistency API', () => {
  test('GET /products/{id} id matches id selected from list @regression', async ({ request }) => {
    const listResponse = await request.get('/products');
    const listBody = await expectJsonResponse(listResponse) as Record<string, unknown>;

    expectArray(listBody.data);
    expect(listBody.data.length).toBeGreaterThan(0);

    const first = listBody.data[0] as Record<string, unknown>;
    expectObjectWithKeys(first, ['id']);
    const id = String(first.id);

    const detailResponse = await request.get(`/products/${id}`);
    const detailBody = await expectJsonResponse(detailResponse) as Record<string, unknown>;

    expect(detailResponse.status()).toBe(200);
    expect(String(detailBody.id)).toBe(id);
  });
});