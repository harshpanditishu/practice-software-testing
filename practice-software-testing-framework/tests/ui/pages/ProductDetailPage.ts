import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductOverviewPage } from './ProductOverviewPage';

export class ProductDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openFirstProductFromHome(): Promise<void> {
    const overviewPage = new ProductOverviewPage(this.page);
    await overviewPage.openHome();
    await overviewPage.openFirstProduct();
  }

  quantityInput(): Locator {
    return this.page.getByRole('spinbutton').first();
  }

  increaseQuantityButton(): Locator {
    return this.page.getByRole('button', { name: /increase quantity/i }).first();
  }

  decreaseQuantityButton(): Locator {
    return this.page.getByRole('button', { name: /decrease quantity/i }).first();
  }

  addToCartButton(): Locator {
    return this.page.getByRole('button', { name: /add to cart/i });
  }

  addToFavoritesButton(): Locator {
    return this.page.getByRole('button', { name: /add to favou?rites/i });
  }

  async readQuantity(): Promise<number> {
    return Number(await this.quantityInput().inputValue());
  }

  async openFirstOutOfStockProduct(maxPages: number): Promise<boolean> {
    const overviewPage = new ProductOverviewPage(this.page);
    await overviewPage.openHome();

    for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
      const moved = await overviewPage.goToPageIfAvailable(pageNumber);
      if (!moved) {
        break;
      }

      const cards = overviewPage.cards();
      const count = await cards.count();
      for (let index = 0; index < count; index++) {
        const card = cards.nth(index);
        if ((await card.getByTestId('out-of-stock').count()) > 0) {
          await card.click();
          await this.expectUrlContains('/product/');
          return true;
        }
      }
    }

    return false;
  }

  async openFirstRentalProductFromRentalsPage(): Promise<boolean> {
    await this.goto('/rentals');
    const firstTitle = this.page.getByRole('heading', { level: 5 }).first();
    if (!(await firstTitle.isVisible().catch(() => false))) {
      return false;
    }

    await firstTitle.click();
    const navigatedToProduct = /\/product\//.test(this.page.url());

    if (!navigatedToProduct) {
      return false;
    }

    await this.expectUrlContains('/product/');
    return true;
  }

  async dragSliderHandle(deltaX: number): Promise<void> {
    const sliderHandle = this.page.locator('.ngx-slider-pointer').first();
    await expect(sliderHandle).toBeVisible();

    const box = await sliderHandle.boundingBox();
    expect(box).not.toBeNull();
    if (!box) {
      return;
    }

    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + deltaX, box.y + box.height / 2);
    await this.page.mouse.up();
  }
}