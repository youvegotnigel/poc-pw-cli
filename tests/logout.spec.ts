import { test, expect } from '../src/fixtures/test-fixtures';
import { feature, story, severity } from 'allure-js-commons';

// spec: specs/critical-flows.md#5-logout

test.describe('Logout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('burger menu logout returns to the login page', async ({ inventoryPage }) => {
    await feature('Authentication');
    await story('Logout');
    await severity('critical');

    // 1. Open burger menu and click Logout
    await inventoryPage.logout();

    // 2. Redirected to the root login page
    await expect(inventoryPage.page).toHaveURL('/');

    // 3. Login form is visible
    await expect(inventoryPage.page.getByTestId('login-button')).toBeVisible();
  });
});
