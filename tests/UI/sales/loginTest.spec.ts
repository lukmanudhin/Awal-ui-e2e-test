import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";

test.describe('Login Test', () => {
  test('Verify user can login successfully with valid credentials', async ({ loginPage, page, homePage, modules }) => {
    await loginPage.launchAwalWebsite();
    await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
    await expect(page, "Login did not navigate to home page").toHaveURL(`${ENV.BASE_URL}/home`);
    await homePage.goToMenuAndSubMenu("Core Masters", 'Asset Type Master');
    // await modules.goToModule({ module: "Sales", subModule: 'Dashboards', nestedSubModule: 'Manager Dashboard' });
  });

  test('Verify alert message is displayed with invalid credentials', async ({ loginPage }) => {
    await loginPage.launchAwalWebsite();
    await loginPage.login(`${ENV.EMAIL_ID}`, `InvalidPassword`);
    await expect(loginPage.successMessage('Invalid Password.'), 'Invalid Password message does not match').toHaveText('Invalid Password.');
  });

  test.afterEach('teardown', async ({ page }) => {
    await page.close();
  });
});
