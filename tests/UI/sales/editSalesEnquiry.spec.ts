import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { editEnquiryData } from "../../../testData/salesEnquiryData";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";

test.describe('Edit Sales Enquiry', () => {
    test.setTimeout(150000);
    let createEnquiryData: SalesEnquiryData;
    test.beforeEach('Create Sales Enquiry', async ({ salesEnquiryPage, productsPage, loginPage, page, homePage }) => {
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
        await salesEnquiryPage.enterCustomerName(createEnquiryData);
        await salesEnquiryPage.createSalesEnquiry(createEnquiryData);
        await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
        await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
        console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
        await productsPage.validateProductTabsListed(createEnquiryData.product);
        await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
    });

    test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryPage, page }) => {
        await salesEnquiryPage.search(createEnquiryData.customerName);
        await salesEnquiryPage.validateDeleteSalesEnquiryAPI(200);
        await expect(salesEnquiryPage.successMessage('Record deleted successfully.'), "Sales enquiry delete success message does not match").toHaveText('Record deleted successfully.');
        console.log(`Sales enquiry for ${editEnquiryData.customerName} deleted successfully`);
        await page.close();
    });
    
    test('Verify sales enquiry is updated successfully', async ({ salesEnquiryPage, productsPage, page }) => {
        await salesEnquiryPage.editSalesEnquiry(createEnquiryData.customerName);
        await expect(salesEnquiryPage.editSalesEnquiryTitle, "Edit Sales Enquiry title does not match").toHaveText('Edit Sales Enquiry');
        await salesEnquiryPage.validateExistingDataIsVisibleInEditEnquiry(createEnquiryData);
        await salesEnquiryPage.updateSalesEnquiry(editEnquiryData);
        console.log(`Updating sales enquiry customer: ${editEnquiryData.customerName}`);
        await salesEnquiryPage.validateCreateSalesEnquiryAPI(200, 'Update Enquiry');
        await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry update success message does not match").toHaveText('Sales enquiry upserted successfully');
        await productsPage.validateProductTabsListed(editEnquiryData.product);
        await productsPage.enterAndSaveAllSelectedProductDetails(editEnquiryData.product);
        await salesEnquiryPage.viewSalesEnquiry(editEnquiryData.customerName);
        await salesEnquiryPage.validateViewSalesEnquiryAPI(200);
        await expect(page, "Lead view page URL was not opened after viewing updated sales enquiry").toHaveURL(/leadView/);
        await expect(page.getByRole('heading'), "View Enquiry Title is does not contain View Enquiry").toContainText('View Enquiry');
        await salesEnquiryPage.validateViewEnquiryDetails(editEnquiryData);
        createEnquiryData.customerName = editEnquiryData.customerName;
        console.log(`Sales enquiry updated successfully for customer: ${createEnquiryData.customerName}`);
        await salesEnquiryPage.goBack();
    });
});