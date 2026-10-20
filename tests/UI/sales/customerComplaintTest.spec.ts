import { expect, test } from "../../../fixtures/baseFixtures";
import { CustomerComplaintData, getCustomerComplaintData } from "../../../testData/customerComplaintData";
import { ENV } from "../../../utils/ENV";


test.describe('Verify Customer Complaint E2E Flow', () => {
    let customerComplaintData: CustomerComplaintData;
    test.beforeEach('Login', async ({ page, loginPage, homePage, modules }) => {
        customerComplaintData = getCustomerComplaintData();
        await test.step('Login', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            await modules.goToModule({ subModule: 'Customer Complaint Report' });
        });
    });

    test.afterEach('Delete Sales Enquiry', async ({ page }) => {
        await page.close();
    });
    test('test', async ({ customerComplaintPage }) => {
        await customerComplaintPage.submitComplaintRegistrationForm(customerComplaintData);
        await expect(customerComplaintPage.successMessage('Customer complaint submitted successfully'), "Customer complaint success message does not match").toHaveText('Customer complaint submitted successfully');
        await expect(customerComplaintPage.status('Pending For Approval'), "Customer complaint status does not match").toBeVisible();
    });
});