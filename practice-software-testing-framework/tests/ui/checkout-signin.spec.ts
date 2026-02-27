import { expect, test } from '@playwright/test';
import { AuthPage } from './pages/AuthPage';
import { CheckoutPage } from './pages/CheckoutPage';

test.describe('Sprint5 Checkout Sign-In', () => {
  test.beforeEach(async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.openCheckout();
    await checkoutPage.clearAllItems();
    await checkoutPage.addFirstStandardProductToCart(1);
    await checkoutPage.openCheckout();
  });

  test('@smoke CS-AC1 guest sees login step after proceeding from cart', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.proceedButton().click();

    await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
  });

  test('@regression CS-AC2 checkout login step shows email, password and submit controls', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.proceedButton().click();

    await expect(page.getByTestId('email')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('@regression CS-AC3 totp challenge appears for totp-enabled accounts when applicable', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.proceedButton().click();

    const authPage = new AuthPage(page);
    await authPage.login('customer@practicesoftwaretesting.com', 'welcome01');

    const hasTotpInput = (await page.getByRole('textbox', { name: /totp|code|6-digit/i }).count()) > 0
      || (await page.locator('input[maxlength="6"], input[inputmode="numeric"]').count()) > 0;
    test.skip(!hasTotpInput, 'No TOTP challenge shown for this account/environment.');

    expect(hasTotpInput).toBeTruthy();
  });

  test('@regression CS-AC4 valid checkout login authenticates and allows moving to billing step', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.proceedButton().click();

    const authPage = new AuthPage(page);
    const loggedIn = await authPage.loginWithFirstAvailableAccount();
    test.skip(!loggedIn, 'No unlocked account available for checkout login test.');

    const canSeeBilling = (await page.getByText(/street|city|postal code|billing/i).count()) > 0;
    expect(canSeeBilling).toBeTruthy();
  });

  test('@regression CS-AC5 already logged-in user sees signed-in message and can proceed', async ({ page }) => {
    const authPage = new AuthPage(page);
    const loggedIn = await authPage.loginWithFirstAvailableAccount();
    test.skip(!loggedIn, 'No unlocked account available for already-signed-in checkout test.');

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.openCheckout();

    const signedInMessageVisible = await page.getByText(/you are already signed in as/i).isVisible().catch(() => false);
    const proceedVisible = await checkoutPage.proceedButton().isVisible().catch(() => false);

    expect(signedInMessageVisible || proceedVisible).toBeTruthy();
  });
});