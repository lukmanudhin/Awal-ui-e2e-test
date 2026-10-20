import { expect } from "@playwright/test";
import { test } from "../../../../fixtures/baseFixtures";
import { ENV } from "../../../../utils/ENV";
import { getCreateEnquiryData } from "../../../../testData/salesEnquiryData";
import { SalesFlowSeeder, type SalesFlowStage, type SalesFlowApis } from "../../../../API/salesFlowSeeder";
import type { HomePage } from "../../../../pages/homePage";
import type { SalesEnquiryPage } from "../../../../pages/salesEnqueryPage";

test.describe('Invoice Register and Sales Order - Validation and Edge Cases', () => {
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

    // Seeds the enquiry through API up to the requested stage and returns the customer name and enquiry number
    const seedEnquiryUntil = async (stage: SalesFlowStage, apis: SalesFlowApis, homePage: HomePage, salesEnquiryPage: SalesEnquiryPage) => {
        const customerName = getCreateEnquiryData().customerName;
        await new SalesFlowSeeder(apis).seedUntil(stage, customerName, (enquiryExtId) => { extId = enquiryExtId; });
        await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
        const enquiryId = await salesEnquiryPage.search(customerName);
        return { customerName, enquiryId };
    };

    test('Verify invoice register is not acknowledged when no file is attached', async ({ homePage, modules, salesEnquiryPage, invoiceRequestPage, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }) => {
        const { customerName } = await seedEnquiryUntil('invoiceApproved', { salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }, homePage, salesEnquiryPage);
        await modules.goToModule({ module: 'Finance', subModule: 'Accounts Receivable', nestedSubModule: 'Invoice Register' });
        await invoiceRequestPage.search(customerName);
        await expect(invoiceRequestPage.status('Approved'), "Invoice status does not match").toBeVisible();
        await invoiceRequestPage.openAcknowledgement();
        await invoiceRequestPage.validateAcknowledgementNotTriggeredAPI();
        await expect(invoiceRequestPage.status('No'), "Acknowledgement status should stay No when no file is attached").toBeVisible();
    });

    // Documents current behaviour: the checklist has no mandatory fields, so an empty one creates the sales order.
    // If mandatory-field validation is added later, this test is expected to fail and should be updated.
    test('Verify sales order is created when the sales order checklist is submitted empty', async ({ homePage, modules, salesEnquiryPage, quotationManagerPage, salesOrderManagerPage, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }) => {
        const { enquiryId } = await seedEnquiryUntil('invoiceAcknowledged', { salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }, homePage, salesEnquiryPage);
        await modules.goToModule({ subModule: 'Quotation' });
        await quotationManagerPage.search(enquiryId);
        await expect(quotationManagerPage.status('Customer Approved'), 'Quotation status does not match').toBeVisible();
        await quotationManagerPage.clickViewIcon();
        await quotationManagerPage.validateViewAdvanceInvoiceAPI(200);
        await quotationManagerPage.openSalesOrderChecklist();
        await quotationManagerPage.validateSubmitCheckListAPI(201);
        await expect(quotationManagerPage.successMessage('Sales order created successfully'), "Sales order created success message does not match").toContainText('Sales order created successfully');
        await modules.goToModule({ subModule: 'Sales Order (Manager)' });
        await salesOrderManagerPage.search(enquiryId);
        await salesOrderManagerPage.verifySalesOrderStatus('Pending Check List Approval');
        console.log('Sales order was created from an empty checklist');
    });

    test('Verify Sales Order Manager cannot reject the sales order checklist without a reason', async ({ homePage, modules, salesEnquiryPage, salesOrderManagerPage, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }) => {
        const { enquiryId } = await seedEnquiryUntil('salesOrderCreated', { salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }, homePage, salesEnquiryPage);
        await modules.goToModule({ subModule: 'Sales Order (Manager)' });
        await salesOrderManagerPage.search(enquiryId);
        await salesOrderManagerPage.verifySalesOrderStatus('Pending Check List Approval');
        await salesOrderManagerPage.clickViewIcon();
        await salesOrderManagerPage.rejectSalesOrderCheckListWithoutReasonAndValidateNotTriggeredAPI();
        await expect(salesOrderManagerPage.successMessage('Reason is required'), "Reason required message does not match").toBeVisible();
    });

    test('Verify Sales Order Manager cannot reject the sales order without a reason', async ({ homePage, modules, salesEnquiryPage, salesOrderManagerPage, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }) => {
        const { enquiryId } = await seedEnquiryUntil('salesOrderPendingApproval', { salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI }, homePage, salesEnquiryPage);
        await modules.goToModule({ subModule: 'Sales Order (Manager)' });
        await salesOrderManagerPage.search(enquiryId);
        await expect(salesOrderManagerPage.salesOrderStatus, "Sales order status does not match").toHaveText('Pending Sales Order Approval');
        await salesOrderManagerPage.clickViewIcon();
        await salesOrderManagerPage.rejectSalesOrderWithoutReasonAndValidateNotTriggeredAPI();
        await expect(salesOrderManagerPage.successMessage('Reason is required'), "Reason required message does not match").toBeVisible();
    });
});
