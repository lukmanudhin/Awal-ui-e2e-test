import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { TradingData } from "../testData/tradingData";

export class TradingPage extends BasePage {
    private readonly email: Locator;
    private readonly password: Locator;
    private readonly signInButton: Locator;
    private readonly deleteButton: Locator;
    private readonly deleteConfirmationButton: Locator;
    private readonly leadCreationButton: Locator;
    private readonly attachedDocument: (fileName: string) => Locator;
    private readonly tradingButton: Locator;
    private readonly customerNameTxtBx: Locator;
    private readonly companyTxtBx: Locator;
    private readonly valueTxtBx: Locator;
    private readonly phoneTxtBx: Locator;
    private readonly secondaryPhoneTxtBx: Locator;
    private readonly leadEmailTxtBx: Locator;
    private readonly secondaryEmailTxtBx: Locator;
    private readonly notesTxtBx: Locator;
    private readonly createLeadButton: Locator;
    private readonly addNewRowButton: Locator;
    private readonly orderQuantityTxtBx: Locator;
    private readonly discountTxtBx: Locator;
    private readonly createButton: Locator;
    private readonly materialTableRow: Locator;
    private readonly createOrderButton: Locator;
    private readonly requestApprovalButton: Locator;
    private readonly approveButton: Locator;
    private readonly campaignTxtBx: Locator;
    private readonly generateInvoiceButton: Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.email = this.page.getByRole('textbox', { name: 'Email ID' });
        this.password = this.page.getByRole('textbox', { name: 'Password' });
        this.signInButton = this.page.getByRole('button', { name: 'Sign In' });
        this.attachedDocument = (fileName: string) => this.page.getByText(fileName, { exact: true }).first();
        this.deleteButton = this.page.locator('//img[contains(@src,"delete.svg")]').first();
        this.deleteConfirmationButton = this.page.getByRole('button', { name: 'Delete' });
        this.leadCreationButton = this.page.getByRole('button', { name: 'Lead Plus' });
        this.tradingButton = this.page.getByRole('button', { name: 'Trading' });
        this.customerNameTxtBx = this.page.getByRole('textbox', { name: 'Customer Name*' });
        this.companyTxtBx = this.page.getByRole('textbox', { name: 'Company' });
        this.valueTxtBx = this.page.getByRole('textbox', { name: 'Value' });
        this.phoneTxtBx = this.page.getByRole('textbox', { name: 'Phone*' });
        this.secondaryPhoneTxtBx = this.page.getByRole('textbox', { name: 'Secondary Phone' });
        this.leadEmailTxtBx = this.page.getByRole('textbox', { name: 'Email', exact: true });
        this.secondaryEmailTxtBx = this.page.getByRole('textbox', { name: 'Secondary Email' });
        this.notesTxtBx = this.page.getByRole('textbox', { name: 'Notes' });
        this.createLeadButton = this.page.getByRole('button', { name: 'Create Lead' });
        this.addNewRowButton = this.page.getByRole('button', { name: 'Add New Row Plus icon' });
        this.orderQuantityTxtBx = this.page.getByRole('textbox', { name: 'Order Quantity*' });
        this.discountTxtBx = this.page.getByRole('textbox', { name: 'Discount' });
        this.createButton = this.page.getByRole('button', { name: 'Create', exact: true });
        this.materialTableRow = this.page.locator('(//tr)[2]');
        this.createOrderButton = this.page.getByRole('button', { name: 'Create Order' });
        this.requestApprovalButton = this.page.getByRole('button', { name: 'Request Approval' });
        this.approveButton = this.page.getByRole('button', { name: 'Approve' });
        this.campaignTxtBx = this.page.getByRole('textbox', { name: 'Enter campaign' });
        this.generateInvoiceButton = this.page.getByRole('button', { name: 'Generate Invoice' });
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
        await this.leadCreationButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async createLead(data: TradingData) {
        await this.customerNameTxtBx.fill(data.customerName);
        await this.companyTxtBx.fill(data.company)
        await this.selectOptionFromDropdown('City', data.city)
        await this.valueTxtBx.fill(data.value);
        await this.selectOptionFromDropdown('Owner', data.owner)
        await this.selectDate(data.expectedDate + 3)
        await this.phoneTxtBx.fill(data.phone);
        await this.secondaryPhoneTxtBx.fill(data.secondaryPhone);
        await this.leadEmailTxtBx.fill(data.email);
        await this.secondaryEmailTxtBx.fill(data.secondaryEmail);
        const fileName = 'Test_Document.pdf';
        await this.uploadFile('test_Documents', fileName);
        await expect(this.attachedDocument(fileName), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await this.notesTxtBx.fill(data.notes);
        await this.createLeadButton.click();
    }

    async clickTrading() {
        await this.tradingButton.click({ force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async addTrading(data: TradingData) {
        await this.addNewRowButton.click();
        await this.selectOptionFromDropdown('Item Name*', data.material);
        await this.orderQuantityTxtBx.fill(data.quantity);
        await this.discountTxtBx.fill(data.discount);
    }

    async createTradingAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/upsertTradingMaterial');
        await this.createButton.click();
        const response = await responsePromise;
        expect(response.status(), `Create Trading API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Create Trading successfully');
        console.log(`Verified Create Trading API with status code:`, response.status());
    }

    @step()
    async validateMaterialTable(tradingData: TradingData) {
        await expect(this.materialTableRow, `Material table does not contain material: ${tradingData.material}`).toContainText(tradingData.material);
        const materialTable = await this.materialTableRow.innerText();
        expect(materialTable, "Material table does not contain quantity").toContain(tradingData.quantity);
    }

    async createOrderAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/createTradingOrder');
        await this.createOrderButton.click();
        const response = await responsePromise;
        expect(response.status(), `Create Trading Order API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Create Trading Order successfully');
        console.log(`Verified Create Trading Order API with status code:`, response.status());
    }

    async requestApprovalAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/updateTradingStatus');
        await this.requestApprovalButton.click();
        const response = await responsePromise;
        expect(response.status(), `Request Approval API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Request Approval successfully');
        console.log(`Verified Request Approval API with status code:`, response.status());
    }

    async approveTradingInvoiceAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/updateTradingStatus');
        await this.approveButton.click();
        const response = await responsePromise;
        expect(response.status(), `Request Approval API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Request Approval successfully');
        console.log(`Verified Request Approval API with status code:`, response.status());
    }

    @step()
    async enterPaymentMethodAndCampaign(tradingData: TradingData) {
        await this.selectOptionFromDropdown('Select Payment Method', tradingData.paymentMethod);
        await this.campaignTxtBx.fill(tradingData.campaign);
    }

    async generateInvoiceAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/requestToGenerateInvoice');
        await this.generateInvoiceButton.click();
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