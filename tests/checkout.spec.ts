import { test, expect } from '../src/fixtures/test-fixtures';
import { feature, story, severity } from 'allure-js-commons';

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

  test('checkout requires first name before continuing @regression @critical', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await feature('Checkout');
    await story('Validation');
    await severity('critical');

    await inventoryPage.goto();
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    await cartPage.checkout();
    await checkoutPage.continue();

    await expect(checkoutPage.errorMessage).toContainText('Error: First Name is required');
  });

  test('back home from order confirmation returns to the inventory page @regression', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await feature('Checkout');
    await story('Order confirmation');
    await severity('normal');

    await inventoryPage.goto();
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();

    await cartPage.checkout();
    await checkoutPage.fillInfo('Test', 'User', '10001');
    await checkoutPage.continue();
    await checkoutPage.finish();

    await checkoutPage.backHome();

    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.items.first()).toBeVisible();
  });
});
