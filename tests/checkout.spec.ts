import { test, expect } from '../src/fixtures/test-fixtures';

test.describe('Checkout', () => {
  test('completes a full order from inventory to confirmation', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    await cartPage.checkout();

    await checkoutPage.fillInfo('Test', 'User', '10001');
    await checkoutPage.continue();
    await expect(checkoutPage.subtotal).toContainText('$29.99');

    await checkoutPage.finish();
    await expect(checkoutPage.confirmationHeader).toHaveText('Thank you for your order!');
  });

  test('logout via the burger menu returns to the login page', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.logout();
    await expect(inventoryPage.page).toHaveURL('/');
    await expect(inventoryPage.page.getByTestId('login-button')).toBeVisible();
  });
});
