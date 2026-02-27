import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductOverviewPage } from './ProductOverviewPage';
import { ProductDetailPage } from './ProductDetailPage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openCheckout(): Promise<void> {
    await this.goto('/checkout');
  }

  async addFirstStandardProductToCart(quantity: number = 1): Promise<void> {
    const overviewPage = new ProductOverviewPage(this.page);
    await overviewPage.openHome();
    await overviewPage.openFirstProduct();

    const detailPage = new ProductDetailPage(this.page);
    await detailPage.quantityInput().fill(String(quantity));
    await detailPage.addToCartButton().click();
    await expect(this.page.getByText(/product added to shopping cart\./i)).toBeVisible();
  }

  async addFirstRentalProductToCart(): Promise<boolean> {
    const detailPage = new ProductDetailPage(this.page);
    const opened = await detailPage.openFirstRentalProductFromRentalsPage();
    if (!opened) {
      return false;
    }

    await detailPage.addToCartButton().click();
    await expect(this.page.getByText(/product added to shopping cart\./i)).toBeVisible();
    return true;
  }

  cartRows(): Locator {
    return this.page.locator('tbody tr');
  }

  proceedButton(): Locator {
    return this.page.getByRole('button', { name: /proceed|proceed to checkout/i });
  }

  deleteButtons(): Locator {
    return this.page.getByRole('button', { name: /delete|remove|trash/i });
  }

  async deleteFirstItemIfPresent(): Promise<boolean> {
    const firstDeleteButton = this.deleteButtons().first();
    if (!(await firstDeleteButton.isVisible().catch(() => false))) {
      return false;
    }

    await firstDeleteButton.click();
    return true;
  }

  async clearAllItems(maxDeletes: number = 20): Promise<void> {
    let deletes = 0;
    while ((await this.deleteButtons().count()) > 0 && deletes < maxDeletes) {
      await this.deleteButtons().first().click();
      deletes += 1;
    }
  }

  async goToCheckoutFromHeaderCart(): Promise<void> {
    const cartLink = this.page.getByRole('link', { name: /cart/i }).first();
    if (await cartLink.isVisible().catch(() => false)) {
      await cartLink.click();
    }

    await this.openCheckout();
  }
}