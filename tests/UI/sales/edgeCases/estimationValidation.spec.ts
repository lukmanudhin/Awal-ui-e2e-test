import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/baseFixtures";
import { ENV } from "../../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../../testData/salesEnquiryData";
import { addBOQData } from "../../../../testData/addBoqData";
import { getInvalidBOQData, invalidBOMValues } from "../../../../testData/salesEnquiryEdgeCaseData";
import { salesEnquiryNormalPayload } from "../../../../API-payloads/salesEnquiryNormalPayload";
import type { CostEstimationPage } from "../../../../pages/costEstimationPage";

test.describe('Cost Estimation - Validation and Edge Cases', () => {
    let createEnquiryData: SalesEnquiryData;
    let extId: string;
    test.setTimeout(300000);

    // BOQ must exist and be generated before consumables / BOM can be entered
    const createBOQAndGenerateEstimation = async (costEstimationPage: CostEstimationPage) => {
        await costEstimationPage.addBOQ(addBOQData);
        await costEstimationPage.validateAddBOQAPI(201);
        await expect(costEstimationPage.successMessage('BOQ created successfully'), "BOQ creation success message does not match").toContainText('BOQ created successfully');
        await costEstimationPage.clickGenerateCostEstimationAndValidateBOQ_API(200);
        await expect(costEstimationPage.boqDetailsTitle, "BOQ Details title does not match").toContainText('BOQ Details');
    };

    test.beforeEach('Create enquiry and PPJO requests through API and open Add Estimation', async ({ page, loginPage, homePage, modules, salesEnquiryPage, requestNormalPage, costEstimationPage, salesEnquiryAPI, ppjoAPI }) => {
        extId = '';
        createEnquiryData = getCreateEnquiryData();
        await test.step('Create Sales Enquiry, Artwork and Estimation requests through API', async () => {
            const accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            const response = await salesEnquiryAPI.createSalesEnquiryAPI(accessToken, { ...salesEnquiryNormalPayload, customerName: createEnquiryData.customerName });
            extId = response.result.extId;
            await salesEnquiryAPI.createAcrylicProducts(accessToken, extId);
            await ppjoAPI.requestArtwork(accessToken, extId, '5', 'Artwork requirement details');
            await ppjoAPI.requestEstimation(accessToken, extId, '5', 'Estimation requirement details');
            console.log(`Sales enquiry with PPJO requests created through API for customer: ${createEnquiryData.customerName}`);
        });

        await test.step('Login and open Add Estimation from Estimation - Request (Normal)', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            const enquiryId = await salesEnquiryPage.search(createEnquiryData.customerName);
            await salesEnquiryPage.validateCustomerStatus(createEnquiryData.customerName, 'Pending From Estimation');
            await modules.goToModule({ module: 'Estimation', subModule: 'Request (Normal)' });
            await salesEnquiryPage.search(enquiryId);
            await requestNormalPage.clickGenerateCostEstimation();
            await expect(costEstimationPage.costEstimationTitle, "Create Cost Estimation title does not match").toContainText('Create Cost Estimation');
            await costEstimationPage.clickAddEstimation();
        });
    });

    test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryAPI, page }) => {
        await page.close();
        await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
    });

    test('Verify BOQ is not created and mandatory field messages are displayed when the BOQ form is empty', async ({ costEstimationPage }) => {
        await costEstimationPage.openNewBOQForm();
        await costEstimationPage.validateAddBOQNotTriggeredAPI();
        for (const message of ['Finished product is required', 'Sign Code is required', 'Sign Type is required', 'Sign Name is required', 'Description is required', 'Size is required', 'Quantity is required', 'Delivery Type is required']) {
            await expect(costEstimationPage.successMessage(message), `"${message}" message is not displayed`).toBeVisible();
        }
    });

    test('Verify BOQ is not created when the quantity is zero', async ({ costEstimationPage }) => {
        await costEstimationPage.addBOQ(getInvalidBOQData({ quantity: '0' }));
        await costEstimationPage.validateAddBOQNotTriggeredAPI();
        await expect(costEstimationPage.successMessage('Quantity must be greater than 0'), "Quantity greater than 0 message does not match").toBeVisible();
    });

    test('Verify BOQ is not created when the quantity is negative', async ({ costEstimationPage }) => {
        await costEstimationPage.addBOQ(getInvalidBOQData({ quantity: '-1' }));
        await costEstimationPage.validateAddBOQNotTriggeredAPI();
        await expect(costEstimationPage.successMessage('Quantity must be greater than 0'), "Quantity greater than 0 message does not match").toBeVisible();
    });

    test('Verify BOQ is not created when the delivery period is negative', async ({ costEstimationPage }) => {
        await costEstimationPage.addBOQ(getInvalidBOQData({ deliveryPeriod: '-1' }));
        await costEstimationPage.validateAddBOQNotTriggeredAPI();
        await expect(costEstimationPage.successMessage('Delivery Period must be greater than 0'), "Delivery period greater than 0 message does not match").toBeVisible();
    });

    test('Verify consumable percentage is not saved when the value is zero', async ({ costEstimationPage }) => {
        await createBOQAndGenerateEstimation(costEstimationPage);
        await expect(costEstimationPage.addBOMBtn, "Add BOM button is not disabled").toBeDisabled();
        await costEstimationPage.addConsumables('0');
        await costEstimationPage.validateConsumablesNotTriggeredAPI();
        await expect(costEstimationPage.successMessage('Value must be greater than 0'), "Consumable value greater than 0 message does not match").toBeVisible();
        await expect(costEstimationPage.addBOMBtn, "Add BOM button should stay disabled when consumables are not saved").toBeDisabled();
    });

    test('Verify BOM is not added when the quantity is zero', async ({ costEstimationPage }) => {
        await createBOQAndGenerateEstimation(costEstimationPage);
        await costEstimationPage.addConsumables('3');
        await costEstimationPage.validateConsumablesAPI(200);
        await expect(costEstimationPage.successMessage('Consumable percentage updated successfully'), "Consumable percentage updated success message does not match").toContainText('Consumable percentage updated successfully');
        await costEstimationPage.addBOM(invalidBOMValues.material, '0', invalidBOMValues.warrantyValue);
        await costEstimationPage.validateAddBOMNotTriggeredAPI();
        await expect(costEstimationPage.successMessage('Quantity must be greater than 0'), "BOM quantity greater than 0 message does not match").toBeVisible();
    });

    test('Verify BOM is not added when the quantity is negative', async ({ costEstimationPage }) => {
        await createBOQAndGenerateEstimation(costEstimationPage);
        await costEstimationPage.addConsumables('3');
        await costEstimationPage.validateConsumablesAPI(200);
        await expect(costEstimationPage.successMessage('Consumable percentage updated successfully'), "Consumable percentage updated success message does not match").toContainText('Consumable percentage updated successfully');
        await costEstimationPage.addBOM(invalidBOMValues.material, '-3', invalidBOMValues.warrantyValue);
        await costEstimationPage.validateAddBOMNotTriggeredAPI();
        await expect(costEstimationPage.successMessage('Quantity must be greater than 0'), "BOM quantity greater than 0 message does not match").toBeVisible();
    });
});
