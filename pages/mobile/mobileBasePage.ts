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
    await this.waitUntilDisplayed(selector, timeout);
    await (await this.driver.$(selector)).click();
  }

  protected async type(selector: string, value: string, timeout = this.defaultTimeout) {
    await this.waitUntilDisplayed(selector, timeout);
    const element = await this.driver.$(selector);
    await element.click();
    await element.setValue(value);
  }

  // true when the element shows up within the timeout, false otherwise (never throws)
  protected async isDisplayed(selector: string, timeout = this.defaultTimeout): Promise<boolean> {
    try {
      await this.waitUntilDisplayed(selector, timeout);
      return true;
    } catch {
      return false;
    }
  }

  // true when the element is gone (or never present) within the timeout
  protected async isNotDisplayed(selector: string, timeout = this.defaultTimeout): Promise<boolean> {
    try {
      await this.driver.waitUntil(async () => !(await this.isShownNow(selector)), {
        timeout,
        interval: 1000,
        timeoutMsg: `element ${selector} is still displayed after ${timeout}ms`,
      });
      return true;
    } catch {
      return false;
    }
  }

  protected async waitUntilDisplayed(selector: string, timeout = this.defaultTimeout) {
    await this.driver.waitUntil(async () => this.isShownNow(selector), {
      timeout,
      interval: 1000,
      timeoutMsg: `element ${selector} is not displayed after ${timeout}ms`,
    });
  }

  // The element is looked up again on every poll. A reference kept across polls goes stale when the React Native screen
  // re-renders and webdriverio then logs "Request encountered a stale element - terminating request" warnings.
  protected async isShownNow(selector: string): Promise<boolean> {
    try {
      const elements = await this.driver.$$(selector);
      return elements.length > 0 && (await elements[0].isDisplayed());
    } catch {
      return false;
    }
  }

  // Swipes the given screen area up until the element is displayed (false when it never shows up). Used for lists that only
  // render part of their rows on the tablet screen.
  protected async scrollUntilDisplayed(
    selector: string,
    area: { left: number; top: number; width: number; height: number },
    maxSwipes = 10
  ): Promise<boolean> {
    for (let swipe = 0; swipe <= maxSwipes; swipe++) {
      if (await this.isShownNow(selector)) return true;
      await this.driver.execute("mobile: scrollGesture", { ...area, direction: "down", percent: 0.8 });
    }
    return false;
  }

  // The on-screen keyboard covers the lower part of the form on the tablet and Appium taps by coordinates.
  // Closed by tapping a non-input element of the screen. driver.hideKeyboard() fails on this app after waiting ~20s and the
  // Back key exits the app when the keyboard is not open (React Native root screen), so neither is used.
  protected async hideKeyboard(neutralElement: string) {
    try {
      if (await this.driver.isKeyboardShown()) {
        await (await this.driver.$(neutralElement)).click();
      }
    } catch {
      // Some screens have no keyboard to hide, nothing to do
    }
  }
}
