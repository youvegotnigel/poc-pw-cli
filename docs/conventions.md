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

## Allure environment info

The Allure report's Environment panel is populated automatically on every run via the `environmentInfo` option on the `allure-playwright` reporter in `playwright.config.ts`. It captures:

- **Base URL** — from `resolveEnv()` (respects the `BASE_URL` env var)
- **Node.js** — `process.version`
- **Platform** — `process.platform`
- **Playwright** — version read from `node_modules/@playwright/test/package.json`
- **Chromium / Firefox / WebKit** — versions parsed from each device's bundled user-agent string

Do not write `allure-results/environment.properties` manually or from a fixture; the reporter handles it. If you add or remove a browser project, add or remove the matching `environmentInfo` key to keep the panel accurate.

`Branch` and `Commit` are included conditionally via `GITHUB_REF_NAME` / `GITHUB_SHA` — they appear in CI reports but are silently omitted on local runs.

The **Executors** panel (CI run info — build number, link to Actions run) is populated by `executor.json` written in the `publish-report` CI job immediately before `allure generate`. Do not write this file locally; it is meaningless outside CI.

The **Trend** graph accumulates across runs via `actions/cache`. At the start of each `publish-report` job, `actions/cache/restore` restores `allure-results/history` from the most recent `allure-history-*` cache entry; after `allure generate`, `actions/cache/save` writes `allure-report/history` under a new key `allure-history-{run_id}`. The first run finds no cache and generates a single-entry trend; each subsequent run appends one more bar. Do not use `actions/download-artifact` for this purpose — v4 only resolves artifacts from the current workflow run, so cross-run history retrieval silently fails. Do not use `git fetch origin gh-pages` either — the GitHub Actions Pages deployment source does not guarantee a fetchable `gh-pages` branch.

## Naming

- Files: `kebab-case`, page objects `*.page.ts`, specs `*.spec.ts`.
- Test titles: full sentences describing user-visible behavior, not ticket IDs.
- Page object methods: verb-first intentions (`addToCart`, not `clickButton`).
