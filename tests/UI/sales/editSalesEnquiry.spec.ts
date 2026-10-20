import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { editEnquiryData, createProductDetails, editProductDetails } from "../../../testData/salesEnquiryData";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";

test.describe('Edit Sales Enquiry', () => {
    test.setTimeout(250000);
    let createEnquiryData: SalesEnquiryData;
    let extId: string;
    test.beforeEach('Create Sales Enquiry', async ({ salesEnquiryPage, productsPage, loginPage, page, homePage }) => {
        createEnquiryData = getCreateEnquiryData();
        createEnquiryData.product = editEnquiryData.product;
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
        extId = await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
        await expect(productsPage.successMessage('Sales enquiry saved successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry saved successfully');
        console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
        await productsPage.validateProductTabsListed(createEnquiryData.product);
        await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product, createProductDetails);
    });

    test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryAPI, page }) => {
        await page.close();
        await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
    });

    test('Verify sales enquiry is updated successfully', async ({ salesEnquiryPage, productsPage, page, modules }) => {
        // First edit: existing enquiry data is prefilled, then enquiry and product details are changed
        await salesEnquiryPage.editSalesEnquiry(createEnquiryData.customerName);
        await expect(salesEnquiryPage.editSalesEnquiryTitle, "Edit Sales Enquiry title does not match").toHaveText('Edit Sales Enquiry');
        await salesEnquiryPage.validateExistingDataIsVisibleInEditEnquiry(createEnquiryData);
        await salesEnquiryPage.updateSalesEnquiry(editEnquiryData);
        console.log(`Updating sales enquiry customer: ${editEnquiryData.customerName}`);
        await salesEnquiryPage.validateCreateSalesEnquiryAPI(200, 'Update Enquiry');
        await expect(productsPage.successMessage('Sales enquiry saved successfully'), "Sales enquiry update success message does not match").toHaveText('Sales enquiry saved successfully');
        await productsPage.validateProductTabsListed(editEnquiryData.product);
        await productsPage.validateExistingProductDetailsArePrefilled(editEnquiryData.product, createProductDetails);
        await productsPage.editProductDetails(editEnquiryData.product, editProductDetails);
        createEnquiryData.customerName = editEnquiryData.customerName;

        // Second edit: updated enquiry and product details must be prefilled
        const secondEditData = { ...editEnquiryData, projectName: 'Sales Enquiry Test Updated' };
        await salesEnquiryPage.editSalesEnquiry(editEnquiryData.customerName);
        await expect(salesEnquiryPage.editSalesEnquiryTitle, "Edit Sales Enquiry title does not match on second edit").toHaveText('Edit Sales Enquiry');
        // updateSalesEnquiry selects data.date + 1 as the delivery date and data.date + 2 as the pricing date
        await salesEnquiryPage.validateExistingDataIsVisibleInEditEnquiry({ ...editEnquiryData, date: editEnquiryData.date + 1 }, editEnquiryData.date + 2);
        // Update Enquiry stays disabled until the form is modified, so change one field to reach the product page
        await salesEnquiryPage.updateProjectName(secondEditData.projectName);
        await salesEnquiryPage.validateCreateSalesEnquiryAPI(200, 'Update Enquiry');
        await productsPage.validateProductTabsListed(editEnquiryData.product);
        await productsPage.validateExistingProductDetailsArePrefilled(editEnquiryData.product, editProductDetails);

        // View: updated details are visible
        await modules.goToModule({ module: 'Sales', subModule: 'Sales Enquiry' });
        await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
        await salesEnquiryPage.viewSalesEnquiry(editEnquiryData.customerName);
        await salesEnquiryPage.validateViewSalesEnquiryAPI(200);
        await expect(page, "Lead view page URL was not opened after viewing updated sales enquiry").toHaveURL(/leadView/);
        await expect(page.getByRole('heading'), "View Enquiry Title is does not contain View Enquiry").toContainText('View Enquiry');
        await salesEnquiryPage.validateViewEnquiryDetails(secondEditData);
        console.log(`Sales enquiry updated successfully for customer: ${createEnquiryData.customerName}`);
        await salesEnquiryPage.goBack();
    });
});