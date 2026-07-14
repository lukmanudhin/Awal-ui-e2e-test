import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { TradingData } from "../testData/tradingData";

export class TradingPage extends BasePage {
    private readonly email: Locator;
    private readonly password: Locator;
    private readonly signInButton: Locator;
    private readonly deleteButton: Locator;
    private readonly deleteConfirmationButton: Locator;
    private readonly attachedDocument: (fileName: string) => Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.email = this.page.getByRole('textbox', { name: 'Email ID' });
        this.password = this.page.getByRole('textbox', { name: 'Password' });
        this.signInButton = this.page.getByRole('button', { name: 'Sign In' });
        this.attachedDocument = (fileName: string) => this.page.getByText(fileName, { exact: true }).first();
        this.deleteButton = this.page.locator('//img[contains(@src,"delete.svg")]').first();
        this.deleteConfirmationButton = this.page.getByRole('button', { name: 'Delete' });
    }
    @step()
    async login(emailId: string, password: string) {
        await this.email.fill(emailId);
        await this.password.fill(password);
        await this.signInButton.click();
        // await this.page.waitForLoadState('domcontentloaded');
    }
    @step()
    async launchAwalWebsite() {
        await this.page.goto(`${process.env.BASE_URL}`);
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async clickCreateLeadButton() {
        await this.page.getByRole('button', { name: 'Lead Plus' }).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async createLead(data: TradingData) {
        await this.page.getByRole('textbox', { name: 'Customer Name*' }).fill(data.customerName);
        await this.page.getByRole('textbox', { name: 'Company' }).fill(data.company)
        await this.selectOptionFromDropdown('City', data.city)
        await this.page.getByRole('textbox', { name: 'Value' }).fill(data.value);
        await this.selectOptionFromDropdown('Owner', data.owner)
        await this.selectDate(data.expectedDate + 3)
        await this.page.getByRole('textbox', { name: 'Phone*' }).fill(data.phone);
        await this.page.getByRole('textbox', { name: 'Secondary Phone' }).fill(data.secondaryPhone);
        await this.page.getByRole('textbox', { name: 'Email', exact: true }).fill(data.email);
        await this.page.getByRole('textbox', { name: 'Secondary Email' }).fill(data.secondaryEmail);
        const fileName = 'Test_Document.pdf';
        await this.uploadFile('test_Documents', fileName);
        await expect(this.attachedDocument(fileName), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await this.page.getByRole('textbox', { name: 'Notes' }).fill(data.notes);
        await this.page.getByRole('button', { name: 'Create Lead' }).click();
    }

    async clickTrading() {
        await this.page.getByRole('button', { name: 'Trading' }).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async addTrading(data: TradingData) {
        await this.page.getByRole('button', { name: 'Add New Row Plus icon' }).click();
        await this.selectOptionFromDropdown('Item Name*', data.material);
        await this.page.getByRole('textbox', { name: 'Order Quantity*' }).fill(data.quantity);
        await this.page.getByRole('textbox', { name: 'Discount' }).fill(data.discount);
    }

    async createTradingAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/upsertTradingMaterial');
        await this.page.getByRole('button', { name: 'Create', exact: true }).click();
        const response = await responsePromise;
        expect(response.status(), `Create Trading API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Create Trading successfully');
        console.log(`Verified Create Trading API with status code:`, response.status());
    }

    @step()
    async validateMaterialTable(tradingData: TradingData) {
        await this.page.waitForTimeout(500);
        const materialTable = await this.page.locator('(//tr)[2]').innerText();
        expect(materialTable).toContain(tradingData.material);
        expect(materialTable).toContain(tradingData.quantity);
    }

    async createOrderAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/createTradingOrder');
        await this.page.getByRole('button', { name: 'Create Order' }).click();
        const response = await responsePromise;
        expect(response.status(), `Create Trading Order API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Create Trading Order successfully');
        console.log(`Verified Create Trading Order API with status code:`, response.status());
    }

    async requestApprovalAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/updateTradingStatus');
        await this.page.getByRole('button', { name: 'Request Approval' }).click();
        const response = await responsePromise;
        expect(response.status(), `Request Approval API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Request Approval successfully');
        console.log(`Verified Request Approval API with status code:`, response.status());
    }

    async approveTradingInvoiceAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/updateTradingStatus');
        await this.page.getByRole('button', { name: 'Approve' }).click();
        const response = await responsePromise;
        expect(response.status(), `Request Approval API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Request Approval successfully');
        console.log(`Verified Request Approval API with status code:`, response.status());
    }

    @step()
    async enterPaymentMethodAndCampaign(tradingData: TradingData) {
        await this.selectOptionFromDropdown('Select Payment Method', tradingData.paymentMethod);
        await this.page.getByRole('textbox', { name: 'Enter campaign' }).fill(tradingData.campaign);
    }

    async generateInvoiceAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/requestToGenerateInvoice');
        await this.page.getByRole('button', { name: 'Generate Invoice' }).click();
        const response = await responsePromise;
        expect(response.status(), `Generate Invoice API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Generate Invoice successfully');
        console.log(`Verified Generate Invoice API with status code:`, response.status());
    }

    @step()
    async deleteTradingAndValidateAPI(statusCode: number) {
        await this.deleteButton.click();
        const responsePromise = this.page.waitForResponse('**/quickLeads/deleteLeadById/**');
        await this.deleteConfirmationButton.click();
        const response = await responsePromise;
        expect(response.status(), `Delete Trading API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Trading deleted successfully');
        console.log(`Verified Trading deletion API with status code:`, response.status());
    }
}