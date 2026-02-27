import { expect, test } from '@playwright/test';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

test.describe('Sprint5 Rental Products', () => {
  test('@smoke RP-AC1 rentals page is accessible and lists rental products', async ({ page }) => {
    await page.goto('/rentals');
    const rentalTitles = page.getByRole('heading', { level: 5 });

    await expect(page.getByRole('heading', { name: /rentals/i })).toBeVisible();
    expect(await rentalTitles.count()).toBeGreaterThan(0);
  });

  test('@regression RP-AC2 rental product cards show image, name, and description', async ({ page }) => {
    await page.goto('/rentals');
    const firstTitle = page.getByRole('heading', { level: 5 }).first();

    await expect(firstTitle).toBeVisible();
    const firstTitleText = (await firstTitle.textContent())?.trim() ?? '';
    await expect(page.getByRole('img', { name: new RegExp(firstTitleText, 'i') })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /[a-z]/i }).first()).toBeVisible();
  });

  test('@regression RP-AC3 rental detail page shows duration slider and total price updates by duration', async ({ page }) => {
    const detailPage = new ProductDetailPage(page);
    const opened = await detailPage.openFirstRentalProductFromRentalsPage();
    test.skip(!opened, 'No rental products available in current dataset.');

    const totalPrice = page.getByTestId('total-price');
    await expect(totalPrice).toBeVisible();
    const initialTotal = await totalPrice.textContent();

    await detailPage.dragSliderHandle(30);

    await expect.poll(async () => totalPrice.textContent()).not.toBe(initialTotal);
    const hasPlusMinus = (await detailPage.increaseQuantityButton().isVisible().catch(() => false))
      || (await detailPage.decreaseQuantityButton().isVisible().catch(() => false));
    expect(hasPlusMinus).toBeFalsy();
  });

  test('@regression RP-AC4 rental item is labeled in checkout cart', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    const added = await checkoutPage.addFirstRentalProductToCart();
    test.skip(!added, 'No rental products available in current dataset.');

    await checkoutPage.openCheckout();
    await expect(page.getByText(/this is a rental item/i)).toBeVisible();
  });

  test('@regression RP-AC5 location-based rental discount is applied when location-offer rental is present', async ({ page }) => {
    await page.goto('/rentals');
    const locationOfferMarker = page.locator('[data-test*="location"], .badge, .label').filter({ hasText: /location|offer|discount/i }).first();
    const hasLocationOffer = await locationOfferMarker.isVisible().catch(() => false);

    test.skip(!hasLocationOffer, 'No explicit location-offer rental marker available in current environment.');

    await page.getByRole('heading', { level: 5 }).first().click();
    await expect(page).toHaveURL(/\/product\//);

    const hasDiscountView = (await page.getByTestId('product-discount-price').count()) > 0
      || (await page.locator('s, del, .text-decoration-line-through').count()) > 0;
    expect(hasDiscountView).toBeTruthy();
  });
});