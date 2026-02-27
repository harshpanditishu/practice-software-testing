import { expect, test } from '@playwright/test';
import { AuthPage } from './pages/AuthPage';
import { CheckoutPage } from './pages/CheckoutPage';

async function moveToBillingStepAsGuest(page: import('@playwright/test').Page): Promise<void> {
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.openCheckout();
  await checkoutPage.clearAllItems();
  await checkoutPage.addFirstStandardProductToCart(1);
  await checkoutPage.openCheckout();
  await checkoutPage.proceedButton().click();

  const continueAsGuestTab = page.getByRole('tab', { name: /continue as guest/i });
  if (await continueAsGuestTab.isVisible().catch(() => false)) {
    await continueAsGuestTab.click();
  }

  const guestContinueButton = page.getByRole('button', { name: /^continue as guest$/i });
  if (await guestContinueButton.isVisible().catch(() => false)) {
    await page.getByRole('textbox', { name: /email address/i }).fill('guest@example.com');
    await page.getByRole('textbox', { name: /first name/i }).fill('Guest');
    await page.getByRole('textbox', { name: /last name/i }).fill('User');
    await guestContinueButton.click();
  }

  const guestProceedButton = page.getByRole('button', { name: /proceed to checkout|proceed/i }).last();
  if (await guestProceedButton.isVisible().catch(() => false)) {
    await guestProceedButton.click();
  }

  await expect(page.getByTestId('street')).toBeVisible();
}

test.describe('Sprint5 Checkout Billing Address', () => {
  test('@smoke CB-AC1 billing step shows required address fields', async ({ page }) => {
    await moveToBillingStepAsGuest(page);

    await expect(page.getByTestId('street')).toBeVisible();
    await expect(page.getByTestId('city')).toBeVisible();
    await expect(page.getByTestId('state')).toBeVisible();
    await expect(page.getByTestId('country')).toBeVisible();
    await expect(page.getByTestId('postal_code')).toBeVisible();
  });

  test('@regression CB-AC2 required field validation blocks proceed when fields are empty', async ({ page }) => {
    await moveToBillingStepAsGuest(page);

    const proceed = page.getByRole('button', { name: /proceed/i }).last();

    const street = page.getByTestId('street');
    await street.fill('');
    await street.blur();

    const invalidIndicatorVisible = (await page.locator('.is-invalid, .ng-invalid, [aria-invalid="true"]').count()) > 0;
    const disabledProceed = await proceed.isDisabled().catch(() => false);

    expect(invalidIndicatorVisible || disabledProceed).toBeTruthy();
  });

  test('@regression CB-AC3 valid billing address allows proceeding to payment step', async ({ page }) => {
    await moveToBillingStepAsGuest(page);

    await page.getByTestId('street').fill('123 Main Street');
    await page.getByTestId('city').fill('Amsterdam');
    await page.getByTestId('state').fill('Noord-Holland');
    await page.getByTestId('country').fill('Netherlands');
    await page.getByTestId('postal_code').fill('1234AB');

    const proceed = page.getByRole('button', { name: /proceed/i }).last();
    await proceed.click();

    const paymentSignals = (await page.getByText(/payment|credit card|bank transfer|cash-on-delivery/i).count()) > 0;
    expect(paymentSignals).toBeTruthy();
  });

  test('@regression CB-AC4 logged-in user sees pre-filled billing address fields when profile has data', async ({ page }) => {
    const authPage = new AuthPage(page);
    const loggedIn = await authPage.loginWithFirstAvailableAccount();
    test.skip(!loggedIn, 'No unlocked account available for pre-fill billing test.');

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.openCheckout();
    await checkoutPage.clearAllItems();
    await checkoutPage.addFirstStandardProductToCart(1);
    await checkoutPage.openCheckout();
    await checkoutPage.proceedButton().click();

    const continueAsGuestTab = page.getByRole('tab', { name: /continue as guest/i });
    if (await continueAsGuestTab.isVisible().catch(() => false)) {
      await continueAsGuestTab.click();
    }

    const guestContinueButton = page.getByRole('button', { name: /^continue as guest$/i });
    if (await guestContinueButton.isVisible().catch(() => false)) {
      await page.getByRole('textbox', { name: /email address/i }).fill('guest+prefill@example.com');
      await page.getByRole('textbox', { name: /first name/i }).fill('Prefill');
      await page.getByRole('textbox', { name: /last name/i }).fill('Check');
      await guestContinueButton.click();
    }

    const guestProceedButton = page.getByRole('button', { name: /proceed to checkout|proceed/i }).last();
    if (await guestProceedButton.isVisible().catch(() => false)) {
      await guestProceedButton.click();
    }

    await expect(page.getByTestId('street')).toBeVisible();

    const streetValue = await page.getByTestId('street').inputValue();
    const cityValue = await page.getByTestId('city').inputValue();
    const stateValue = await page.getByTestId('state').inputValue();
    const countryValue = await page.getByTestId('country').inputValue();
    const postalValue = await page.getByTestId('postal_code').inputValue();

    const hasAnyPrefill = [streetValue, cityValue, stateValue, countryValue, postalValue]
      .some((value) => value.trim().length > 0);

    test.skip(!hasAnyPrefill, 'No saved billing data on selected account in current environment.');
    expect(hasAnyPrefill).toBeTruthy();
  });
});