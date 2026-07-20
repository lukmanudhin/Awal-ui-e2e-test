import { Page, Locator } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { expect } from "../fixtures/baseFixtures";
import { SalesEnquiryData } from "../testData/salesEnquiryData";

export class SalesOrderManagerPage extends BasePage {
    public readonly salesOrderStatus: Locator;
    private readonly approveButton: Locator;
    private readonly reasonTextBox: Locator;
    private readonly submitButton: Locator;
    public readonly salesOrderApproveStatus: Locator;
    private readonly sendForApprovalButton: Locator;
    private readonly yesButton: Locator;
    private readonly approvalPopUpMessage: Locator;
    private readonly salesOrderId: Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.salesOrderStatus = this.page.locator('//span[@class=" text-xs py-[2px] px-[8px]"]').first();
        this.approveButton = this.page.getByRole('button', { name: 'Approve' });
        this.reasonTextBox = this.page.getByRole('textbox', { name: 'Enter Reason for Approval' }).or(this.page.getByRole('textbox', { name: 'Enter Reason' }));
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });
        this.salesOrderApproveStatus = this.page.locator('//td[@data-app-table-col="8"]//span').first();
        this.sendForApprovalButton = this.page.getByRole('button', { name: 'Send for Approval' });
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.approvalPopUpMessage = this.page.locator('(//main)[2]//p');
        this.salesOrderId = this.page.locator('//td[@data-app-table-col="7"]//div').first();
    }
    @step()
    async validateCustomerNameInSalesOrderManager(customerName: string) {
        await expect(this.page.locator('//div[@class="min-w-[180px] flex flex-col"]').first(), `Sales order details do not contain customer name: ${customerName}`).toContainText(customerName);
    }
    @step()
    async approveSalesOrderCheckListAndValidateAPI(statusCode: number) {
        await this.approveButton.click();
        await this.reasonTextBox.fill('Approved');
        const responsePromise = this.page.waitForResponse('**/SalesOrder/updateSalesChecklistStatus');
        await this.submitButton.click();
        const response = await responsePromise;
        expect(response.status(), `Approve sales order check list API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Sales order check list approved successfully');
        console.log(`Verified approve sales order check list API with status code:`, response.status());
    }
    @step()
    async validateSalesOrderDetails(data: SalesEnquiryData) {
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.locator('div.col-span-1').first(), `Sales order details do not contain customer name: ${data.customerName}`).toContainText(data.customerName);
        const detailsText = await this.page.locator('div.col-span-1').first().innerText();
        console.log(`✓ Customer Name displayed in Sales Order Manager: ${data.customerName}`);
        expect(detailsText, `Sales order details do not contain project name: ${data.projectName}`).toContain(data.projectName);
        console.log(`✓ Project Name displayed in Sales Order Manager: ${data.projectName}`);
        expect(detailsText, `Sales order details do not contain email: ${data.email1}`).toContain(data.email1);
        console.log(`✓ Email displayed in Sales Order Manager: ${data.email1}`);
    }
    @step()
    async sendSalesOrderForApprovalAndValidateAPI(statusCode: number) {
        await this.sendForApprovalButton.click();
        await expect(this.approvalPopUpMessage, 'Send sales order for approval pop up message does not match').toHaveText('Are you sure you want to send this sales order for approval?');
        const responsePromise = this.page.waitForResponse('**/SalesOrder/salesOrderPendingApproval');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Send sales order for approval API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Sales order sent for approval successfully');
        console.log(`Verified send sales order for approval API with status code:`, response.status());
    }
    @step()
    async approveSalesOrderAndValidateAPI(statusCode: number) {
        await this.approveButton.click();
        await this.reasonTextBox.fill('Approved');
        const responsePromise = this.page.waitForResponse('**/SalesOrder/updateSalesOrderStatus');
        await this.submitButton.click();
        const response = await responsePromise;
        expect(response.status(), `Approve sales order API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Sales order approved successfully');
        console.log(`Verified approve sales order API with status code:`, response.status());
    }
    @step()
    async verifySalesOrderStatus(status: string) {
        await this.scrollUntilElementVisible(this.salesOrderStatus);
        await expect(this.salesOrderStatus, "Sales order status does not match").toHaveText(status);
    }
    @step()
    async getSalesOrderId() {
        return await this.salesOrderId.innerText();
    }
    @step()
    async rejectSalesOrderCheckListAndValidateAPI(statusCode: number) {
        await this.rejectButton.click();
        await this.reasonTextBox.fill('Sales order check list rejected Manager Test');
        const responsePromise = this.page.waitForResponse('**/SalesOrder/updateSalesChecklistStatus');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Reject sales order check list API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Sales order check list Rejected successfully');
        console.log(`Verified Reject sales order check list API with status code:`, response.status());
    }
    @step()
    async rejectSalesOrderAndValidateAPI(statusCode: number) {
        await this.rejectButton.click();
        await this.reasonTextBox.fill('Sales order rejected Manager Test');
        const responsePromise = this.page.waitForResponse('**/SalesOrder/updateSalesOrderStatus');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Reject sales order API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Sales order Rejected successfully');
        console.log(`Verified Reject sales order API with status code:`, response.status());
    }
}