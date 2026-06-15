import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

/**
 * Custom fixtures provide ready-constructed page objects and shared setup
 * (auth reuse, app reset). This is the dependency-injection seam that keeps
 * specs free of boilerplate.
 */
type Fixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };
