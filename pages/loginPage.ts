import { Page, Locator } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class LoginPage extends BasePage {
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly signInButton: Locator;
  constructor(public readonly page: Page) {
    super(page);
    this.email = this.page.getByRole('textbox', { name: 'Email ID' });
    this.password = this.page.getByRole('textbox', { name: 'Password' });
    this.signInButton = this.page.getByRole('button', { name: 'Sign In' });
  }
  @step()
  async login(emailId: string, password: string) {
    await this.email.fill(emailId);
    await this.password.fill(password);
    await this.signInButton.click();
    // await this.page.waitForLoadState('domcontentloaded');
  }
  @step()
  async launchAwalWebsite() {
    await this.page.goto(`${process.env.BASE_URL}`);
    await this.page.waitForLoadState('domcontentloaded');
  }
}