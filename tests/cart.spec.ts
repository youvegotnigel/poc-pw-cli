import { test, expect } from '../src/fixtures/test-fixtures';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart('sauce-labs-backpack');
  });

  test('added item appears in the cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();
    await expect(cartPage.itemNames).toContainText('Sauce Labs Backpack');
  });

  test('removing an item clears the cart badge', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();
    await cartPage.removeItem('sauce-labs-backpack');
    await expect(cartPage.cartBadge).toBeHidden();
  });

  test('continue shopping returns to the inventory page', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();
    await cartPage.continueShopping();
    await expect(inventoryPage.items.first()).toBeVisible();
  });
});
