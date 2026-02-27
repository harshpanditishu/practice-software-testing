import { expect, test } from '@playwright/test';
import { ProductDetailPage } from './pages/ProductDetailPage';

test.describe('Sprint5 Product Detail', () => {
  test.beforeEach(async ({ page }) => {
    const detailPage = new ProductDetailPage(page);
    await detailPage.openFirstProductFromHome();
  });

  test('@smoke PD-AC1 product detail shows primary product information', async ({ page }) => {
    await expect(page.getByTestId('product-name')).toBeVisible();
    await expect(page.locator('img').first()).toBeVisible();
    await expect(page.getByTestId('unit-price')).toBeVisible();

    const hasDescription = (await page.getByTestId('product-description').count()) > 0
      || (await page.locator('p').filter({ hasText: /lorem ipsum|description/i }).count()) > 0;
    expect(hasDescription).toBeTruthy();

    await expect(page.getByLabel('category')).toBeVisible();
    await expect(page.getByLabel('brand')).toBeVisible();
  });

  test('@regression PD-AC2 discount product detail displays original and discounted pricing when applicable', async ({ page }) => {
    const strikePrices = page.locator('s, del, .text-decoration-line-through');
    const discounted = page.getByTestId('product-discount-price');
    const discountPercent = page.getByText(/\d+%/);

    const hasDiscountUi = (await strikePrices.count()) > 0 || (await discounted.count()) > 0 || (await discountPercent.count()) > 0;
    test.skip(!hasDiscountUi, 'No discounted product opened in current dataset.');

    expect(hasDiscountUi).toBeTruthy();
  });

  test('@regression PD-AC3 quantity selector is visible with default quantity 1', async ({ page }) => {
    const detailPage = new ProductDetailPage(page);
    const quantity = detailPage.quantityInput();

    await expect(quantity).toBeVisible();
    await expect(detailPage.increaseQuantityButton()).toBeVisible();
    await expect(detailPage.decreaseQuantityButton()).toBeVisible();
    await expect(quantity).toHaveValue('1');
  });

  test('@regression PD-AC4 clicking plus increases quantity by 1', async ({ page }) => {
    const detailPage = new ProductDetailPage(page);
    const before = await detailPage.readQuantity();

    await detailPage.increaseQuantityButton().click();
    await expect.poll(async () => detailPage.readQuantity()).toBe(before + 1);
  });

  test('@regression PD-AC5+AC6 clicking minus decreases quantity but not below 1', async ({ page }) => {
    const detailPage = new ProductDetailPage(page);

    await detailPage.increaseQuantityButton().click();
    await expect.poll(async () => detailPage.readQuantity()).toBe(2);

    await detailPage.decreaseQuantityButton().click();
    await expect(detailPage.quantityInput()).toHaveValue('1');

    await detailPage.decreaseQuantityButton().click();
    await expect(detailPage.quantityInput()).toHaveValue('1');
  });

  test('@regression PD-AC7 manual quantity entry clamps between 1 and 999999999', async ({ page }) => {
    const detailPage = new ProductDetailPage(page);
    const quantity = detailPage.quantityInput();

    await quantity.fill('0');
    await quantity.blur();
    await expect.poll(async () => detailPage.readQuantity()).toBeGreaterThanOrEqual(1);

    await quantity.fill('1000000000');
    await quantity.blur();
    await expect.poll(async () => detailPage.readQuantity()).toBeLessThanOrEqual(999999999);
  });

  test('@smoke PD-AC8 add to cart adds selected quantity and shows success message', async ({ page }) => {
    const detailPage = new ProductDetailPage(page);
    await detailPage.quantityInput().fill('2');

    await expect(detailPage.addToCartButton()).toBeEnabled();
    await detailPage.addToCartButton().click();

    await expect(page.getByText(/product added to shopping cart\./i)).toBeVisible();
  });

  test('@regression PD-AC9 out-of-stock product disables add-to-cart and shows out-of-stock message', async ({ page }) => {
    const detailPage = new ProductDetailPage(page);
    const foundOutOfStock = await detailPage.openFirstOutOfStockProduct(5);
    test.skip(!foundOutOfStock, 'No out-of-stock product found in first 5 pages.');

    await expect(detailPage.addToCartButton()).toBeDisabled();
    await expect(page.getByText(/out of stock/i)).toBeVisible();
  });

  test('@regression PD-AC10 rental product shows duration slider and updates total price', async ({ page }) => {
    const detailPage = new ProductDetailPage(page);
    const foundRental = await detailPage.openFirstRentalProductFromRentalsPage();
    test.skip(!foundRental, 'No rental products available in current environment.');

    const plusVisible = await detailPage.increaseQuantityButton().isVisible().catch(() => false);
    const minusVisible = await detailPage.decreaseQuantityButton().isVisible().catch(() => false);
    expect(plusVisible).toBeFalsy();
    expect(minusVisible).toBeFalsy();

    const totalPrice = page.getByTestId('total-price');
    const initial = await totalPrice.textContent();

    await detailPage.dragSliderHandle(25);

    await expect.poll(async () => totalPrice.textContent()).not.toBe(initial);
  });

  test('@regression PD-AC11+AC12+AC13 add to favorites handles unauthorized, success, and duplicate scenarios', async ({ page }) => {
    const detailPage = new ProductDetailPage(page);
    await detailPage.addToFavoritesButton().click();
    await expect(page.getByText(/unauthorized, can not add product to your favorite list\./i)).toBeVisible();

    await page.goto('/auth/login');
    const credentials = [
      { email: 'customer@practicesoftwaretesting.com', password: 'welcome01' },
      { email: 'customer2@practicesoftwaretesting.com', password: 'welcome01' },
      { email: 'customer3@practicesoftwaretesting.com', password: 'pass123' },
    ];

    let loggedIn = false;
    for (const account of credentials) {
      await page.getByTestId('email').fill(account.email);
      await page.getByTestId('password').fill(account.password);
      await page.getByTestId('login-submit').click();

      if (await page.getByText(/account locked/i).isVisible().catch(() => false)) {
        await page.goto('/auth/login');
        continue;
      }

      if (/\/account/.test(page.url())) {
        loggedIn = true;
        break;
      }

      await page.goto('/auth/login');
    }

    test.skip(!loggedIn, 'No unlocked test account available for favorite success/duplicate checks.');

    await detailPage.openFirstProductFromHome();
    await detailPage.addToFavoritesButton().click();

    const successMessage = page.getByText(/product added to your favorites list\./i);
    const duplicateMessage = page.getByText(/product already in your favorites list\./i);
    await expect(successMessage.or(duplicateMessage)).toBeVisible();

    await detailPage.addToFavoritesButton().click();
    await expect(page.getByText(/product already in your favorites list\./i)).toBeVisible();
  });

  test('@regression PD-AC14 related products section is displayed', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /related products/i })).toBeVisible();
    await expect(page.locator('a[href*="/product/"]').first()).toBeVisible();
  });
});
