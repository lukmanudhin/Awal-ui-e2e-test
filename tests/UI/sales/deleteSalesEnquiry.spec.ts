import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";

test.describe('Delete Sales Enquiry', () => {
    test.setTimeout(70000);
    let createEnquiryData: SalesEnquiryData;
    test.beforeEach('Login and Create Sales Enquiry', async ({ salesEnquiryPage, productsPage, loginPage, page, homePage }) => {
        createEnquiryData = getCreateEnquiryData();
        await loginPage.launchAwalWebsite();
        await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
        console.log("Login successfull");
        await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
        await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
        await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
        await salesEnquiryPage.clickCreateEnquiryButton();
        await expect(salesEnquiryPage.createSalesEnquiryTitle, "Create Sales Enquiry title does not match").toHaveText('Create Sales Enquiry');
        createEnquiryData.product = ['Acrylic Products'];
        await salesEnquiryPage.enterCustomerName(createEnquiryData);
        await salesEnquiryPage.createSalesEnquiry(createEnquiryData);
        await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
        await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
        console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
        await productsPage.validateProductTabsListed(createEnquiryData.product);
        await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
    });

    test('Verify sales enquiry is deleted successfully', async ({ salesEnquiryPage }) => {
        await salesEnquiryPage.search(createEnquiryData.customerName);
        await salesEnquiryPage.validateDeleteSalesEnquiryAPI(200);
        await expect(salesEnquiryPage.successMessage('Record deleted successfully.'), "Sales enquiry delete success message does not match").toHaveText('Record deleted successfully.');
        console.log(`Sales enquiry for ${createEnquiryData.customerName} deleted successfully`);
        await salesEnquiryPage.validateSalesEnquiryDeleted(createEnquiryData.customerName);
    });

    test.afterEach(async ({ page }) => {
        await page.close();
    });
});