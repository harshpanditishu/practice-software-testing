import { test, expect } from '@playwright/test';

test.describe('API availability', () => {
  test('POST /payment/check returns success for valid payload @smoke', async ({ request }) => {
    const response = await request.post('/payment/check', {
      data: {
        payment_method: 'cash-on-delivery',
        payment_details: {},
      },
    });

    // eslint-disable-next-line jest/valid-expect
    expect(response.ok(), `Expected status 2xx, got ${response.status()}`).toBeTruthy();
  });
});
