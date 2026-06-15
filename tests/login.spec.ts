import { test, expect } from '../src/fixtures/test-fixtures';
import { resolveEnv } from '../src/config/env';

const env = resolveEnv();

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('valid credentials redirect to the inventory page', async ({ page, loginPage }) => {
    await loginPage.login(env.user, env.password);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('locked_out_user sees a locked account error', async ({ loginPage }) => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out');
  });

  test('wrong password shows a credentials mismatch error', async ({ loginPage }) => {
    await loginPage.login('standard_user', 'wrong_password');
    await expect(loginPage.errorMessage).toContainText('Username and password do not match');
  });
});
