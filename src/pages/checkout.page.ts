import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  readonly subtotal: Locator;
  readonly total: Locator;
  readonly confirmationHeader: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.subtotal = page.getByTestId('subtotal-label');
    this.total = page.getByTestId('total-label');
    this.confirmationHeader = page.getByTestId('complete-header');
    this.errorMessage = page.getByTestId('error');
  }

  async fillInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.page.getByTestId('firstName').fill(firstName);
    await this.page.getByTestId('lastName').fill(lastName);
    await this.page.getByTestId('postalCode').fill(postalCode);
  }

  async continue(): Promise<void> {
    await this.page.getByTestId('continue').click();
  }

  async finish(): Promise<void> {
    await this.page.getByTestId('finish').click();
  }

  async backHome(): Promise<void> {
    await this.page.getByTestId('back-to-products').click();
  }
}
