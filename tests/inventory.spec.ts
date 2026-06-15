import { test, expect } from '../src/fixtures/test-fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('all six products are listed', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('sort by price low to high orders products correctly', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const priceTexts = await inventoryPage.prices.allTextContents();
    const prices = priceTexts.map(p => parseFloat(p.replace('$', '')));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('adding an item increments the cart badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});
