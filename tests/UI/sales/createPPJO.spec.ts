import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";

test.describe('Create PPJO', () => {
    let createEnquiryData: SalesEnquiryData;
    test.setTimeout(100000);
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
        createEnquiryData.product = ['Acrylic Products'];
        await salesEnquiryPage.enterCustomerName(createEnquiryData);
        await salesEnquiryPage.createSalesEnquiry(createEnquiryData);
        await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
        await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
        console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
        await productsPage.validateProductTabsListed(createEnquiryData.product);
        await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
        await expect(page, "Sales Enquiry list page is not opened").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
    });

    test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryPage, page }) => {
        await salesEnquiryPage.deleteSalesEnquiry(createEnquiryData.customerName);
        await salesEnquiryPage.validateDeleteSalesEnquiryAPI(200);
        await expect(salesEnquiryPage.successMessage('Record deleted successfully.'), "Sales enquiry delete success message does not match").toHaveText('Record deleted successfully.');
        console.log(`Sales enquiry for ${createEnquiryData.customerName} deleted successfully`);
        await page.close();
    });

    test('Verify user is able to create PPJO and request estimation', async ({ salesEnquiryPage, ppjoPage, page }) => {
        await salesEnquiryPage.search(createEnquiryData.customerName);
        await expect(salesEnquiryPage.createdSalesEnquiry(createEnquiryData.customerName), `Created sales enquiry is not visible for customer: ${createEnquiryData.customerName}`).toBeVisible();
        await salesEnquiryPage.clickCreatePPJO();
        await expect(page, "Create PPJO page was not opened").toHaveURL(/create-ppjo/);
        await ppjoPage.validateSalesEnquiryDetailsInPPJO(createEnquiryData);
        await expect(ppjoPage.requestEstimationButton, "Request Estimation button should be disabled before artwork request").toBeDisabled();
        await ppjoPage.requestArtwork();
        await ppjoPage.validatePPJOAPI(201, 'Request Artwork');
        await expect(ppjoPage.successMessage('Artwork request submitted successfully'), "Request Artwork success message does not match").toContainText('Artwork request submitted successfully');
        await expect(ppjoPage.requestEstimationButton, "Request Estimation button should be enabled after artwork request").toBeEnabled();
        await ppjoPage.requestAutoCAD();
        await ppjoPage.validatePPJOAPI(201, 'Request AutoCAD');
        await expect(ppjoPage.successMessage('Autocad request submitted successfully'), "Request AutoCAD success message does not match").toContainText('Autocad request submitted successfully');
        await ppjoPage.requestSiteVisit('EMP00287 - Neelamegam Subramani');
        await ppjoPage.validatePPJOAPI(201, 'Request Site Visit');
        await expect(ppjoPage.successMessage('Site-visit request submitted successfully'), "Request Site Visit success message does not match").toContainText('Site-visit request submitted successfully');
        await ppjoPage.requestProcurement();
        await ppjoPage.validatePPJOAPI(201, 'Request Procurement');
        await expect(ppjoPage.successMessage('Procurement request submitted successfully'), "Request Procurement success message does not match").toContainText('Procurement request submitted successfully');
        await ppjoPage.requestEstimation();
        await ppjoPage.validatePPJOAPI(201, 'Request Estimation');
        await expect(ppjoPage.successMessage('Estimation request submitted successfully'), "Request Estimation success message does not match").toContainText('Estimation request submitted successfully');
        await ppjoPage.validatePPJOTableDetails();
        await ppjoPage.goBackFromPPJO();
        await expect(page, "Sales Enquiry list page was not opened after going back from PPJO").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
        await salesEnquiryPage.search(createEnquiryData.customerName);
        await salesEnquiryPage.validateCustomerStatus(createEnquiryData.customerName, 'Pending From Estimation');
        await salesEnquiryPage.validateCustomerPPJOColumn(createEnquiryData.customerName, ['Artwork', 'AutoCAD', 'Estimation', 'Procurement', 'Site Visit']);
    });
});
