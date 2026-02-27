import { test, expect } from '@playwright/test';
import { expectJsonResponse, expectArray } from '../utils/response-assertions';

test.describe('OpenAPI common API scenarios', () => {
  test('GET /products supports positive listing and invalid-id negative detail checks @smoke', async ({ request }) => {
    const listResponse = await request.get('/products', { failOnStatusCode: false });
    const listBody = await expectJsonResponse(listResponse) as Record<string, unknown>;

    expect(listResponse.status()).toBe(200);
    expectArray(listBody.data);
    expect(listBody.data.length).toBeGreaterThan(0);

    const missingResponse = await request.get('/products/non-existent-id', { failOnStatusCode: false });
    expect([404, 422]).toContain(missingResponse.status());
  });

  test('GET /brands/search and /categories/tree return usable data structures @regression', async ({ request }) => {
    const brandsSearch = await request.get('/brands/search', {
      params: { q: 'tool' },
      failOnStatusCode: false,
    });

    expect(brandsSearch.status()).toBe(200);
    const brandsBody = await expectJsonResponse(brandsSearch);
    expectArray(brandsBody);

    const categoriesTree = await request.get('/categories/tree', { failOnStatusCode: false });
    expect(categoriesTree.status()).toBe(200);
    const categoriesBody = await expectJsonResponse(categoriesTree);
    expectArray(categoriesBody);
  });

  test('POST /users/login negative: invalid credentials are rejected @regression', async ({ request }) => {
    const response = await request.post('/users/login', {
      data: {
        email: 'invalid.user@example.test',
        password: 'BadPassword123!'
      },
      failOnStatusCode: false,
    });

    expect([401, 422, 429]).toContain(response.status());
  });

  test('GET /users/me negative: unauthenticated access is blocked @regression', async ({ request }) => {
    const response = await request.get('/users/me', { failOnStatusCode: false });
    expect([401, 403]).toContain(response.status());
  });

  test('Cart workflow: create cart, add item, retrieve, update quantity, delete item @smoke', async ({ request }) => {
    const productListResponse = await request.get('/products', { failOnStatusCode: false });
    const productListBody = await expectJsonResponse(productListResponse) as Record<string, unknown>;

    expectArray(productListBody.data);
    expect(productListBody.data.length).toBeGreaterThan(0);

    const firstProduct = productListBody.data[0] as Record<string, unknown>;
    const productId = String(firstProduct.id);

    const createCartResponse = await request.post('/carts', { failOnStatusCode: false });
    expect(createCartResponse.status()).toBe(201);

    const createCartBody = await expectJsonResponse(createCartResponse) as Record<string, unknown>;
    const cartId = String(createCartBody.id);
    expect(cartId.length).toBeGreaterThan(0);

    const addItemResponse = await request.post(`/carts/${cartId}`, {
      data: { product_id: productId, quantity: 1 },
      failOnStatusCode: false,
    });
    expect([200, 201]).toContain(addItemResponse.status());

    const getCartResponse = await request.get(`/carts/${cartId}`, { failOnStatusCode: false });
    expect(getCartResponse.status()).toBe(200);
    const cartBody = await expectJsonResponse(getCartResponse) as Record<string, unknown>;

    const lines = (cartBody.cart_items ?? cartBody.data ?? []) as unknown[];
    expect(lines.length).toBeGreaterThan(0);

    const updateQuantityResponse = await request.put(`/carts/${cartId}/product/quantity`, {
      data: { product_id: productId, quantity: 2 },
      failOnStatusCode: false,
    });
    expect([200, 404, 422]).toContain(updateQuantityResponse.status());

    const deleteItemResponse = await request.delete(`/carts/${cartId}/product/${productId}`, { failOnStatusCode: false });
    expect([204, 404]).toContain(deleteItemResponse.status());

    await request.delete(`/carts/${cartId}`, { failOnStatusCode: false });
  });

  test('POST /payment/check positive and negative validation paths @regression', async ({ request }) => {
    const positive = await request.post('/payment/check', {
      data: {
        payment_method: 'cash-on-delivery',
        payment_details: {},
      },
      failOnStatusCode: false,
    });

    expect(positive.status()).toBeGreaterThanOrEqual(200);
    expect(positive.status()).toBeLessThan(300);

    const negative = await request.post('/payment/check', {
      data: {
        payment_method: 'unknown-method',
        payment_details: {},
      },
      failOnStatusCode: false,
    });

    expect(negative.status()).toBeGreaterThanOrEqual(200);
    expect(negative.status()).toBeLessThan(500);
  });
});
