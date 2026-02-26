import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductOverviewPage extends BasePage {
    //explain the selector: we want to find all links that have a data-test attribute starting with "product-". 
    // This is a common pattern for test automation, where we use data attributes to identify elements on the page. 
    // By using the ^= operator, we can match any element whose data-test attribute starts with "product-", which allows us to easily find all product cards on the overview page without relying on more brittle selectors like class names or element types.
  private readonly productCardSelector = 'a[data-test^="product-"]';

  constructor(page: Page) {
    super(page);
  }

  cards(): Locator {
    return this.page.locator(this.productCardSelector);
  }

  async openHome(): Promise<void> {
    await this.goto('/');
    await expect(this.cards().first()).toBeVisible();
  }

  async goToPageIfAvailable(pageNumber: number): Promise<boolean> {
    if (pageNumber === 1) {
      return true;
    }

    const pageButton = this.page.getByLabel(`Page-${pageNumber}`);
    if (!(await pageButton.isVisible().catch(() => false))) {
      return false;
    }

    await pageButton.click();
    await expect(this.cards().first()).toBeVisible();
    return true;
  }

  async findMarkerOnFirstPages(marker: Locator, maxPages: number): Promise<boolean> {
    for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
      const moved = await this.goToPageIfAvailable(pageNumber);
      if (!moved) {
        break;
      }

      if ((await marker.count()) > 0) {
        return true;
      }
    }

    return false;
  }

  firstBrandCheckbox(): Locator {
    return this.page.locator('input[data-test^="brand-"]').first();
  }

  firstCategoryCheckbox(): Locator {
    return this.page.locator('input[data-test^="category-"]').first();
  }

  async applySearch(query: string): Promise<void> {
    await this.page.getByTestId('search-query').fill(query);
    await Promise.all([
      this.page.waitForResponse((response) => response.url().includes(`/products/search?q=${query}`) && response.request().method() === 'GET'),
      this.page.getByTestId('search-submit').click(),
    ]);
  }

  async openFirstProduct(): Promise<void> {
    await this.cards().first().click();
    await this.expectUrlContains('/product/');
  }
}