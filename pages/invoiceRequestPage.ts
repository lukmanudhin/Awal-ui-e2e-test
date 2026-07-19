import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { SalesEnquiryData } from "../testData/salesEnquiryData";
import { BOQData } from "../testData/addBoqData";
import * as path from "path";

export class InvoiceRequestPage extends BasePage {
    private readonly createInvoiceBtn: Locator;
    private readonly invoiceDateIcon: Locator;
    private readonly backArrow: Locator;
    private readonly acknowledgeIcon: Locator;
    public readonly invoiceStatus: Locator;
    public readonly viewInvoiceBtn: Locator;
    public readonly acknowledgementStatus: Locator;
    private readonly approveButton: Locator;
    private readonly yesButton: Locator;
    private readonly reasonTextBox: Locator;
    private readonly notApproveButton: Locator;
    // private readonly browseFileButton: Locator;
    // private readonly uploadButton: Locator;

    // Dynamic locators
    private readonly dateOption: (date: string) => Locator;
    private readonly attachedDocument: (fileName: string) => Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.createInvoiceBtn = this.page.getByRole('button', { name: 'Create Invoice' });
        this.invoiceDateIcon = this.page.locator('//input[@placeholder="Enter Invoice Date"]//following-sibling::div/button');
        this.backArrow = this.page.getByRole('img', { name: 'back arrow' });
        this.acknowledgeIcon = this.page.locator('//img[contains(@src,"upload-yellow-icon.svg")]');
        this.invoiceStatus = this.page.locator('//span[@class=" text-xs py-[2px] px-[8px]"]');
        this.viewInvoiceBtn = this.page.getByRole('button', { name: 'View Invoice' });
        this.acknowledgementStatus = this.page.locator('//td[@data-app-table-col="6"]//span').first();//.or(this.page.locator('(//td[@data-app-table-col="6"]//span)[2]'));
        this.approveButton = this.page.getByRole('button', { name: 'approve', exact: true });
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.reasonTextBox = this.page.getByRole('textbox', { name: 'Enter Reason' });
        this.notApproveButton = this.page.getByRole('button', { name: 'not approve' });
        // this.browseFileButton = this.page.getByRole('button', { name: 'Browse files' });
        // this.uploadButton = this.page.getByRole('button', { name: 'Upload' });

        // Dynamic locators initialization
        this.attachedDocument = (fileName: string) => this.page.getByText(fileName, { exact: true });
        this.dateOption = (date: string) => this.page.locator(`//div[@class="css-8uic9k" and text()="${date}"]`).first();
    }
    @step()
    async clickCreateInvoiceBtn() {
        await this.createInvoiceBtn.click();
    }
    @step()
    async validateEnquiryDetails(data: SalesEnquiryData) {
        await expect(this.page.locator('(//div[@class="bg-[#f2f2f2] p-4 space-y-2 text-[14px] text-[#231F20] rounded-md border border-[E5E7EA]"])[1]').or(this.page.locator('//div[@class="space-y-6"]')), `Invoice request details do not contain customer name: ${data.customerName}`).toContainText(data.customerName);
        const detailsText = await this.page.locator('(//div[@class="bg-[#f2f2f2] p-4 space-y-2 text-[14px] text-[#231F20] rounded-md border border-[E5E7EA]"])[1]').or(this.page.locator('//div[@class="space-y-6"]')).innerText();
        console.log(`✓ Customer Name displayed in Invoice Request: ${data.customerName}`);
        // expect(detailsText, `Invoice request details do not contain country: ${data.building}`).toContain(data.building);
        // console.log(`✓ Building displayed in Invoice Request: ${data.building}`);
        expect(detailsText, `Invoice request details do not contain state: ${data.road}`).toContain(data.road);
        console.log(`✓ Road displayed in Invoice Request: ${data.road}`);
    }
    @step()
    async validateBOQTableDetails(boqData: BOQData) {
        const boqText = await this.page.locator('//tr[@class="border border-[#ece9e9] p-[3px] h-[40px] text-[14px] font-[400] text-[#231F20]"]').first().innerText();
        // expect(boqText, 'BOQ table does not contain product name').toContain(boqData.signName);
        expect(boqText, 'BOQ table does not contain quantity').toContain(boqData.quantity);
        expect(boqText, 'BOQ table does not contain description').toContain(boqData.description);
    }
    @step()
    async selectInvoiceDate(date: number) {
        await this.page.waitForTimeout(500);
        await this.selectDate(date + 2, 0); 
    }
    @step()
    async createInvoiceAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/InvoiceRequest/Create');
        await this.clickCreateInvoiceBtn();
        const response = await responsePromise;
        expect(response.status(), `Create invoice API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Invoice created successfully');
    }
    @step()
    async goToInvoiceListPage() {
        await this.backArrow.click();
        // await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
        await this.backArrow.click();
    }
    @step()
    async approveInvoiceRequestAndValidateAPI(statusCode: number) {
        await this.approveButton.click();
        const responsePromise = this.page.waitForResponse('**/invoiceRegister/updateManagerApproval');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Approve invoice request API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Invoice request approved successfully');
    }
    @step()
    async acknowledgeInvoiceRequest() {
        await this.acknowledgeIcon.click();
        const fileName = 'Test_Document.pdf';
        const filePath = path.join(process.cwd(), 'test_Documents', fileName);

        const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.browseFileButton.click(),
        ]);
        await fileChooser.setFiles(filePath);
        await expect(this.attachedDocument(fileName), `${fileName} is not visible in View Attached Documents`).toBeVisible();
    }
    @step()
    async validateAcknowledgementAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/invoiceRegister/acknowledgeFileUpload');
        await this.uploadButton.click();
        const response = await responsePromise;
        expect(response.status(), `Acknowledge invoice request API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Invoice request acknowledged successfully');
    }
    @step()
    async notApproveInvoiceRegisterAndValidateAPI(statusCode: number) {
        await this.notApproveButton.click();
        await this.reasonTextBox.fill('Reject Invoice Register E2E Test Reason');
        const responsePromise = this.page.waitForResponse('**/invoiceRegister/updateManagerApproval');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Not approve invoice register API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Invoice register not approved successfully');
    }
}