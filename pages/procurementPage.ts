import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { CreateMIRData } from "../testData/createMIR";

export class ProcurementPage extends BasePage {
    private readonly remarksTextBox: Locator;
    private readonly saveRemarksButton: Locator;
    private readonly selectAllChkBx: Locator;
    private readonly createPOButton: Locator;
    private readonly applyButton: Locator;
    private readonly processBtn: Locator;
    private readonly confirmButton: Locator;
    private readonly yesButton: Locator;
    public readonly status: Locator;
    private readonly createVendorQuotationButton: Locator;
    private readonly assignVendorBtn: Locator;
    private readonly createGroupBtn: Locator;
    private readonly addNewVendorBtn: Locator;
    private readonly vendorNameTxtBx: Locator;
    private readonly vendorEmailTxtBx: Locator;
    private readonly confirmAddVendorBtn: Locator;
    private readonly prepareVendorQuotationBtn: Locator;
    private readonly sendEmailBtn: Locator;
    private readonly creditDaysTxtBx: Locator;
    private readonly availableQuantityTxtBx: Locator;
    private readonly unitPriceTxtBx: Locator;
    private readonly etaTxtBx: Locator;
    private readonly saveMaterialRowBtn: Locator;
    private readonly updateQuoteBtn: Locator;
    private readonly filterBox: Locator;
    private readonly awardVendorsBtn: Locator;
    private readonly allMaterialsSummaryViewBtn: Locator;
    private readonly submitForFinalApprovalBtn: Locator;
    private readonly allLineItemsSummaryViewBtn: Locator;
    private readonly approveButton: Locator;
    private readonly submitButton: Locator;
    private readonly editIcons: Locator;
    private readonly tickIcon: Locator;

    // Dynamic locators
    private readonly rowByText: (text: string) => Locator;
    private readonly quoteRow: (prId: string, vendorName: string) => Locator;
    private readonly rowsForPR: (prId: string) => Locator;

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
        this.addNewVendorBtn = this.page.getByRole('button', { name: 'Add New Vendor add' });
        this.vendorNameTxtBx = this.page.locator('#vendorName');
        this.vendorEmailTxtBx = this.page.locator('#vendorEmail');
        this.confirmAddVendorBtn = this.page.getByRole('button', { name: 'Confirm add' });
        this.prepareVendorQuotationBtn = this.page.getByRole('button', { name: 'Prepare Vendor Quotation' });
        this.sendEmailBtn = this.page.getByRole('button', { name: 'send email all' });
        this.creditDaysTxtBx = this.page.getByRole('spinbutton', { name: 'Credit Days' });
        this.availableQuantityTxtBx = this.page.locator('#available_quantity');
        this.unitPriceTxtBx = this.page.locator('#unitPrice');
        this.etaTxtBx = this.page.locator('#eta');
        this.saveMaterialRowBtn = this.page.getByRole('button', { name: 'tick green icon' });
        this.updateQuoteBtn = this.page.getByRole('button', { name: 'update quote' });
        this.filterBox = this.page.getByRole('combobox', { name: 'Filter' });
        this.awardVendorsBtn = this.page.getByRole('button', { name: 'award vendors' });
        this.allMaterialsSummaryViewBtn = this.page.getByRole('button', { name: 'All Materials Summary View' });
        this.submitForFinalApprovalBtn = this.page.getByRole('button', { name: 'Submit For Final Approval' });
        this.allLineItemsSummaryViewBtn = this.page.getByRole('button', { name: 'All Line Items Summary View' });
        this.approveButton = this.page.getByRole('button', { name: 'Approve' });
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });
        this.editIcons = this.page.locator('//img[contains(@src,"edit")]');
        this.tickIcon = this.page.locator('//img[contains(@src,"tick.svg")]');
        // Dynamic locators initialization
        this.rowByText = (text: string) => this.page.getByRole('row', { name: text });
        this.quoteRow = (prId: string, vendorName: string) =>
            this.page.getByRole('row').filter({ hasText: prId }).filter({ hasText: vendorName }).first();
        this.rowsForPR = (prId: string) => this.page.getByRole('row').filter({ hasText: prId });
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
        await this.page.waitForTimeout(2000);
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

    async createVendorQuotation(shipTo: string, vendorName: string, newVendor?: { name: string; email: string }) {
        await this.selectAllChkBx.check();
        await this.createVendorQuotationButton.click();
        await this.selectOptionFromDropdown('Ship To', shipTo);
        await this.selectDate(new Date().getDate() + 8);
        await this.assignVendorBtn.click();
        if (newVendor) {
            await this.addNewVendor(newVendor.name, newVendor.email);
        }
        await this.searchVendor(vendorName);
        await this.selectVendorRow(vendorName);
        await this.createGroupBtn.click();
        await expect(this.page.locator('form'), 'Vendor group table missing').toContainText(vendorName);
    }

    private async searchVendor(vendorName: string) {
        const dialogSearchBox = this.searchBox.last();
        await dialogSearchBox.clear();
        await dialogSearchBox.fill(vendorName);
        await this.page.waitForTimeout(2000);
    }

    private async selectVendorRow(vendorName: string) {
        // need to update
        await this.rowByText(vendorName).first().getByRole('checkbox').click();
    }

    @step()
    async addNewVendor(vendorName: string, vendorEmail: string) {
        await this.addNewVendorBtn.click();
        await this.vendorNameTxtBx.fill(vendorName);
        await this.vendorEmailTxtBx.fill(vendorEmail);
        await this.confirmAddVendorBtn.click();
        await this.searchVendor(vendorName);
        await this.selectVendorRow(vendorName);
    }

    @step()
    async validateVendorQuotationMaterialTable(materialName: string, quantity: string) {
        const quotationTable = this.page.locator('form');
        await expect(quotationTable, `Vendor quotation table does not list material: ${materialName}`).toContainText(materialName);
        await expect(quotationTable, `Vendor quotation table does not show quantity: ${quantity}`).toContainText(quantity);
    }

    @step()
    async prepareVendorQuotationAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/vendorQuotation/createVendorQuotation');
        await this.prepareVendorQuotationBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Prepare Vendor Quotation API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified Prepare Vendor Quotation API with status code:', response.status());
    }

    @step()
    async sendVendorQuoteEmailAndValidateAPI(statusCode: number, prId: string) {
        const quoteRows = this.rowsForPR(prId);
        await quoteRows.first().waitFor({ state: 'visible' });
        const quoteCount = await quoteRows.count();
        expect(quoteCount, `No vendor quotation rows found for ${prId}`).toBeGreaterThan(0);
        for (let index = 0; index < quoteCount; index++) {
            await quoteRows.nth(index).getByRole('checkbox').check();
        }
        const responsePromise = this.page.waitForResponse('**/vendorQuoteEmail/sendVendorQuoteEmail');
        await this.sendEmailBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Send Vendor Quote Email API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified Send Vendor Quote Email API with status code:', response.status());
    }

    @step()
    async openVendorQuote(prId: string, vendorName: string) {
        await this.quoteRow(prId, vendorName).getByRole('button').first().click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async enterVendorQuoteDetails(mirDetails: CreateMIRData) {
        await this.selectDate(new Date().getDate());
        await this.selectDate(new Date().getDate() + 1, 1);
        await this.uploadFile('test_Documents', 'Test_Document.pdf');
        await this.creditDaysTxtBx.fill(mirDetails.creditDays);

        await this.rowByText(mirDetails.material).locator('img').click();
        await this.availableQuantityTxtBx.fill(mirDetails.availableQuantity);
        await this.unitPriceTxtBx.fill(mirDetails.unitPrice);
        await this.etaTxtBx.fill(mirDetails.eta);
        await this.saveMaterialRowBtn.click();

        await this.page.mouse.wheel(0, 1000);
        await this.editIcons.nth(1).click();
        await this.page.locator('//input[@maxlength="100"]').fill(mirDetails.deliveryPeriod);
        await this.tickIcon.click();

        await this.selectOptionFromDropdown('Select payment terms', mirDetails.paymentTerms);

        await this.editIcons.nth(2).click();
        await this.selectOptionFromDropdown('Select shipment mode', mirDetails.shipmentMode);
        await this.tickIcon.click();
    }

    @step()
    async updateVendorQuoteAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/vendorQuoteComparison/updateVendorQuoteComparison');
        await this.updateQuoteBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Update Vendor Quote API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified Update Vendor Quote API with status code:', response.status());
    }

    @step()
    async awardVendor(prId: string, vendorName: string) {
        await this.goToTab('Quotes Received');
        await this.quoteRow(prId, vendorName).getByRole('checkbox').check();
        await this.awardVendorsBtn.click();
        await this.page.waitForTimeout(2000);
        await this.page.getByRole('checkbox').nth(1).click();
        // await this.allMaterialsSummaryViewBtn.click();
        if (await this.yesButton.isVisible()) {
            await this.yesButton.click();
        }
    }

    @step()
    async submitForFinalApprovalAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/vendorQuoteComparison/updateVendorQuotationAward');
        await this.submitForFinalApprovalBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Submit For Final Approval API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified Submit For Final Approval API with status code:', response.status());
    }

    @step()
    async approveVendorQuoteAndValidateAPI(statusCode: number) {
        await this.allLineItemsSummaryViewBtn.click();
        await this.approveButton.click();
        await this.selectDate(new Date().getDate() + 5);
        await this.submitButton.click();
        const responsePromise = this.page.waitForResponse('**/vendorQuoteComparisonManager/updateVendorQuoteComparison**');
        await this.confirmButton.click();
        const response = await responsePromise;
        expect(response.status(), `Approve Vendor Quote API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified Approve Vendor Quote API with status code:', response.status());
    }

    async validatePODetails(vendorName: string, orderType: string) {
        await expect(this.page.locator('//div[@class="p-[18px] undefined"]')).toContainText(vendorName);
        const data = await this.page.locator('//div[@class="p-[18px] undefined"]').innerText();
        expect(data).toContain(orderType);
    }
}