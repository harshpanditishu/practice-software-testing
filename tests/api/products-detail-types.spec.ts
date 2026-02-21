import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray } from './utils/response-assertions';

test.describe('Products detail types API', () => {
  test('GET /products/{id} returns name and price with expected primitive types @regression', async ({ request }) => {
    const listResponse = await request.get('/products');
    const listBody = await expectJsonResponse(listResponse) as Record<string, unknown>;

    expectArray(listBody.data);
    expect(listBody.data.length).toBeGreaterThan(0);
    const id = String((listBody.data[0] as Record<string, unknown>).id);

    const detailsResponse = await request.get(`/products/${id}`);
    const detailsBody = await expectJsonResponse(detailsResponse) as Record<string, unknown>;

    expect(typeof detailsBody.name).toBe('string');
    expect(['number', 'string']).toContain(typeof detailsBody.price);
  });
});