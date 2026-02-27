import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openLogin(): Promise<void> {
    await this.goto('/auth/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByTestId('email').fill(email);
    await this.page.getByTestId('password').fill(password);
    await this.page.getByTestId('login-submit').click();
  }

  async loginWithFirstAvailableAccount(): Promise<boolean> {
    const credentials = [
      { email: 'customer@practicesoftwaretesting.com', password: 'welcome01' },
      { email: 'customer2@practicesoftwaretesting.com', password: 'welcome01' },
      { email: 'customer3@practicesoftwaretesting.com', password: 'pass123' },
    ];

    for (const account of credentials) {
      await this.openLogin();
      await this.login(account.email, account.password);

      if (await this.page.getByText(/account locked/i).isVisible().catch(() => false)) {
        continue;
      }

      if (/\/account/.test(this.page.url())) {
        return true;
      }
    }

    return false;
  }
}