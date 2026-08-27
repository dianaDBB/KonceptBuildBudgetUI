import { Page } from '@fixtures';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(public page: Page) {
    super(page);
  }

  locators = {
    section: () => {
      return this.getLocatorSource().getByTestId('login');
    },
    form: {
      section: () => {
        return this.locators.section().getByTestId('login-form');
      },
      username: () => {
        return this.locators.form.section().getByTestId('username');
      },
      password: () => {
        return this.locators.form.section().getByTestId('password');
      },
      signInButton: () => {
        return this.locators.form.section().getByTestId('sign-in-button');
      },
    },
  };

  async goTo(): Promise<void> {
    await this.page.goto('/login');
  }
}
