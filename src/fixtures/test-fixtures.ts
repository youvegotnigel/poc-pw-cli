import { test as base, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';

/**
 * Custom fixtures provide ready-constructed page objects and shared setup
 * (auth reuse, app reset). This is the dependency-injection seam that keeps
 * specs free of boilerplate.
 *
 * authedPage: a Page loaded with storageState from the auth setup project
 * (tests/auth.setup.ts), so tests
 * skip UI login. All page-object fixtures derive from this single page
 * instance so they share the same browser context within a test.
 *
 * loginPage: uses the default Playwright `page` (no storageState) for tests
 * that exercise the login form itself.
 */
type Fixtures = {
  authedPage: Page;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<Fixtures>({
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'auth/storageState.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ authedPage }, use) => {
    await use(new InventoryPage(authedPage));
  },

  cartPage: async ({ authedPage }, use) => {
    await use(new CartPage(authedPage));
  },

  checkoutPage: async ({ authedPage }, use) => {
    await use(new CheckoutPage(authedPage));
  },
});

export { expect };
