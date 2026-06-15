import { type Page } from '@playwright/test';

/**
 * Common behavior shared by all page objects.
 * Keep this lean: only things every page needs (navigation helpers, waits
 * that are genuinely app-wide). Page-specific logic belongs in the subclass.
 */
export abstract class BasePage {
  protected constructor(readonly page: Page) {}

  protected async open(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Open Menu' }).click();
    await this.page.getByTestId('logout-sidebar-link').click();
  }
}
