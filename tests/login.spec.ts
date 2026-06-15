import { test, expect } from '../src/fixtures/test-fixtures';

test('user signs in and lands on the dashboard', async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.login('demo@shop.test', 'Passw0rd!');
  await expect(page).toHaveURL(/\/dashboard/);
});
