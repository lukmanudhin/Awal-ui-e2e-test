import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/baseFixtures";
import { ENV } from "../../../../utils/ENV";
import { getInvalidEnquiryData, invalidEnquiryValues } from "../../../../testData/salesEnquiryEdgeCaseData";

test.describe('Create Sales Enquiry - Validation and Edge Cases', () => {
    let extId: string;
    test.setTimeout(100000);
    test.beforeEach('Login and open Create Sales Enquiry form', async ({ page, loginPage, homePage, salesEnquiryPage }) => {
        extId = '';
        await test.step('Login', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
        });

        await test.step('Open Create Sales Enquiry form', async () => {
            await salesEnquiryPage.clickCreateEnquiryButton();
            await expect(salesEnquiryPage.createSalesEnquiryTitle, "Create Sales Enquiry title does not match").toHaveText('Create Sales Enquiry');
        });
    });

    test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryAPI, page }) => {
        await page.close();
        await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
    });

    test('Verify mandatory field messages are displayed and enquiry is not created when the form is submitted empty', async ({ salesEnquiryPage }) => {
        await salesEnquiryPage.validateCreateSalesEnquiryNotTriggeredAPI('Create Enquiry');
        await expect(salesEnquiryPage.successMessage('Customer name is required'), "Customer name required message does not match").toBeVisible();
        await expect(salesEnquiryPage.successMessage('At least one product must be selected'), "Product required message does not match").toBeVisible();
        await expect(salesEnquiryPage.successMessage('Payment Term is required'), "Payment term required message does not match").toBeVisible();
        console.log('Mandatory field messages are displayed for the empty enquiry form');
    });

    test('Verify enquiry is not created when the customer name contains only spaces', async ({ salesEnquiryPage }) => {
        const invalidEnquiryData = getInvalidEnquiryData({ customerName: invalidEnquiryValues.whitespaceOnly });
        await salesEnquiryPage.enterCustomerName(invalidEnquiryData);
        await salesEnquiryPage.createSalesEnquiry(invalidEnquiryData);
        await salesEnquiryPage.validateCreateSalesEnquiryNotTriggeredAPI('Create Enquiry');
        await expect(salesEnquiryPage.successMessage('Customer name is required'), "Customer name required message does not match").toBeVisible();
    });

    test('Verify enquiry is not created when no product is selected', async ({ salesEnquiryPage }) => {
        const invalidEnquiryData = getInvalidEnquiryData({ product: [] });
        await salesEnquiryPage.enterCustomerName(invalidEnquiryData);
        await salesEnquiryPage.createSalesEnquiry(invalidEnquiryData);
        await salesEnquiryPage.validateCreateSalesEnquiryNotTriggeredAPI('Create Enquiry');
        await expect(salesEnquiryPage.successMessage('At least one product must be selected'), "Product required message does not match").toBeVisible();
    });

    test('Verify enquiry is not created when the email format is invalid', async ({ salesEnquiryPage }) => {
        const invalidEnquiryData = getInvalidEnquiryData({ email1: invalidEnquiryValues.invalidEmail });
        await salesEnquiryPage.enterCustomerName(invalidEnquiryData);
        await salesEnquiryPage.createSalesEnquiry(invalidEnquiryData);
        await salesEnquiryPage.validateCreateSalesEnquiryNotTriggeredAPI('Create Enquiry');
        await expect(salesEnquiryPage.successMessage('Must be valid email format'), "Invalid email message does not match").toBeVisible();
    });

    test('Verify enquiry is not created when the website does not start with http or https', async ({ salesEnquiryPage }) => {
        const invalidEnquiryData = getInvalidEnquiryData({ website: invalidEnquiryValues.invalidWebsite });
        await salesEnquiryPage.enterCustomerName(invalidEnquiryData);
        await salesEnquiryPage.createSalesEnquiry(invalidEnquiryData);
        await salesEnquiryPage.validateCreateSalesEnquiryNotTriggeredAPI('Create Enquiry');
        await expect(salesEnquiryPage.successMessage('Must start with http/https'), "Invalid website message does not match").toBeVisible();
    });
});
