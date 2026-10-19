import { step } from "../basePage";
import { MobileBasePage } from "./mobileBasePage";
import { MobileSession } from "../../utils/mobileSession";

export class MobileLoginPage extends MobileBasePage {
  private readonly welcomeText = '//android.widget.TextView[@text="Welcome to Awal Plastics"]';
  private readonly emailField = '//android.widget.EditText[@hint="Enter Your Mail ID"]';
  // The field's text turns into dots once typed, so it is located by its hint
  private readonly passwordField = '//android.widget.EditText[@hint="Enter Your Password"]';
  private readonly signInButton = "~Sign In";

  constructor(session: MobileSession) {
    super(session);
  }

  @step()
  async launchAwalApp() {
    await this.session.start();
  }

  async isLoginScreenDisplayed(timeout?: number): Promise<boolean> {
    return this.isDisplayed(this.welcomeText, timeout);
  }

  @step()
  async login(emailId: string, password: string) {
    await this.type(this.emailField, emailId);
    // The keyboard opened by the email field covers the password field
    await this.hideKeyboard();
    await this.type(this.passwordField, password);
    await this.hideKeyboard();
    await this.tap(this.signInButton);
  }

  // The login screen is replaced by the app's landing screen once the credentials are accepted. The Sign In button can't be
  // used for this, its label is replaced by a spinner while the login request is running.
  async isLoggedIn(timeout = 60000): Promise<boolean> {
    return this.isNotDisplayed(this.welcomeText, timeout);
  }
}
