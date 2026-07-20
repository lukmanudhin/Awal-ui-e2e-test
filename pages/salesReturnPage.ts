import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import type { SalesReturnData, BankPaymentVoucherData } from "../testData/salesReturnData";

export class SalesReturnPage extends BasePage {
    public readonly tableRow: Locator;
    public readonly status: Locator;
    private readonly customerConfirmedRefundCheckbox: Locator;
    private readonly closeCaseButton: Locator;
    private readonly newTradingButton: Locator;
    private readonly quantityInput: Locator;
    private readonly salesReturnReasonInput: Locator;
    private readonly remarksInput: Locator;
    private readonly saveButton: Locator;
    private readonly sentToQCButton: Locator;
    private readonly startQCButton: Locator;
    private readonly failedQuantityInput: Locator;
    private readonly qcRemarkInput: Locator;
    private readonly submitQCButton: Locator;
    private readonly sendToFinanceButton: Locator;
    private readonly salesReturnNumberCell: Locator;
    private readonly inFavourOf: Locator;
    private readonly chequeNumber: Locator;
    private readonly bankCommission: Locator;
    private readonly ddChequeIssueCharges: Locator;
    private readonly lcCharges: Locator;
    private readonly otherDeductions: Locator;
    private readonly submitForApprovalButton: Locator;
    private readonly approveButton: Locator;
    private readonly confirmYesButton: Locator;
    public readonly bankPaymentStatus: Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.tableRow = this.page.locator('//tr');
        this.status = this.page.locator('//td[@data-app-table-col="4"]//span').first();
        this.customerConfirmedRefundCheckbox = this.page.getByRole('checkbox', { name: 'Customer confirmed refund' });
        this.closeCaseButton = this.page.getByRole('button', { name: 'Close Case' });
        this.newTradingButton = this.page.getByRole('button', { name: 'New Trading add' });
        this.quantityInput = this.page.getByRole('spinbutton', { name: 'Quantity*' });
        this.salesReturnReasonInput = this.page.getByRole('textbox', { name: 'Sales Return Reason*' });
        this.remarksInput = this.page.getByRole('textbox', { name: 'Remarks / Issue Description*' });
        this.saveButton = this.page.getByRole('button', { name: 'Save' });
        this.sentToQCButton = this.page.getByRole('button', { name: 'Sent To qc' });
        this.startQCButton = this.page.getByRole('button', { name: 'Start QC' }).first();
        this.failedQuantityInput = this.page.getByRole('spinbutton', { name: 'Failed Quantity' });
        this.qcRemarkInput = this.page.getByRole('textbox', { name: 'QC Remark*' });
        this.submitQCButton = this.page.getByRole('button', { name: 'Submit QC' });
        this.sendToFinanceButton = this.page.getByRole('button', { name: 'Send to Finance' });
        this.salesReturnNumberCell = this.page.locator('//td[@data-app-table-col="0"]//span').first();
        this.inFavourOf = this.page.getByRole('textbox', { name: 'In favour of*' });
        this.chequeNumber = this.page.getByRole('textbox', { name: 'Cheque Number*' });
        this.bankCommission = this.page.locator('#bankCommission');
        this.ddChequeIssueCharges = this.page.locator('#ddChequeIssueCharges');
        this.lcCharges = this.page.locator('#lcCharges');
        this.otherDeductions = this.page.locator('#otherDeductions');
        this.submitForApprovalButton = this.page.getByRole('button', { name: 'Submit For Approval' });
        this.approveButton = this.page.getByRole('button', { name: 'Approve', exact: true });
        this.confirmYesButton = this.page.getByRole('button', { name: 'Yes' });
        this.bankPaymentStatus = this.page.locator('//td[@data-app-table-col="6"]//span').first();
    }

    @step()
    async clickNewTrading() {
        await this.newTradingButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async selectLeadNumber(leadNumber: string) {
        await this.selectOptionFromDropdown('Lead Number', leadNumber);
        await this.page.waitForTimeout(1000);
    }

    @step()
    async searchByLeadNumber(leadNumber: string) {
        await this.page.waitForTimeout(500);
        await this.searchBox.fill(leadNumber);
        await expect.poll(
            async () => await this.tableRow.count(),
            { message: `No sales return requests found for lead number: ${leadNumber}`, timeout: 10000 }
        ).toBeGreaterThanOrEqual(2);
    }

    @step()
    async addSalesReturnDetails(data: SalesReturnData) {
        await this.quantityInput.fill(data.quantity);
        await this.salesReturnReasonInput.fill(data.reason);
        await this.remarksInput.fill(data.remarks);
        await this.uploadFile('test_Documents', data.fileName);
    }

    async validateCreateSalesReturnAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/salesReturn/createSalesReturn');
        await this.saveButton.click();
        const response = await responsePromise;
        const responseBody = await response.json();
        expect(response.status(), `Create Sales Return API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified create Sales Return API with status code:', response.status());
        return responseBody.result as string;
    }

    async sentToQCAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/salesReturn/updateSalesReturnStatus**');
        await this.sentToQCButton.click();
        const response = await responsePromise;
        expect(response.status(), `Send to QC API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Sent to QC successfully');
        console.log('Verified send to QC API with status code:', response.status());
    }

    async clickStartQCButton() {
        await this.startQCButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async submitQCInspectionForm(data: SalesReturnData) {
        await this.failedQuantityInput.fill(data.failedQuantity);
        await this.qcRemarkInput.fill(data.qcRemark);
        await this.uploadFile('test_Documents', data.fileName);
        await this.saveButton.click();
    }

    async submitToQCAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/salesReturn/updateSalesReturnStatus**');
        await this.submitQCButton.click();
        const response = await responsePromise;
        expect(response.status()).toBe(statusCode);
        console.log('Submitted to QC successfully');
        console.log('Verified submit to QC API with status code:', response.status());
    }

    async sendToFinanceAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/salesReturn/updateSalesReturnStatus**');
        await this.sendToFinanceButton.click();
        const response = await responsePromise;
        expect(response.status(), `Send to Finance API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Sent to Finance successfully');
        console.log('Verified send to Finance API with status code:', response.status());
    }

    @step()
    async fillCloseCaseDetails(moveReceivedProductTo: string) {
        await this.selectOptionFromDropdown('Move the Received Product to', moveReceivedProductTo);
        await this.customerConfirmedRefundCheckbox.check();
    }

    async closeCaseAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/salesReturn/updateSalesReturnStatus**');
        await this.closeCaseButton.click();
        const response = await responsePromise;
        expect(response.status(), `Close Case API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified close case API with status code:', response.status());
    }

    async getSalesReturnNumber() {
        return await this.salesReturnNumberCell.textContent() || '';
    }

    @step()
    async createBankPaymentVoucher(data: BankPaymentVoucherData) {
        await this.selectOptionFromDropdown('Bank Name*', data.bankName);
        await this.selectDate(data.valueDate, 0);
        await this.inFavourOf.fill(data.inFavourOf);
        await this.chequeNumber.fill(data.chequeNumber);
        await this.selectDate(data.chequeDate, 1);
        await this.bankCommission.fill(data.bankCommission);
        await this.ddChequeIssueCharges.fill(data.ddChequeIssueCharges);
        await this.lcCharges.fill(data.lcCharges);
        await this.otherDeductions.fill(data.otherDeductions);
        await this.submitForApprovalButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async approveBankPaymentVoucher() {
        await this.eyeIcon.waitFor({ state: 'visible' });
        await this.clickViewIcon();
        await this.approveButton.click();
        await this.confirmYesButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
}
