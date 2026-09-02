import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getSalesReturnData, getBankPaymentVoucherData } from "../../../testData/salesReturnData";

test.describe('Sales Return E2E Test', () => {
    let accessToken: string;
    let salesReturnId: string;
    test.setTimeout(190000);

    test.beforeEach('Login', async ({ page, loginPage, salesEnquiryAPI }) => {
        accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        await test.step('Login', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
        });
    });

    test.afterEach('Delete Sales Return', async ({ salesReturnAPI, page }) => {
        await page.close();
        const deleteAPIResponse = await salesReturnAPI.deleteSalesReturnIfCreated(accessToken, salesReturnId);
        expect(deleteAPIResponse.message, 'Delete Sales Return API Message Mismatch').toBe('Data deleted successfully');
        console.log(`Sales return ${salesReturnId} deleted successfully`);
    });

    test('Verify sales return lifecycle through QC, Finance approval and case closure', async ({ page, modules, homePage, salesReturnPage }) => {
        // const leadNumber = 'LN01046';
        // const leadNumber = 'LN00003';
        const leadNumber = process.env.ENV === 'qa' ? 'LN01046' : 'LN00003';
        const voucherData = getBankPaymentVoucherData();
        const salesReturnData = getSalesReturnData();

        await homePage.goToMenuAndSubMenu('Sales', 'Sales Return');
        await salesReturnPage.goToTab('Trading');
        await salesReturnPage.clickNewTrading();
        await salesReturnPage.selectLeadNumber(leadNumber);
        expect(await salesReturnPage.tableRow.count(), "Sales return row is not found").toBeGreaterThanOrEqual(2);
        await salesReturnPage.addSalesReturnDetails(salesReturnData);
        salesReturnId = await salesReturnPage.validateCreateSalesReturnAPI(201);
        await expect(salesReturnPage.successMessage('Sales return created successfully'), "Sales return created success message does not match").toHaveText('Sales return created successfully');

        await salesReturnPage.sentToQCAndValidateAPI(200);
        await expect(salesReturnPage.successMessage('Sales return sent to QC'), "Sales return sent to QC message does not match").toHaveText('Sales return sent to QC successfully');
        await salesReturnPage.searchByLeadNumber(leadNumber);
        let salesReturnNumber = await salesReturnPage.getSalesReturnNumber();

        await salesReturnPage.search(salesReturnNumber);        
        await expect(salesReturnPage.status('Pending From QC'), "Sales return status does not match").toBeVisible();
        await salesReturnPage.clickStartQCButton();
        await salesReturnPage.submitQCInspectionForm(salesReturnData);
        await expect(salesReturnPage.successMessage('QC Inspected successfully'), "QC Inspected success message does not match").toHaveText('QC Inspected successfully');
        await salesReturnPage.submitToQCAndValidateAPI(200);
        await salesReturnPage.search(salesReturnNumber);
        await expect(salesReturnPage.status('Qc Completed'), "Sales return status does not match").toBeVisible();

        await salesReturnPage.clickViewIcon();
        await salesReturnPage.sendToFinanceAndValidateAPI(200);
        await expect(salesReturnPage.successMessage('Sales return sent to Finance'), "Sales return sent to Finance message does not match").toHaveText('Sales return sent to Finance successfully');
        await salesReturnPage.search(salesReturnNumber);
        await expect(salesReturnPage.status('Pending From Finance'), "Sales return status does not match").toBeVisible();

        await modules.goToModule({ module: 'Finance', subModule: 'Account Payable', nestedSubModule: 'Bank Payment Voucher' });
        await salesReturnPage.search(salesReturnNumber);
        await expect(salesReturnPage.status('Pending From Finance'), "Sales return status does not match").toBeVisible();
        await salesReturnPage.clickViewIcon();
        await salesReturnPage.createBankPaymentVoucher(voucherData);
        await expect(salesReturnPage.successMessage('Bank Payable Voucher updated successfully'), "Bank Payment Voucher update success message does not match").toHaveText('Bank Payable Voucher updated successfully');

        await salesReturnPage.search(salesReturnNumber);
        await expect(salesReturnPage.status('Pending For Approval'), "Sales return status does not match").toBeVisible();
        await modules.goToModule({ nestedSubModule: 'Bank Payment Voucher Manager' });
        await salesReturnPage.search(salesReturnNumber);
        await expect(salesReturnPage.status('Pending For Approval'), "Sales return status does not match").toBeVisible();
        await salesReturnPage.approveBankPaymentVoucher();

        await page.getByRole('button', { name: 'History history-blue' }).click();
        await salesReturnPage.search(salesReturnNumber);
        await expect(salesReturnPage.status('Finance Completed'), "Sales return status does not match").toBeVisible();

        await modules.goToModule({ module: 'Sales', subModule: 'Sales Return' });
        await salesReturnPage.goToTab('Trading');
        await salesReturnPage.search(salesReturnNumber);
        await expect(salesReturnPage.status('Finance Completed'), "Sales return status does not match").toBeVisible();
        await salesReturnPage.clickViewIcon();
        await salesReturnPage.fillCloseCaseDetails(salesReturnData.moveReceivedProductTo);
        await salesReturnPage.closeCaseAndValidateAPI(200);
        await expect(salesReturnPage.successMessage('Sales return closed successfully'), "Sales return closed success message does not match").toHaveText('Sales return closed successfully');
        await salesReturnPage.search(salesReturnNumber);
        await expect(salesReturnPage.status('Closed'), "Sales return status does not match").toBeVisible();
    });
});
