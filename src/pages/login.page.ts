import { type Page, type Locator } from '@playwright/test';
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

  async goto(): Promise<void> {
    await this.open('/login');
  }

  async login(user: string, pass: string): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.signIn.click();
  }
}
