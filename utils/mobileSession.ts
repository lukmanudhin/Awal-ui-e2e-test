import * as path from "path";
import { remote } from "webdriverio";
import type { Browser } from "webdriverio";
import { ENV } from "./ENV";

// Owns the Appium session for the Awal Android app. The session is opened lazily (start()) so tests that run a long web/API
// flow first don't hold an idle Appium session, and it is always closed by the fixture teardown (quit()).
export class MobileSession {
  private browser?: Browser;

  get driver(): Browser {
    if (!this.browser) {
      throw new Error("Mobile app session is not started. Call launchAwalApp() before using the mobile pages.");
    }
    return this.browser;
  }

  get isStarted(): boolean {
    return !!this.browser;
  }

  async start(): Promise<void> {
    if (this.browser) return;
    this.browser = await remote({
      hostname: ENV.APPIUM_HOST,
      port: ENV.APPIUM_PORT,
      path: "/",
      logLevel: "warn",
      connectionRetryCount: 1,
      connectionRetryTimeout: 600000,
      // Poll slower than the 500ms default, every find is a request to the UiAutomator2 server on the slow emulator
      waitforInterval: 1000,
      capabilities: {
        platformName: "Android",
        "appium:automationName": "UiAutomator2",
        "appium:app": path.resolve(__dirname, "..", "app", "app-release.apk"),
        "appium:appPackage": ENV.MOBILE_APP_PACKAGE,
        "appium:appActivity": ENV.MOBILE_APP_ACTIVITY,
        "appium:autoGrantPermissions": true,
        // Clear the app data on every session so each run starts on the login screen
        "appium:noReset": false,
        "appium:newCommandTimeout": 600,
        // The emulator is slow on its first start, the Appium defaults (30s) are too short for it
        "appium:uiautomator2ServerLaunchTimeout": 180000,
        "appium:uiautomator2ServerInstallTimeout": 180000,
        "appium:adbExecTimeout": 180000,
        "appium:androidInstallTimeout": 300000,
        "appium:appWaitDuration": 60000,
        // The React Native app keeps animating (spinners), so UiAutomator2 would wait for an "idle" screen on every command
        // and overload the emulator until its server crashes
        "appium:settings[waitForIdleTimeout]": 0,
        "appium:disableWindowAnimation": true,
        ...(ENV.ANDROID_UDID ? { "appium:udid": ENV.ANDROID_UDID } : {}),
      },
    });
  }

  async quit(): Promise<void> {
    if (!this.browser) return;
    try {
      await this.browser.deleteSession();
    } finally {
      this.browser = undefined;
    }
  }
}
