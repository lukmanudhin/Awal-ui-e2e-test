import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/baseFixtures";
import { ENV } from "../../../../utils/ENV";
import { getCreateEnquiryData } from "../../../../testData/salesEnquiryData";
import { SalesFlowSeeder, type SalesFlowStage, type SalesFlowApis } from "../../../../API/salesFlowSeeder";
import type { HomePage } from "../../../../pages/homePage";
import type { SalesEnquiryPage } from "../../../../pages/salesEnqueryPage";

test.describe('Quotation - Validation and Edge Cases', () => {
    let extId: string;
    test.setTimeout(300000);

    test.beforeEach('Login', async ({ page, loginPage }) => {
        extId = '';
        await test.step('Login', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
        });
    });

    test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryAPI, page }) => {
        await page.close();
        await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
    });

    // Seeds the enquiry through API up to the requested stage and returns its enquiry number from the Sales Enquiry list
    const seedEnquiryUntil = async (stage: SalesFlowStage, apis: SalesFlowApis, homePage: HomePage, salesEnquiryPage: SalesEnquiryPage) => {
        const customerName = getCreateEnquiryData().customerName;
        await new SalesFlowSeeder(apis).seedUntil(stage, customerName, (enquiryExtId) => { extId = enquiryExtId; });
        await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
        return await salesEnquiryPage.search(customerName);
    };

    test('Verify quotation approval is not submitted when document name, attachment and document number are missing', async ({ homePage, modules, salesEnquiryPage, quotationManagerPage, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }) => {
        const enquiryId = await seedEnquiryUntil('quotationSentToCustomer', { salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }, homePage, salesEnquiryPage);
        await modules.goToModule({ subModule: 'Quotation' });
        await quotationManagerPage.search(enquiryId);
        await expect(quotationManagerPage.status('Quotation Sent To Customer'), 'Quotation status does not match').toBeVisible();
        await quotationManagerPage.clickViewIcon();
        await quotationManagerPage.selectQuotationStatus('Approved');
        await quotationManagerPage.validateQuotationResponseNotTriggeredAPI('Approved');
        await expect(quotationManagerPage.successMessage('Document Name is required'), "Document name required message does not match").toBeVisible();
        await expect(quotationManagerPage.successMessage('Attachment is required'), "Attachment required message does not match").toBeVisible();
        await expect(quotationManagerPage.successMessage('Document Number is required'), "Document number required message does not match").toBeVisible();
    });

    test('Verify customer rejection is not submitted when document, reason and status are missing', async ({ homePage, modules, salesEnquiryPage, quotationManagerPage, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }) => {
        const enquiryId = await seedEnquiryUntil('quotationSentToCustomer', { salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }, homePage, salesEnquiryPage);
        await modules.goToModule({ subModule: 'Quotation' });
        await quotationManagerPage.search(enquiryId);
        await quotationManagerPage.clickViewIcon();
        await quotationManagerPage.selectQuotationStatus('Non-Approved');
        await quotationManagerPage.validateQuotationResponseNotTriggeredAPI('Non-Approved');
        await expect(quotationManagerPage.successMessage('Add New Document is required'), "Document required message does not match").toBeVisible();
        await expect(quotationManagerPage.successMessage('Reason is required'), "Reason required message does not match").toBeVisible();
        await expect(quotationManagerPage.successMessage('Status is required'), "Status required message does not match").toBeVisible();
    });

    test('Verify under consideration is not submitted when the reason is missing', async ({ homePage, modules, salesEnquiryPage, quotationManagerPage, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }) => {
        const enquiryId = await seedEnquiryUntil('quotationSentToCustomer', { salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }, homePage, salesEnquiryPage);
        await modules.goToModule({ subModule: 'Quotation' });
        await quotationManagerPage.search(enquiryId);
        await quotationManagerPage.clickViewIcon();
        await quotationManagerPage.selectQuotationStatus('Under Consideration');
        await quotationManagerPage.validateQuotationResponseNotTriggeredAPI('Under Consideration');
        await expect(quotationManagerPage.successMessage('Reason is required'), "Reason required message does not match").toBeVisible();
    });

    test('Verify discount request is not submitted when the reason is missing', async ({ homePage, modules, salesEnquiryPage, quotationManagerPage, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }) => {
        const enquiryId = await seedEnquiryUntil('quotationSentToCustomer', { salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }, homePage, salesEnquiryPage);
        await modules.goToModule({ subModule: 'Quotation' });
        await quotationManagerPage.search(enquiryId);
        await quotationManagerPage.clickViewIcon();
        await quotationManagerPage.selectQuotationStatus('Discount Request');
        await quotationManagerPage.validateQuotationResponseNotTriggeredAPI('Discount Request');
        await expect(quotationManagerPage.successMessage('Discount reason is required'), "Discount reason required message does not match").toBeVisible();
    });

    test('Verify change request is not submitted when the reason and change type are missing', async ({ homePage, modules, salesEnquiryPage, quotationManagerPage, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }) => {
        const enquiryId = await seedEnquiryUntil('quotationSentToCustomer', { salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }, homePage, salesEnquiryPage);
        await modules.goToModule({ subModule: 'Quotation' });
        await quotationManagerPage.search(enquiryId);
        await quotationManagerPage.clickViewIcon();
        await quotationManagerPage.selectQuotationStatus('Request Changes');
        await quotationManagerPage.validateRequestChangesNotTriggeredAPI();
        await expect(quotationManagerPage.successMessage('Change reason is required'), "Change reason required message does not match").toBeVisible();
        await expect(quotationManagerPage.successMessage('Change type is required'), "Change type required message does not match").toBeVisible();
    });

    test('Verify Quotation Manager cannot reject the quotation without a reason', async ({ homePage, modules, salesEnquiryPage, quotationManagerPage, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }) => {
        const enquiryId = await seedEnquiryUntil('quotationSubmitted', { salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }, homePage, salesEnquiryPage);
        await modules.goToModule({ subModule: 'Quotation (Manager)' });
        await quotationManagerPage.search(enquiryId);
        await quotationManagerPage.clickViewIcon();
        await quotationManagerPage.managerRejectsQuotationWithoutReasonAndValidateNotTriggeredAPI();
        await expect(quotationManagerPage.successMessage('Reason is required'), "Reason required message does not match").toBeVisible();
    });
});
