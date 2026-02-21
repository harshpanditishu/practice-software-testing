import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray, expectObjectWithKeys } from './utils/response-assertions';

test.describe('Product details API', () => {
  test('GET /products/{id} returns 200 and expected product schema keys @smoke', async ({ request }) => {
    const listResponse = await request.get('/products');
    const listBody = await expectJsonResponse(listResponse) as Record<string, unknown>;
    expectArray(listBody.data);
    expect(listBody.data.length).toBeGreaterThan(0);

    const productFromList = listBody.data[0] as Record<string, unknown>;
    expectObjectWithKeys(productFromList, ['id']);

    const productId = String(productFromList.id);
    const detailsResponse = await request.get(`/products/${productId}`);
    const detailsBody = await expectJsonResponse(detailsResponse);

    expect(detailsResponse.status()).toBe(200);
    expectObjectWithKeys(detailsBody, ['id', 'name', 'description', 'price']);
    expect((detailsBody as Record<string, unknown>).id).toBe(productId);
  });
});
