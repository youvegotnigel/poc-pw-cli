# App reference — saucedemo.com

Durable facts about the app under test: URLs, auth wiring, and the verified
selector catalogue. Read this before writing any locator. Plans in `specs/`
and page objects link here instead of repeating this table.

> Selectors verified against the live app with `playwright-cli` on 2026-06-15.
> If a locator fails, re-verify with a fresh snapshot (see
> `docs/playwright-cli.md`) and update this table — do not patch blind.

## App facts

- Base URL: https://www.saucedemo.com (override with `BASE_URL`)
- Login page: `/` (root) — there is no `/login` route
- Post-login landing: `/inventory.html`
- Credentials come from `resolveEnv()` in `src/config/env.ts`
  (defaults `standard_user` / `secret_sauce`)
- The app exposes `data-test` attributes, **not** `data-testid`.
  `playwright.config.ts` sets `testIdAttribute: 'data-test'`, so `getByTestId`
  works against them.
- No server-side seed/reset endpoint. To reset state, use the burger menu's
  "Reset App State" or clear cookies/localStorage in a fixture.

## Auth architecture (as built)

- `tests/auth.setup.ts` — a `setup` project logs in once and saves
  `auth/storageState.json` (git-ignored).
- `playwright.config.ts` — browser projects depend on `setup` and load that
  `storageState` at the project level.
- `authedPage` fixture (`src/fixtures/test-fixtures.ts`) — a page in a fresh
  context loaded with the saved state; all page-object fixtures derive from it.
- `loginPage` fixture — uses the default `page`. Because projects set
  `storageState` at the project level, a test that must start logged out has to
  override it: `test.use({ storageState: { cookies: [], origins: [] } })`.

## Verified selectors

| Element                    | Locator                                                        |
| -------------------------- | -------------------------------------------------------------- |
| Username input             | `getByTestId('username')`                                      |
| Password input             | `getByTestId('password')`                                      |
| Login button               | `getByTestId('login-button')`                                  |
| Login error                | `getByTestId('error')`                                         |
| Product items              | `getByTestId('inventory-item')`                                |
| Product names              | `getByTestId('inventory-item-name')`                           |
| Product prices             | `getByTestId('inventory-item-price')`                          |
| Add to cart (list)         | `getByTestId('add-to-cart-{slug}')`                            |
| Sort dropdown              | `getByTestId('product-sort-container')`                        |
| Cart badge                 | `getByTestId('shopping-cart-badge')`                           |
| Cart link                  | `getByTestId('shopping-cart-link')`                            |
| Cart item names            | `getByTestId('inventory-item-name')`                           |
| Remove item                | `getByTestId('remove-{slug}')`                                 |
| Continue shopping          | `getByTestId('continue-shopping')`                             |
| Checkout button            | `getByTestId('checkout')`                                      |
| First name                 | `getByTestId('firstName')`                                     |
| Last name                  | `getByTestId('lastName')`                                      |
| Postal code                | `getByTestId('postalCode')`                                    |
| Continue (checkout step 1) | `getByTestId('continue')`                                      |
| Subtotal                   | `getByTestId('subtotal-label')`                                |
| Total                      | `getByTestId('total-label')`                                   |
| Finish                     | `getByTestId('finish')`                                        |
| Order confirmation heading | `getByTestId('complete-header')` → "Thank you for your order!" |
| Burger menu open           | `getByRole('button', { name: 'Open Menu' })`                   |
| Logout link                | `getByTestId('logout-sidebar-link')`                           |
