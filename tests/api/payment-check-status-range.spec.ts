import { test, expect } from '@playwright/test';

test.describe('Payment check status API', () => {
  test('POST /payment/check returns HTTP 2xx for valid payload @regression', async ({ request }) => {
    const response = await request.post('/payment/check', {
      data: {
        payment_method: 'cash-on-delivery',
        payment_details: {},
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
  });
});