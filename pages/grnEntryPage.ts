import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class GRNEntryPage extends BasePage {
    private readonly createGRNButton: Locator;
    private readonly currentQuantityTxtBx: Locator;
    private readonly remarksTxtBx: Locator;
    private readonly deliveryNoteTxtBx: Locator;
    private readonly invoiceNumberTxtBx: Locator;
    private readonly pendingQuantityCol: Locator;
    private readonly saveAsDraftButton: Locator;
    private readonly submitToQCBtn: Locator;
    public readonly qcStatus: Locator;
    public readonly status: Locator;
    private readonly startQCBtn: Locator;
    private readonly randomQuantity: Locator;
    private readonly failedQuantity: Locator;
    private readonly submitButton: Locator;
    public readonly qcCheckButton: Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.createGRNButton = this.page.getByRole('button', { name: 'Create GRN plus icon' });
        this.currentQuantityTxtBx = this.page.locator('#currentQuantity-242');
        this.remarksTxtBx = this.page.getByRole('textbox', { name: 'Enter remarks' });
        this.deliveryNoteTxtBx = this.page.getByRole('textbox', { name: 'Delivery Note Number' });
        this.invoiceNumberTxtBx = this.page.getByRole('textbox', { name: 'Invoice Number' });
        this.pendingQuantityCol = this.page.locator('//td[@data-app-table-col="10"]//div');
        this.saveAsDraftButton = this.page.getByRole('button', { name: 'Save as Draft' });
        this.submitToQCBtn = this.page.getByRole('button', { name: 'Submit To QC' });
        this.qcStatus = this.page.locator('//td[@data-app-table-col="5"]//span');
        this.status = this.page.locator('//td[@data-app-table-col="7"]//span');
        this.startQCBtn = this.page.getByRole('button', { name: 'Start QC' });
        this.randomQuantity = this.page.getByRole('spinbutton', { name: 'Random Quantity' });
        this.failedQuantity = this.page.getByRole('spinbutton', { name: 'Failed Quantity' });
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });
        this.qcCheckButton = this.page.getByRole('button', { name: 'QC check' });
    }
    async createGRNEntry(vendorName: string, poNumber: string, currentQty: string, remarks: string, deliveryNote: string, invoiceNumber: string, status?: string) {
        await this.createGRNButton.click();
        await this.selectOptionFromDropdown('Vendor Name*', vendorName);
        await this.selectOptionFromDropdown('PO Reference*', poNumber)
        const pendingQuantity = await this.pendingQuantityCol.textContent();
        await this.currentQuantityTxtBx.fill(currentQty);
        const updatedQuantity = await this.pendingQuantityCol.textContent();
        expect(parseInt(updatedQuantity ?? '0'), "Updated pending quantity does not match pending quantity minus current quantity").toBe(parseInt(pendingQuantity ?? '0') - parseInt(currentQty));
        await this.selectDate(new Date().getDate() + 5, 1)
        await this.remarksTxtBx.fill(remarks);
        await this.deliveryNoteTxtBx.fill(deliveryNote);
        await this.invoiceNumberTxtBx.fill(invoiceNumber);
        await this.selectDate(new Date().getDate() + 3, 2);
        await this.selectDate(new Date().getDate() + 4, 3);
        const fileName = 'Test_Document.pdf';
        await this.uploadFile('test_Documents', fileName);
        await this.uploadFile('test_Documents', fileName, 1);
        if (status)
            await this.saveAsDraftButton.click();
        else {
            await this.submitToQCBtn.click();
        }
    }

    async getGRNNumber() {
        const grnNumber = await this.page.locator('//td[@data-app-table-col="1"]//div').first().innerText();
        return grnNumber;
    }

    async startQC(qcMethod: string, randomQuantity: string, failedQuantity: string, inspectorName: string, visualInspection: string, dimensionalCheck: string, functionalTest: string) {
        await this.startQCBtn.click();
        await this.selectOptionFromDropdown('QC Method', qcMethod);
        await this.randomQuantity.fill(randomQuantity);
        await this.failedQuantity.fill(failedQuantity);
        await this.selectOptionFromDropdown('Inspector Name', inspectorName);
        await this.selectOptionFromDropdown('Visual Inspection', visualInspection);
        await this.selectOptionFromDropdown('Dimensional Check', dimensionalCheck);
        await this.selectOptionFromDropdown('Functional Test', functionalTest);
        const fileName = 'Test_Document.pdf';
        await this.uploadFile('test_Documents', fileName);
        await this.uploadFile('test_Documents', fileName, 1);
        await this.uploadFile('test_Documents', fileName, 2);
        await this.submitButton.click();
    }
}