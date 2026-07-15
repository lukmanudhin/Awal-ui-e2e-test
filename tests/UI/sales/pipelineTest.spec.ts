import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";
import { getPipelineData, PipelineData } from "../../../testData/pipelineData";

test.describe('Verify Pipeline E2E Test', () => {
    let createEnquiryData: SalesEnquiryData;
    let pipelineData: PipelineData;
    let enquiryId: string;
    let extId: string

    test.setTimeout(100000);
    test.beforeEach('Login and Create Sales Enquiry', async ({ page, loginPage, homePage, salesEnquiryPage, productsPage }) => {
        createEnquiryData = getCreateEnquiryData();
        pipelineData = getPipelineData();
        await test.step('Login', async () => {
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
            extId = await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
            await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
            console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
            await productsPage.validateProductTabsListed(createEnquiryData.product);
            await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
            await expect(page, "Sales Enquiry list page is not opened").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            enquiryId = await salesEnquiryPage.search(createEnquiryData.customerName);
            pipelineData.enquiry = `${enquiryId}-${createEnquiryData.customerName}`;
        });
    });

    test.afterEach('Delete Sales Enquiry', async ({ page, salesEnquiryAPI }) => {
        await page.close();
        const accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        const deleteAPIResponse = await salesEnquiryAPI.deleteSalesEnquiry(accessToken, extId);
        expect(deleteAPIResponse.message, 'Delete Sales Enquiry API Message Mismatch').toBe('Data deleted successfully');
        console.log('----------------------Delete Sales Enquiry API Response---------------------');
        console.log('API Response:', deleteAPIResponse);
    });

    test('Verify Sales Return E2E Flow', async ({ modules, pipelinePage }) => {
        await modules.goToModule({ module: 'Sales', subModule: 'Pipelines' });
        await pipelinePage.clickCreatePipeline();
        await pipelinePage.selectSalesEnquiry(pipelineData.enquiry);
        await pipelinePage.validateSalesEnquiryDetails(createEnquiryData);
        await pipelinePage.addPipeline(pipelineData);
        await pipelinePage.validateAddToPipelineAPI(201);
        await expect(pipelinePage.successMessage('Pipeline converted successfully'), "Pipeline success message does not match").toHaveText('Pipeline converted successfully');
        await pipelinePage.search(createEnquiryData.customerName);
        await pipelinePage.clickViewIcon();
        await pipelinePage.validateSalesEnquiryDetails(createEnquiryData);
        await pipelinePage.goToTab('icon Notes');
        await pipelinePage.addNoteAndValidateAPI(pipelineData.note, 200);
        await expect(pipelinePage.successMessage("Pipeline notes added successfully")).toHaveText("Pipeline notes added successfully");
        await pipelinePage.validateCreatedTaskVisible();
        await pipelinePage.goToTab('icon Meeting Scheduler');
        await pipelinePage.addMeetingAndValidateAPI(pipelineData.meetingDescription, 200);
        await expect(pipelinePage.successMessage('Pipeline meeting added successfully'), 'Pipeline meeting message does not match').toHaveText('Pipeline meeting added successfully');
        await pipelinePage.validateCreatedTaskVisible();
        await pipelinePage.goToTab('icon Email');
        await pipelinePage.createEmailAndValidateAPI(pipelineData, 200);
        await expect(pipelinePage.successMessage('Pipeline email created successfully'), 'Pipeline email success message does not match').toHaveText('Pipeline email created successfully');
        await pipelinePage.validateCreatedTaskVisible();
        await pipelinePage.goToTab('icon Files');
        await pipelinePage.uploadFileAndValidateAPI(pipelineData.fileRemarks, 200);
        await expect(pipelinePage.successMessage('Pipeline file created successfully'), 'Pipeline file message does not match').toHaveText('Pipeline file created successfully');
        await pipelinePage.validatePipelineTable(pipelineData);
    });
});