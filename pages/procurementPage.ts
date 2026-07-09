import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class ProcurementPage extends BasePage {
    private readonly remarksTextBox: Locator;
    private readonly saveRemarksButton: Locator;
    private readonly selectAllChkBx: Locator;
    private readonly createPOButton: Locator;
    private readonly applyButton: Locator;
    private readonly processBtn: Locator;
    private readonly confirmButton: Locator;
    private readonly yesButton: Locator;
    private readonly status: Locator;
    private readonly createVendorQuotationButton: Locator;
    private readonly assignVendorBtn: Locator;
    private readonly createGroupBtn: Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.remarksTextBox = this.page.getByRole('textbox', { name: 'Enter' });
        this.saveRemarksButton = this.page.getByRole('button', { name: 'save remarks' });
        this.selectAllChkBx = this.page.locator('#select-all');
        this.createPOButton = this.page.getByRole('button', { name: 'Create PO' });
        this.applyButton = this.page.getByRole('button', { name: 'Apply' });
        this.processBtn = this.page.getByRole('button', { name: 'Process' });
        this.confirmButton = this.page.getByRole('button', { name: 'Confirm' });
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.status = this.page.locator('//td[@data-app-table-col="6"]//span').first();
        this.createVendorQuotationButton = this.page.getByRole('button', { name: 'Create Vendor Quotation create' });
        this.assignVendorBtn = this.page.getByRole('button', { name: 'Assign Vendor' });
        this.createGroupBtn = this.page.getByRole('button', { name: 'Create New Group & Assign' });
    }
    @step()
    async enterRemarks(remarks: string) {
        await this.remarksTextBox.fill(remarks);

        for (let i = 0; await this.saveRemarksButton.isHidden(); i++) {
            await this.remarksTextBox.click();
        }

        await this.saveRemarksButton.click();
    }

    async createPO(POType: string) {
        await this.selectAllChkBx.check();
        await this.createPOButton.click();
        await this.selectOptionFromDropdown('PO Type', POType);
        await this.applyButton.click();
    }

    async selectVendor(vendorName: string) {
        await this.selectOptionFromDropdown('Select Vendors', vendorName);
        await this.processBtn.click();
    }

    async confirmPurchaseOrder() {
        await this.confirmButton.click();
        await this.yesButton.click();
    }

    async createPOAndValidateAPI(statusCode: number) {
        await this.createPOButton.click();
        const responsePromise = this.page.waitForResponse('**/purchaseOrders/createPurchaseOrderProcess');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Create PO API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('PO created successfully');
        console.log(`Verified PO creation API with status code:`, response.status());
    }

    async getPONumber() {
        const poNumber = await this.page.locator('//td[@data-app-table-col="2"]//div').first().innerText();
        return poNumber;
    }

    async searchPR(name: string) {
        await this.page.waitForTimeout(500);
        await this.searchBox.fill(name);
        await this.page.waitForTimeout(2000);
        if (await this.page.locator('//tr').count() > 1) {
            await expect(this.status, 'Stock status does not match').toHaveText('New Request');
            await this.enterRemarks('Purchase Order (Contract) Remarks');
            await expect(this.successMessage('Purchase order remark created successfully'), 'Purchase order remark created successfully success message does not found').toHaveText('Purchase order remark created successfully');
            console.log('Material in Contract');
            return true;
        } else {
            await this.page.locator(`//span[text()="PR to PO"]`).nth(1).click();
            await this.page.waitForLoadState('domcontentloaded');
            await this.searchBox.fill(name);
            await this.page.waitForTimeout(2000);
            expect(await this.page.locator('//tr').count(), 'material not visible in PR to PO (Contract) and PR to PO').toBeGreaterThan(1);
            console.log('Material not in Contract');
            return false;
        }
    }

    async createVendorQuotation(shipTo: string, vendorName: string) {
        await this.selectAllChkBx.check();
        await this.createVendorQuotationButton.click();
        await this.selectOptionFromDropdown('Ship To', shipTo);
        await this.selectDate(new Date().getDate() + 8);
        await this.assignVendorBtn.click();
        await this.search(vendorName);
        await this.selectAllChkBx.last().check();
        await this.createGroupBtn.click();
        await expect(this.page.locator('(//tr)[4]'), 'Vendor group table missing').toHaveText(vendorName);
    }
}