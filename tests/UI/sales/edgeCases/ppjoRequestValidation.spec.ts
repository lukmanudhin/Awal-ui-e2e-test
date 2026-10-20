import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/baseFixtures";
import { ENV } from "../../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../../testData/salesEnquiryData";
import { getInvalidPPJORequestDetails } from "../../../../testData/salesEnquiryEdgeCaseData";
import { salesEnquiryNormalPayload } from "../../../../API-payloads/salesEnquiryNormalPayload";

test.describe('PPJO Requests - Validation and Edge Cases', () => {
    let createEnquiryData: SalesEnquiryData;
    let extId: string;
    test.setTimeout(100000);
    test.beforeEach('Create Sales Enquiry through API and open Create PPJO', async ({ page, loginPage, homePage, salesEnquiryPage, salesEnquiryAPI }) => {
        extId = '';
        createEnquiryData = getCreateEnquiryData();
        await test.step('Create Sales Enquiry with Acrylic product through API', async () => {
            const accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            const response = await salesEnquiryAPI.createSalesEnquiryAPI(accessToken, { ...salesEnquiryNormalPayload, customerName: createEnquiryData.customerName });
            extId = response.result.extId;
            await salesEnquiryAPI.createAcrylicProducts(accessToken, extId);
            console.log(`Sales enquiry created through API for customer: ${createEnquiryData.customerName}`);
        });

        await test.step('Login and open Create PPJO', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            await salesEnquiryPage.search(createEnquiryData.customerName);
            await salesEnquiryPage.clickCreatePPJO();
            await expect(page, "Create PPJO page was not opened").toHaveURL(/create-ppjo/);
        });
    });

    test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryAPI, page }) => {
        await page.close();
        await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
    });

    test('Verify Request Artwork is not submitted when document and quantity are missing', async ({ ppjoPage }) => {
        await ppjoPage.enterArtworkRequestDetails(getInvalidPPJORequestDetails({ attachFile: false, quantity: '', description: '' }));
        await ppjoPage.validatePPJONotTriggeredAPI('Request Artwork');
        await expect(ppjoPage.successMessage('Document is required'), "Document required message does not match").toBeVisible();
        await expect(ppjoPage.successMessage('Quantity is required'), "Quantity required message does not match").toBeVisible();
    });

    test('Verify Request Artwork is not submitted when the document is not attached', async ({ ppjoPage }) => {
        await ppjoPage.enterArtworkRequestDetails(getInvalidPPJORequestDetails({ attachFile: false }));
        await ppjoPage.validatePPJONotTriggeredAPI('Request Artwork');
        await expect(ppjoPage.successMessage('Document is required'), "Document required message does not match").toBeVisible();
    });

    test('Verify Request Artwork is not submitted when the quantity is missing', async ({ ppjoPage }) => {
        await ppjoPage.enterArtworkRequestDetails(getInvalidPPJORequestDetails({ quantity: '' }));
        await ppjoPage.validatePPJONotTriggeredAPI('Request Artwork');
        await expect(ppjoPage.successMessage('Quantity is required'), "Quantity required message does not match").toBeVisible();
    });

    test('Verify Request Artwork is not submitted when the quantity is zero', async ({ ppjoPage }) => {
        await ppjoPage.enterArtworkRequestDetails(getInvalidPPJORequestDetails({ quantity: '0' }));
        await ppjoPage.validatePPJONotTriggeredAPI('Request Artwork');
        await expect(ppjoPage.successMessage('Quantity is required'), "Quantity required message does not match").toBeVisible();
    });

    test('Verify Request Artwork is not submitted when the quantity is negative', async ({ ppjoPage }) => {
        await ppjoPage.enterArtworkRequestDetails(getInvalidPPJORequestDetails({ quantity: '-5' }));
        await ppjoPage.validatePPJONotTriggeredAPI('Request Artwork');
        await expect(ppjoPage.successMessage('Quantity is required'), "Quantity required message does not match").toBeVisible();
    });

    test('Verify Request Artwork is rejected by the server when the quantity is a decimal value', async ({ ppjoPage }) => {
        await ppjoPage.enterArtworkRequestDetails(getInvalidPPJORequestDetails({ quantity: '2.5' }));
        await ppjoPage.validatePPJOAPI(400, 'Request Artwork');
        await expect(ppjoPage.successMessage('Validation failed.'), "Validation failed message does not match").toBeVisible();
    });

    test('Verify Request Artwork is rejected by the server when the quantity exceeds the allowed range', async ({ ppjoPage }) => {
        await ppjoPage.enterArtworkRequestDetails(getInvalidPPJORequestDetails({ quantity: '99999999999' }));
        await ppjoPage.validatePPJOAPI(400, 'Request Artwork');
        await expect(ppjoPage.successMessage('Validation failed.'), "Validation failed message does not match").toBeVisible();
    });

    test('Verify Request Artwork is submitted successfully without a description', async ({ ppjoPage }) => {
        await ppjoPage.enterArtworkRequestDetails(getInvalidPPJORequestDetails({ description: '' }));
        await ppjoPage.validatePPJOAPI(201, 'Request Artwork');
        await expect(ppjoPage.successMessage('Artwork request submitted successfully'), "Request Artwork success message does not match").toContainText('Artwork request submitted successfully');
    });

    test('Verify Request Site Visit is not submitted when the visit date is missing', async ({ ppjoPage }) => {
        await ppjoPage.openSiteVisitRequest();
        await ppjoPage.validatePPJONotTriggeredAPI('Request Site Visit');
        await expect(ppjoPage.successMessage('Site Visit Request Date is required'), "Site visit date required message does not match").toBeVisible();
    });
});
