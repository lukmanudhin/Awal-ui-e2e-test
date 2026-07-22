import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";

test.describe('Create Sales Enquiry', () => {
    let createEnquiryData: SalesEnquiryData;
    let extId: string;
    test.setTimeout(100000);
    test.beforeEach('Login', async ({ page, loginPage, homePage, salesEnquiryPage }) => {
        createEnquiryData = getCreateEnquiryData();
        await test.step('Login', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
        });
    });

    test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryAPI, page }) => {
        await page.close();
        await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
    });

    test('Verify new sales enquiry is created successfully', async ({ salesEnquiryPage, productsPage }) => {
        await salesEnquiryPage.clickCreateEnquiryButton();
        await expect(salesEnquiryPage.createSalesEnquiryTitle, "Create Sales Enquiry title does not match").toHaveText('Create Sales Enquiry');
        await salesEnquiryPage.enterCustomerName(createEnquiryData);
        await salesEnquiryPage.createSalesEnquiry(createEnquiryData);
        await salesEnquiryPage.goToTab('Shipping Address');
        await salesEnquiryPage.enterAddress(createEnquiryData);
        await salesEnquiryPage.goToTab('Billing Address');
        await salesEnquiryPage.enterAddress(createEnquiryData);
        extId = await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
        await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
        console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
        await productsPage.validateProductTabsListed(createEnquiryData.product);
        await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
        await salesEnquiryPage.search(createEnquiryData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Sales enquiry status does not match").toHaveText('Enquiry Created');
        await expect(salesEnquiryPage.createdSalesEnquiry(createEnquiryData.customerName), `Created sales enquiry is not visible for customer: ${createEnquiryData.customerName}`).toBeVisible();
    });
});