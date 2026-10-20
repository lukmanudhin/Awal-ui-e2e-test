import { test, expect } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";

test('tmp smoke: launch Awal app and login', async ({ mobileLoginPage, mobileSession }) => {
    test.setTimeout(400000);
    await mobileLoginPage.launchAwalApp();
    expect(await mobileLoginPage.isLoginScreenDisplayed(), 'Awal app login screen is not displayed after launching the app').toBe(true);
    await mobileLoginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
    expect(await mobileLoginPage.isLoggedIn(), 'Login to the Awal mobile app failed').toBe(true);
    console.log('Login successful in the Awal mobile app');
});