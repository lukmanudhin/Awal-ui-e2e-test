import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { SalesEnquiryData } from "../testData/salesEnquiryData";
import { Utils } from "../utils/utils";
import * as path from "path";
import process from "process";

export class QuotationManagerPage extends BasePage {
    private readonly approveButton: Locator;
    private readonly yesButton: Locator;
    public readonly quotationStatus: Locator;
    public readonly customerApprovalTable: Locator;
    private readonly submitButton: Locator;
    // private readonly uploadButton: Locator;
    private readonly documentNumberTxtBx: Locator;
    private readonly sendAdvanceInvoiceButton: Locator;
    private readonly viewAdvanceInvoiceButton: Locator;
    private readonly generateCheckListButton: Locator;
    private readonly calenderBtn: Locator;
    private readonly submitCheckListButton: Locator;
    private readonly productRemarksTxtBx: Locator;
    private readonly salesCheckListRemarks: Locator;
    private readonly deliveryRemarksTxtBx: Locator;
    private readonly customerNameTxtBx: Locator;
    private readonly phoneTxtBx: Locator;
    private readonly locationTxtBx: Locator;
    private readonly reasonTextBox: Locator
    private readonly quotationNumber: Locator
    private readonly reEstimationButton: Locator

    // Dynamic locators
    private readonly dropDown: (name: string) => Locator;
    private readonly dropDownOption: (name: string) => Locator;
    private readonly attachedDocument: (fileName: string) => Locator;
    public readonly deliveryDate: (date: number) => Locator;
    private readonly dateOption: (date: string) => Locator;
    private readonly radioButton: (name: string) => Locator;
    private readonly checkBox: (name: string) => Locator;
    private readonly quotationStatusCheckBox: (status: string) => Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.approveButton = this.page.getByRole('button', { name: 'Approve' });
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.quotationStatus = this.page.locator('//span[@class=" text-xs py-[2px] px-[8px]"]').first();
        this.customerApprovalTable = this.page.locator('(//table[@class="w-full border-collapse table-fixed"])[2]//tr');
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });
        // this.uploadButton = this.page.getByRole('button', { name: 'Upload' });
        this.documentNumberTxtBx = this.page.getByRole('textbox', { name: 'Document Number*' });
        this.sendAdvanceInvoiceButton = this.page.getByRole('button', { name: 'Send Advance Invoice' });
        this.viewAdvanceInvoiceButton = this.page.getByRole('button', { name: 'View Advance Invoice' });
        this.generateCheckListButton = this.page.getByRole('button', { name: 'Generate Check List' });
        this.calenderBtn = this.page.getByRole('button', { name: 'Choose date' });
        this.submitCheckListButton = this.page.getByRole('button', { name: 'Submit Check List' });
        this.productRemarksTxtBx = this.page.getByRole('textbox', { name: 'Production Remarks' });
        this.salesCheckListRemarks = this.page.getByRole('textbox', { name: 'Sales Checklist Remarks' });
        this.deliveryRemarksTxtBx = this.page.getByRole('textbox', { name: 'Delivery Remarks' });
        this.customerNameTxtBx = this.page.getByRole('textbox', { name: 'Customer Name' });
        this.phoneTxtBx = this.page.getByRole('textbox', { name: 'Phone' });
        this.locationTxtBx = this.page.getByRole('textbox', { name: 'Location' });
        this.reasonTextBox = this.page.getByRole('textbox', { name: 'Enter reason' });
        this.quotationNumber = this.page.locator('//td[@data-app-table-col="4"]//span');
        this.reEstimationButton = this.page.getByRole('button', { name: 'Re-Estimate' });

        // Dynamic locators initialization
        this.dropDown = (name: string) => this.page.getByRole('combobox', { name: `${name}` });
        this.dropDownOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.attachedDocument = (fileName: string) => this.page.getByText(fileName, { exact: true });
        this.radioButton = (name: string) => this.page.locator(`//label[text()="${name}"]//preceding-sibling::div`)
        this.checkBox = (name: string) => this.page.locator(`//label[text()="${name}"]//preceding-sibling::span//input`);
        this.dateOption = (date: string) => this.page.locator(`//div[@class="css-8uic9k" and text()="${date}"]`).first();
        this.deliveryDate = (date: number) => this.page.locator(`(//span[contains(text(),"${date}")])[2]`);
        this.quotationStatusCheckBox = (status: string): Locator => this.page.getByRole('checkbox', { name: `${status}`, exact: true });
    }
    @step()
    async validateEnquiryDetails(data: SalesEnquiryData) {
        await expect(this.page.locator('//div[@class="grid grid-cols-2 mb-3"]/div[1]'), `View sales enquiry details do not contain customer name: ${data.customerName}`).toContainText(data.customerName);
        const detailsText = await this.page.locator('//div[@class="grid grid-cols-2 mb-3"]/div[1]').innerText();
        console.log(`✓ Customer Name displayed: ${data.customerName}`);

        // Validate country
        expect(detailsText, `View sales enquiry details do not contain country: ${data.country}`).toContain(data.country);
        console.log(`✓ Country displayed: ${data.country}`);

        // Validate state
        expect(detailsText, `View sales enquiry details do not contain state: ${data.state}`).toContain(data.state);
        console.log(`✓ State displayed: ${data.state}`);

        // Validate city
        expect(detailsText, `View sales enquiry details do not contain city: ${data.city}`).toContain(data.city);
        console.log(`✓ City displayed: ${data.city}`);


        // const currencyName = Utils.getCurrencyName(data.currency);
        // expect(detailsText, `View sales enquiry details do not contain currency: ${data.currency}`).toContain(data.currency);
        // console.log(`✓ Currency displayed: ${data.currency}`);

        expect(detailsText, `View sales enquiry details do not contain mobile number: ${data.mobileNumber1}`).toContain(data.mobileNumber1);
        console.log(`✓ Mobile Number displayed: ${data.mobileNumber1}`);

        expect(detailsText, `View sales enquiry details do not contain email: ${data.email1}`).toContain(data.email1);
        console.log(`✓ Email displayed: ${data.email1}`);

        console.log('All validation checks passed for view enquiry details');
    }
    @step()
    async managerApprovalQuotationAndValidateAPI(statusCode: number) {
        await this.approveButton.click();
        const responsePromise = this.page.waitForResponse('**Quotation/quotationManagerApprove');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Quotation approve API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Quotation approved successfully');
        console.log(`Verified quotation approval API with status code:`, response.status());
    }
    @step()
    async sendToCustomerAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/Quotation/sendToCustomer');
        await this.page.getByRole('button', { name: 'Send to customer' }).click();
        const response = await responsePromise;
        expect(response.status(), `Send to customer API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Quotation sent to customer successfully');
        console.log(`Verified send to customer API with status code:`, response.status());
    }
    @step()
    async setQuotationStatus(status: string) {
        await this.quotationStatusCheckBox(status).click();
        switch (status) {
            case 'Approved':
                await this.enterCustomerApprovalAttachment();
                await this.validateQuotationApprovalAPI(201);
                break;
            case 'Requested Changes':
                await this.enterChangeRequestDetails();
                break;
            case 'Discount Request':
                await this.submitDiscountRequest();
                break;
            case 'Non-Approved':
                await this.enterCustomerRejectionAttachments();
                break;
            case 'Under Consideration':
                await this.submitUnderConsiderationReason();
                break;
        }
    }

    private async selectFromDropdown(dropdownName: string, value: string) {
        await this.dropDown(dropdownName).clear();
        await this.dropDown(dropdownName).fill(value);
        await this.dropDownOption(value).click();
    }
    @step()
    async enterCustomerApprovalAttachment() {
        await this.selectFromDropdown('Document Name*', 'Quotation');
        const fileName = 'Test_Document.pdf';
        // const filePath = path.join(process.cwd(), 'test_Documents', fileName);

        // const [fileChooser] = await Promise.all([
        //     this.page.waitForEvent('filechooser'),
        //     this.uploadButton.click(),
        // ]);

        // await fileChooser.setFiles(filePath);
        await this.uploadFile('test_Documents', fileName);
        await expect(this.attachedDocument(fileName).first(), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await this.documentNumberTxtBx.fill('123');
    }
    @step()
    async validateQuotationApprovalAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/Quotation/QuotationApproval');
        await this.submitButton.click();
        const response = await responsePromise;
        expect(response.status(), `Quotation approve API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Quotation approved successfully');
        console.log(`Verified quotation approval API with status code:`, response.status());
    }
    @step()
    async sendAdvanceInvoiceAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/Quotation/sendAdvanceInvoice');
        await this.sendAdvanceInvoiceButton.click();
        const response = await responsePromise;
        expect(response.status(), `Send advance invoice API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Advance invoice sent successfully');
        console.log(`Verified send advance invoice API with status code:`, response.status());
    }
    @step()
    async validateViewAdvanceInvoiceAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/Quotation/GetTaxInvoiceDetailsById?QuotationExtId=**');
        await this.viewAdvanceInvoiceButton.click();
        const response = await responsePromise;
        expect(response.status(), `View advance invoice API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('View advance invoice API validated successfully');
    }

    private async enterSalesChecklist(quotationConfirmation: string, purchaseOrder: string, attachments: string, advancePayment: string, retention: string, partialInvoice: string, reserved: string, remarks: string) {
        await this.radioButton(quotationConfirmation).check();
        await this.radioButton(purchaseOrder).check();
        const fileName = 'Test_Document.pdf';
        // const filePath = path.join(process.cwd(), 'test_Documents', fileName);
        // const [fileChooser] = await Promise.all([
        //     this.page.waitForEvent('filechooser'),
        //     this.uploadButton.first().click(),
        // ]);
        // await fileChooser.setFiles(filePath);
        await this.uploadFile('test_Documents', fileName);
        await expect(this.attachedDocument(fileName).first(), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await this.radioButton(attachments).check();

        await this.checkBox(advancePayment).first().check();
        await this.checkBox(retention).nth(1).check();
        await this.checkBox(partialInvoice).nth(2).check();
        // await expect(this.checkBox(reserved).nth(3)).toBeChecked();
        await this.checkBox(reserved).nth(3).check();

        await this.salesCheckListRemarks.fill(remarks);
    }

    private async enterDeliveryInstallationDetails(data: SalesEnquiryData, modeOfDelivery: string, deliveryNote: string, deliveryRemarks: string) {
        await this.radioButton(modeOfDelivery).check();
        await this.customerNameTxtBx.fill(data.customerName);
        await this.phoneTxtBx.fill(data.mobileNumber1);
        await this.locationTxtBx.fill(data.city);
        await this.checkBox(deliveryNote).last().check();
        await this.deliveryRemarksTxtBx.fill(deliveryRemarks);
    }

    private async enterProductionChecklist(date: number, PR_Required: string, qa_passed: string, deliveryNote: string, overtimeConsidered: string, remarks: string) {
        // await this.calenderBtn.first().click();
        // await this.dateOption(`${date}`).click();
        await this.selectDate(date);
        await this.page.waitForTimeout(500);

        // await this.calenderBtn.nth(1).click();
        // await this.dateOption(`${date}`).click();
        await this.selectDate(date, 1);

        const fileName = 'Test_Document.pdf';
        const filePath = path.join(process.cwd(), 'test_Documents', fileName);
        const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.uploadButton.nth(1).click(),
        ]);
        await fileChooser.setFiles(filePath);
        await expect(this.attachedDocument(fileName).nth(1), `${fileName} is not visible in View Attached Documents`).toBeVisible();

        await this.checkBox(PR_Required).check();
        await this.radioButton(qa_passed).check();
        await this.checkBox(deliveryNote).first().check();
        await this.checkBox(overtimeConsidered).nth(1).check();

        await this.productRemarksTxtBx.fill(remarks);
    }
    @step()
    async generateChecklist(data: SalesEnquiryData) {
        if (await this.generateCheckListButton.isVisible()) {
            await this.generateCheckListButton.click();
        }
        await this.enterSalesChecklist('Email', 'Photocopy', 'Site Photo', 'Yes', 'Yes', 'Yes', 'Yes', 'Sales Checklist Remarks');
        await this.enterDeliveryInstallationDetails(data, 'Delivery Only', 'YES', 'Delivery Remarks');
        await this.enterProductionChecklist(data.date, 'Material', 'Yes', 'YES', 'YES', 'Production Remarks');
        // await this.submitCheckListButton.click();
    }
    @step()
    async validateSubmitCheckListAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/SalesOrder/createSalesOrder');
        await this.submitCheckListButton.click();
        const response = await responsePromise;
        expect(response.status(), `Submit check list API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Check list submitted successfully');
        console.log(`Verified submit check list API with status code:`, response.status());
    }
    @step()
    async validateExistingDataInSalesOrderChecklist(data: SalesEnquiryData) {
        //---------------Sales Checklist-----------------
        await expect(this.radioButton('Email')).toBeChecked();
        await expect(this.radioButton('Photocopy')).toBeChecked();
        const fileName = 'Test_Document.pdf';
        await expect(this.attachedDocument(fileName).first(), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await expect(this.radioButton('Site Photo')).toBeChecked();
        await expect(this.checkBox('Yes').first()).toBeChecked();
        await expect(this.checkBox('Yes').nth(1)).toBeChecked();
        await expect(this.checkBox('Yes').nth(2)).toBeChecked();
        await expect(this.checkBox('Yes').nth(3)).toBeChecked();
        await expect(this.salesCheckListRemarks).toHaveValue('Sales Checklist Remarks');

        //---------------Delivery & Installation-----------------
        await expect(this.radioButton('Delivery Only')).toBeChecked();
        await expect(this.customerNameTxtBx).toHaveValue(data.customerName);
        await expect(this.phoneTxtBx).toHaveValue(data.mobileNumber1);
        await expect(this.locationTxtBx).toHaveValue(data.city);
        await expect(this.checkBox('YES').last()).toBeChecked();
        await expect(this.deliveryRemarksTxtBx).toHaveValue('Delivery Remarks');

        //---------------Production Checklist-----------------
        await expect(this.attachedDocument(fileName).nth(1), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await expect(this.checkBox('Material')).toBeChecked();
        await expect(this.radioButton('Yes')).toBeChecked();
        await expect(this.checkBox('YES').first()).toBeChecked();
        await expect(this.checkBox('YES').nth(1)).toBeChecked();
        await expect(this.productRemarksTxtBx).toHaveValue('Production Remarks');
    }
    @step()
    async managerRejectsQuotationAndValidateAPI(statusCode: number) {
        await this.rejectButton.click();
        await this.reasonTextBox.fill('E2E Quotation Rejection Test');
        const responsePromise = this.page.waitForResponse('**Quotation/quotationManagerApprove');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Quotation Manager Rejection API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Quotation Manager Rejection successfully');
        console.log(`Verified Manager Rejection API with status code:`, response.status());
    }
    @step()
    async enterCustomerRejectionAttachments() {
        const fileName = 'Test_Document.pdf';
        await this.uploadFile('test_Documents', fileName);
        await expect(this.attachedDocument(fileName).first(), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await this.reasonTextBox.fill('E2E Customer Rejection Reason');
        await this.selectFromDropdown('Do you want to change the', 'Hold');
        await this.submitButton.click();
    }
    @step()
    async getQuotationNumber() {
        return await this.quotationNumber.innerText();
    }
    @step()
    async submitUnderConsiderationReason() {
        await this.reasonTextBox.fill('E2E Test Under Consideration Reason');
        await this.submitButton.click();
    }
    @step()
    async submitDiscountRequest() {
        const fileName = 'Test_Document.pdf';
        await this.uploadFile('test_Documents', fileName);
        await expect(this.attachedDocument(fileName).first(), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await this.reasonTextBox.fill('E2E Discount Request Reason');
        await this.submitButton.click();
    }
    @step()
    async validateVersion2AndOption1Visible(version: string, option: string) {
        const innerText = await this.page.locator('//div[@class="border-l-2 border-[#D9D9D9] pl-8"]').innerText();
        expect(innerText).toContain(version);
        expect(innerText).toContain(option);
    }
    @step()
    async enterChangeRequestDetails() {
        await this.reasonTextBox.fill('E2E Change Request Reason');
        const fileName = 'Test_Document.pdf';
        await this.uploadFile('test_Documents', fileName);
        await expect(this.attachedDocument(fileName).first(), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await this.selectFromDropdown('Changes Requested*', 'Quantity');
        await this.page.keyboard.press('Tab');
        await this.reEstimationButton.click();
    }
}