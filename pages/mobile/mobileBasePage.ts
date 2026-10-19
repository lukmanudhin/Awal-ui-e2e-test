import type { Browser } from "webdriverio";
import { MobileSession } from "../../utils/mobileSession";

// Shared helpers for every Awal mobile app screen. Locators in the page classes are selector strings
// ("~content-desc" accessibility ids or XPath) because the app has no testIDs.
export class MobileBasePage {
  protected readonly defaultTimeout = 30000;

  constructor(protected readonly session: MobileSession) {}

  protected get driver(): Browser {
    return this.session.driver;
  }

  protected async tap(selector: string, timeout = this.defaultTimeout) {
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout });
    await element.click();
  }

  protected async type(selector: string, value: string, timeout = this.defaultTimeout) {
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout });
    await element.click();
    await element.setValue(value);
  }

  // true when the element shows up within the timeout, false otherwise (never throws)
  protected async isDisplayed(selector: string, timeout = this.defaultTimeout): Promise<boolean> {
    try {
      await (await this.driver.$(selector)).waitForDisplayed({ timeout });
      return true;
    } catch {
      return false;
    }
  }

  // true when the element is gone (or never present) within the timeout
  protected async isNotDisplayed(selector: string, timeout = this.defaultTimeout): Promise<boolean> {
    try {
      await (await this.driver.$(selector)).waitForDisplayed({ timeout, reverse: true });
      return true;
    } catch {
      return false;
    }
  }

  // The on-screen keyboard covers the lower part of the form on the tablet and Appium taps by coordinates
  protected async hideKeyboard() {
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
      }
    } catch {
      // Some screens have no keyboard to hide, nothing to do
    }
  }
}
