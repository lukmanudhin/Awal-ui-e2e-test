import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { ManufacturingData } from "../testData/manufacturingData";

export class ManufacturingPage extends BasePage {
    private readonly manufacturingButton: Locator;
    private readonly addRowButton: Locator;
    private readonly viewInvoice: Locator;
    private readonly orderQuantityTxtBx: Locator;
    private readonly discountTxtBx: Locator;
    private readonly createButton: Locator;
    private readonly requestApprovalButton: Locator;
    private readonly approveButton: Locator;
    private readonly generateInvoiceButton: Locator;
    private readonly campaignTxtBx: Locator;
    private createOrderButton: Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.manufacturingButton = this.page.getByRole('button', { name: 'Manufacturing' });
        this.addRowButton = this.page.getByRole('button', { name: 'Add New Row Plus icon' });
        this.orderQuantityTxtBx = this.page.getByRole('textbox', { name: 'Order Quantity*' });
        this.discountTxtBx = this.page.getByRole('textbox', { name: 'Discount' });
        this.createButton = this.page.getByRole('button', { name: 'Create', exact: true });
        this.createOrderButton = this.page.getByRole('button', { name: 'Create Order' });
        this.requestApprovalButton = this.page.getByRole('button', { name: 'Request Approval' });
        this.approveButton = this.page.getByRole('button', { name: 'Approve' });
        this.generateInvoiceButton = this.page.getByRole('button', { name: 'Generate Invoice' });
        this.campaignTxtBx = this.page.getByRole('textbox', { name: 'Enter campaign' });
        this.viewInvoice = this.page.locator('//span[@class="!underline text-[#1f5e88] cursor-pointer"]').first();
    }

    @step()
    async clickManufacturing() {
        await this.manufacturingButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    @step()
    async addManufacturingMaterial(manufacturingData: ManufacturingData) {
        await this.addRowButton.click();
        await this.selectOptionFromDropdown('Item Name*', manufacturingData.material);
        await this.orderQuantityTxtBx.fill(manufacturingData.quantity);
        await this.discountTxtBx.fill(manufacturingData.discount);
        await this.createButton.click();
    }
    @step()
    async validateMaterialTable(manufacturingData: ManufacturingData) {
        await expect(this.page.locator('(//tr)[2]'), `Material table does not contain material: ${manufacturingData.material}`).toContainText(manufacturingData.material);
        const materialTable = await this.page.locator('(//tr)[2]').innerText();
        expect(materialTable, "Material table does not contain quantity").toContain(manufacturingData.quantity);
    }
    @step()
    async createOrderAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/createTradingOrder');
        await this.createOrderButton.click();
        const response = await responsePromise;
        expect(response.status(), `Create orderAPI status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Create order successfully');
        console.log(`Verified Create order API with status code:`, response.status());
    }
    @step()
    async requestApprovalAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/updateTradingStatus');
        await this.requestApprovalButton.click();
        const response = await responsePromise;
        expect(response.status(), `Request Approval API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Request Approved successfully');
        console.log(`Verified Request Approval API with status code:`, response.status());
    }
    @step()
    async approveInvoiceAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/updateTradingStatus');
        await this.approveButton.click();
        const response = await responsePromise;
        expect(response.status(), `Approve Invoice API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Approve Invoice successfully');
        console.log(`Verified Approve Invoice API with status code:`, response.status());
    }

    @step()
    async enterPaymentMethodAndCampaign(manufacturingData: ManufacturingData) {
        await this.selectOptionFromDropdown('Select Payment Method', manufacturingData.paymentMethod);
        await this.campaignTxtBx.fill(manufacturingData.campaign);
    }
    @step()
    async generateInvoiceAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/counterSaleTrading/requestToGenerateInvoice');
        await this.generateInvoiceButton.click();
        const response = await responsePromise;
        expect(response.status(), `Generate Invoice API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Generate Invoice successfully');
        console.log(`Verified Generate Invoice API with status code:`, response.status());
    }
    @step()
    async clickViewInvoice() {
        await expect(this.viewInvoice, 'View Invoice button is not visible').toBeVisible();
        await this.viewInvoice.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
}