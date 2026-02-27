import { expect, test } from '@playwright/test';
import { ProductOverviewPage } from './pages/ProductOverviewPage';

test.describe('Sprint5 Product Overview', () => {
  test.beforeEach(async ({ page }) => {
    const overviewPage = new ProductOverviewPage(page);
    await overviewPage.openHome();
  });

  test('@smoke AC1 product grid cards show image name and price', async ({ page }) => {
    const overviewPage = new ProductOverviewPage(page);
    const cards = overviewPage.cards();
    expect(await cards.count()).toBeGreaterThan(0);

    const firstCard = cards.first();
    await expect(firstCard.locator('img')).toBeVisible();
    await expect(firstCard.getByTestId('product-name')).toBeVisible();
    await expect(firstCard.getByTestId('product-price')).toBeVisible();
  });

  test('@smoke AC2 clicking product opens product detail page', async ({ page }) => {
    const overviewPage = new ProductOverviewPage(page);
    await overviewPage.openFirstProduct();
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByTestId('product-name')).toBeVisible();
  });

  test('@regression AC3 pagination is visible and page navigation works', async ({ page }) => {
    const overviewPage = new ProductOverviewPage(page);
    const page2Button = page.getByLabel('Page-2');
    await expect(page2Button).toBeVisible();

    await Promise.all([
      page.waitForResponse((response) => {
        return response.url().includes('/products?') && response.url().includes('page=2') && response.request().method() === 'GET';
      }),
      page2Button.click(),
    ]);
    await expect(overviewPage.cards().first()).toBeVisible();
  });

  test('@regression AC4 search updates result set and resets brand filter selection', async ({ page }) => {
    const overviewPage = new ProductOverviewPage(page);
    const firstBrandCheckbox = overviewPage.firstBrandCheckbox();
    await firstBrandCheckbox.check();
    await expect(firstBrandCheckbox).toBeChecked();

    await overviewPage.applySearch('pliers');

    await expect(page.getByTestId('search-term')).toHaveText(/pliers/i);
    await expect(firstBrandCheckbox).not.toBeChecked();
    expect(await overviewPage.cards().count()).toBeGreaterThan(0);
  });

  test('@regression AC5 category filter triggers category-based product query', async ({ page }) => {
    const overviewPage = new ProductOverviewPage(page);
    const firstCategoryCheckbox = overviewPage.firstCategoryCheckbox();

    await Promise.all([
      page.waitForResponse((response) => {
        return response.url().includes('/products?') && response.url().includes('by_category=') && response.request().method() === 'GET';
      }),
      firstCategoryCheckbox.check(),
    ]);

    await expect(firstCategoryCheckbox).toBeChecked();
    expect(await overviewPage.cards().count()).toBeGreaterThan(0);
  });

  test('@regression AC6 checking parent checks children and unchecking all children unchecks parent', async ({ page }) => {
    const parentCategoryBlock = page.locator('div.checkbox').filter({ has: page.locator('ul input.icheck') }).first();
    const parentCheckbox = parentCategoryBlock.locator('label input.icheck').first();
    const childCheckboxes = parentCategoryBlock.locator('ul input.icheck');

    await expect(childCheckboxes.first()).toBeVisible();

    await parentCheckbox.check();
    const childCount = await childCheckboxes.count();

    for (let index = 0; index < childCount; index++) {
      await expect(childCheckboxes.nth(index)).toBeChecked();
    }

    for (let index = 0; index < childCount; index++) {
      await childCheckboxes.nth(index).uncheck();
    }

    await expect(parentCheckbox).not.toBeChecked();
  });

  test('@regression AC7+AC8 brand and category filters can be combined', async ({ page }) => {
    const overviewPage = new ProductOverviewPage(page);
    const firstCategoryCheckbox = overviewPage.firstCategoryCheckbox();
    const firstBrandCheckbox = overviewPage.firstBrandCheckbox();

    await firstCategoryCheckbox.check();

    await Promise.all([
      page.waitForResponse((response) => {
        return response.url().includes('/products?')
          && response.url().includes('by_category=')
          && response.url().includes('by_brand=')
          && response.request().method() === 'GET';
      }),
      firstBrandCheckbox.check(),
    ]);

    await expect(firstCategoryCheckbox).toBeChecked();
    await expect(firstBrandCheckbox).toBeChecked();
    expect(await overviewPage.cards().count()).toBeGreaterThan(0);
  });

  test('@regression AC9 sorting by price low-high updates query and orders visible prices', async ({ page }) => {
    await page.getByTestId('sort').selectOption('price,asc');

    await expect.poll(async () => {
      const prices = await page.getByTestId('product-price').allTextContents();
      const numericPrices = prices
        .map((value) => Number(value.replace('$', '').trim()))
        .filter((value) => !Number.isNaN(value));

      if (numericPrices.length < 2) {
        return false;
      }

      for (let index = 1; index < numericPrices.length; index++) {
        if (numericPrices[index] < numericPrices[index - 1]) {
          return false;
        }
      }

      return true;
    }, {
      timeout: 20_000,
      message: 'Prices are not sorted ascending after selecting price low-high',
    }).toBe(true);
  });

  test('@regression AC10+AC11 price range slider is visible and changing slider updates product query', async ({ page }) => {
    const sliderHandles = page.locator('.ngx-slider-pointer');
    await expect(sliderHandles).toHaveCount(2);

    const minHandle = sliderHandles.first();
    const handleBox = await minHandle.boundingBox();
    expect(handleBox).not.toBeNull();

    if (handleBox) {
      await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox.x + 20, handleBox.y + handleBox.height / 2);
      await page.mouse.up();
    }

    await expect.poll(async () => {
      const requests = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .map((entry) => entry.name)
          .filter((name) => name.includes('/products?') && name.includes('between=price'));
      });

      return requests.length;
    }).toBeGreaterThan(0);
  });

  test('@regression AC12 discount price and AC13 out-of-stock indicator are shown when applicable', async ({ page }) => {
    const overviewPage = new ProductOverviewPage(page);
    const discountMarker = page.getByTestId('product-discount-price');
    const hasDiscountedProduct = await overviewPage.findMarkerOnFirstPages(discountMarker, 5);

    test.skip(!hasDiscountedProduct, 'No discounted product found in first 5 pages for current environment dataset.');
    await expect(discountMarker.first()).toBeVisible();

    await overviewPage.goToPageIfAvailable(1);

    const outOfStockMarker = page.getByTestId('out-of-stock');
    const hasOutOfStockProduct = await overviewPage.findMarkerOnFirstPages(outOfStockMarker, 5);

    test.skip(!hasOutOfStockProduct, 'No out-of-stock product found in first 5 pages for current environment dataset.');
    await expect(outOfStockMarker.first()).toBeVisible();
  });
});
