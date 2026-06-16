# Conventions

Exact code style the generator and any contributor must follow. These are
enforced by ESLint and review. Examples below show the good pattern and the
anti-pattern side by side.

## Selectors

Prefer, in order: role-based locators, `getByTestId`, label/text. Avoid CSS
descendant chains and XPath.

```ts
// good
private readonly addToCart = this.page.getByTestId('add-to-cart');
private readonly submit = this.page.getByRole('button', { name: 'Place order' });

// bad
private readonly addToCart = this.page.locator('div.cart > button.btn-primary');
```

## Assertions

Web-first, auto-retrying assertions only.

```ts
// good
await expect(this.orderConfirmation).toBeVisible();
await expect(page).toHaveURL(/\/order\/\d+/);

// bad
expect(await this.orderConfirmation.isVisible()).toBe(true);
```

The regex above uses a basic group. Prefer non-capturing groups when you do not
need the captured value, e.g. `/\/(?:order|cart)\//`.

## Waiting

```ts
// good: assertion auto-waits
await expect(this.spinner).toBeHidden();

// bad: hard sleep
await page.waitForTimeout(3000);
```

## Page object shape

```ts
import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly username: Locator;
  private readonly password: Locator;
  private readonly signIn: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByTestId('login-username');
    this.password = page.getByTestId('login-password');
    this.signIn = page.getByRole('button', { name: 'Sign in' });
  }

  async login(user: string, pass: string): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.signIn.click();
  }
}
```

## Spec shape

Specs read like a flow. No locators, no waits, no logic.

```ts
import { test, expect } from '../src/fixtures/test-fixtures';

test('user signs in and lands on dashboard', async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.login('demo@shop.test', 'Passw0rd!');
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## Allure metadata

Every test sets feature/story/severity so reports are filterable by stakeholders.
Import from `allure-js-commons` directly — the `allure` object from `allure-playwright` is deprecated.

```ts
import { feature, story, severity } from 'allure-js-commons';

test('checkout completes with a saved card', async ({ checkoutPage }) => {
  await feature('Checkout');
  await story('Saved card payment');
  await severity('critical');
  // ...
});
```

## Naming

- Files: `kebab-case`, page objects `*.page.ts`, specs `*.spec.ts`.
- Test titles: full sentences describing user-visible behavior, not ticket IDs.
- Page object methods: verb-first intentions (`addToCart`, not `clickButton`).
