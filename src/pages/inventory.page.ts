import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  readonly items: Locator;
  readonly prices: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.getByTestId('inventory-item');
    this.prices = page.getByTestId('inventory-item-price');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async goto(): Promise<void> {
    await this.open('/inventory.html');
  }

  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.page.getByTestId('product-sort-container').selectOption(value);
  }

  async addToCart(itemSlug: string): Promise<void> {
    await this.page.getByTestId(`add-to-cart-${itemSlug}`).click();
  }

  async openCart(): Promise<void> {
    await this.page.getByTestId('shopping-cart-link').click();
  }
}
