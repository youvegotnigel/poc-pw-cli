import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly itemNames: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.getByTestId('inventory-item-name');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async removeItem(itemSlug: string): Promise<void> {
    await this.page.getByTestId(`remove-${itemSlug}`).click();
  }

  async checkout(): Promise<void> {
    await this.page.getByTestId('checkout').click();
  }

  async continueShopping(): Promise<void> {
    await this.page.getByTestId('continue-shopping').click();
  }
}
