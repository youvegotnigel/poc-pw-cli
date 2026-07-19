# Plan: Critical Flows — saucedemo.com

Captured from live app exploration with playwright-cli on 2026-06-15.
Status: implemented — the specs and page objects below exist in `tests/` and
`src/pages/`.

App facts, auth wiring, and the verified selector table live in
[`docs/app-reference.md`](../docs/app-reference.md).

## Test plan

### 1. Login (`tests/login.spec.ts`)

Uses plain `page` — no storageState (testing auth itself).

| #   | Scenario                                             | Expected                                              |
| --- | ---------------------------------------------------- | ----------------------------------------------------- |
| 1a  | Valid credentials (`standard_user` / `secret_sauce`) | Redirects to `/inventory.html`                        |
| 1b  | Locked-out user (`locked_out_user`)                  | Error contains "Sorry, this user has been locked out" |
| 1c  | Wrong password                                       | Error contains "Username and password do not match"   |

### 2. Inventory (`tests/inventory.spec.ts`)

Uses `authedPage` storageState.

| #   | Scenario                 | Expected                           |
| --- | ------------------------ | ---------------------------------- |
| 2a  | Page loads               | 6 product cards visible            |
| 2b  | Sort by price (low→high) | Prices array is in ascending order |
| 2c  | Add item to cart         | Cart badge shows `1`               |

### 3. Cart (`tests/cart.spec.ts`)

Uses `authedPage`. `beforeEach` adds Sauce Labs Backpack (slug `sauce-labs-backpack`).

| #   | Scenario                   | Expected                                 |
| --- | -------------------------- | ---------------------------------------- |
| 3a  | Added item appears in cart | Cart list contains "Sauce Labs Backpack" |
| 3b  | Remove item                | Cart badge not visible                   |
| 3c  | Continue shopping          | Inventory items visible again            |

### 4. Checkout (`tests/checkout.spec.ts`)

Uses `authedPage`. Full happy-path from inventory through order confirmation.

| #   | Scenario       | Expected                                                                    |
| --- | -------------- | --------------------------------------------------------------------------- |
| 4a  | Complete order | Summary shows item total; confirmation header = "Thank you for your order!" |

### 5. Logout (`tests/logout.spec.ts`)

Uses `authedPage`.

| #   | Scenario             | Expected                                      |
| --- | -------------------- | --------------------------------------------- |
| 5a  | Burger menu → Logout | Back on login page at `/`; login form visible |

## Page objects

- `LoginPage` — goto, login, `errorMessage` locator
- `InventoryPage` — goto, sortBy, addToCart, openCart, logout; `items`, `prices`, `cartBadge` locators
- `CartPage` — removeItem, checkout, continueShopping; `itemNames`, `cartBadge` locators
- `CheckoutPage` — fillInfo, continue, finish, backHome; `subtotal`, `total`, `confirmationHeader` locators
- `BasePage` — open (protected), logout (public), `page` (public readonly)
