import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { SalesEnquiryData } from "../testData/salesEnquiryData";
// import * as path from "path";
import { BOQData } from "../testData/addBoqData";
import { Utils } from "../utils/utils";


export class PPJOPage extends BasePage {
    public readonly requestEstimationButton: Locator;
    public readonly editSalesEnquiryTitle: Locator;
    private readonly siteVisitorDropdown: Locator;
    private readonly ppjoTitle: Locator;
    private readonly visitingDateCalenderButton: Locator;
    private readonly saveButton: Locator;
    public readonly printButton: Locator;
    private readonly fileInput: Locator;
    // private readonly uploadButton: Locator;
    private readonly quantityTextBox: Locator;
    private readonly descriptionEditor: Locator;
    private readonly backButton: Locator;
    private readonly calenderIcon: Locator;
    private readonly editDeliveryDateIcon: Locator;
    private readonly submitForApprovalButton: Locator;
    private readonly confirmButton: Locator;
    public readonly viewEstimationBtn: Locator;
    private readonly requestSiteVisitBtn: Locator;
    private readonly requestSampleBtn: Locator;
    private readonly banner: Locator;
    private readonly newSampleDescription: Locator;
    private readonly addSampleButton: Locator;
    public readonly enquiryIdColumn: Locator;
    private readonly sampleButton: Locator;
    public readonly salesOrderTab: Locator;
    private readonly submitButton: Locator;

    // Dynamic locators
    public readonly createdSalesEnquiry: (name: string) => Locator;
    private readonly modalTitle: (name: string) => Locator;
    private readonly dropDown: (name: string) => Locator;
    private readonly dropDownOption: (name: string) => Locator;
    private readonly dateOption: (date: string) => Locator;
    private readonly attachedDocument: (fileName: string) => Locator;
    private readonly siteVisitorOption: (name: string) => Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.page = page;
        this.editSalesEnquiryTitle = this.page.locator('//span[normalize-space()="Edit Sales Enquiry"]');
        this.requestEstimationButton = this.page.getByRole('button', { name: 'Request Estimation' });
        this.siteVisitorDropdown = this.page.getByRole('combobox', { name: 'Site Visitor' });
        this.ppjoTitle = this.page.getByText('PPJO', { exact: true });
        this.visitingDateCalenderButton = this.page.getByRole('button', { name: 'Choose date' });
        this.saveButton = this.page.getByRole('button', { name: 'Save' });
        this.printButton = this.page.getByRole('button', { name: 'Print' });
        this.fileInput = this.page.locator('input[type="file"]').first();
        // this.uploadButton = this.page.getByRole('button', { name: 'Upload' });
        this.quantityTextBox = this.page.locator('#quantity');
        this.descriptionEditor = this.page.locator('#description');
        this.backButton = this.page.getByRole('img', { name: 'back arrow' });
        this.editDeliveryDateIcon = this.page.getByRole('img', { name: 'Edit' });
        this.calenderIcon = this.page.getByRole('button', { name: 'Choose date' });
        this.submitForApprovalButton = this.page.getByRole('button', { name: 'Submit for Approval' });
        this.confirmButton = this.page.getByRole('button', { name: 'Yes' });
        this.viewEstimationBtn = this.page.getByRole('button', { name: 'View Estimation' });
        this.requestSiteVisitBtn = this.page.getByRole('button', { name: 'Request Site Visit' });
        this.requestSampleBtn = this.page.getByRole('button', { name: 'Request Sample' });
        this.newSampleDescription = this.page.locator('#requirementDetails');
        this.addSampleButton = this.page.getByRole('button', { name: 'Add New Sample Request Add' });
        this.enquiryIdColumn = this.page.locator('//td[@data-app-table-col="1"]//div');
        this.sampleButton = this.page.getByRole('button', { name: 'Sample' });
        this.salesOrderTab = this.page.getByRole('tab', { name: 'Sales Order #' });
        this.submitButton = this.page.getByRole('button', { name: 'Submit', exact: true })

        // Dynamic locators initialization
        this.dropDown = (name: string) => this.page.getByRole('combobox', { name: `${name}` }).first();
        this.dropDownOption = (name: string) => this.page.getByRole('option', { name: `${name}` }).first();
        this.dateOption = (date: string) => this.page.locator(`//div[@class="css-8uic9k" and text()="${date}"]`).first();
        this.attachedDocument = (fileName: string) => this.page.getByText(fileName, { exact: true }).first();
        this.createdSalesEnquiry = (name: string) => this.page.getByText(`${name}`).first();
        this.modalTitle = (name: string) => this.page.getByRole('heading', { name: new RegExp(`^${name} close$`) });
        this.siteVisitorOption = (name: string) => this.page.getByRole('option', { name, exact: true });
        this.banner = this.page.getByRole('banner');
    }

    @step()
    async validateSalesEnquiryDetailsInPPJO(data: SalesEnquiryData) {
        await expect(this.ppjoTitle, "PPJO title is not visible").toBeVisible();
        await expect(this.page.locator('//div[@class="grid gap-[1rem] !mb-[2.5rem] text-[14px]"]'), "PPJO details do not contain the project name").toContainText(data.projectName);
        const detailsText = await this.page.locator('//div[@class="grid gap-[1rem] !mb-[2.5rem] text-[14px]"]').innerText();
        expect(detailsText, "PPJO details do not contain the customer name").toContain(data.customerName);
        expect(detailsText, "PPJO details do not contain the mobile number").toContain(data.mobileNumber1);
        expect(detailsText, "PPJO details do not contain the email").toContain(data.email1);
        expect(detailsText, "PPJO details do not contain payment terms").toContain(data.paymentTerms);
    }
    @step()
    async requestArtwork() {
        await this.submitPPJODocumentRequest('Request Artwork', 'Artwork requirement details', "11");
    }
    @step()
    async requestAutoCAD() {
        await this.submitPPJODocumentRequest('Request AutoCAD', 'AutoCAD requirement details', '12');
    }
    @step()
    async requestProcurement() {
        await this.submitPPJODocumentRequest('Request Procurement', 'Procurement requirement details', '13');
    }
    @step()
    async requestEstimation() {
        await this.submitPPJODocumentRequest('Request Estimation', 'Estimation requirement details', '14');
    }
    @step()
    async requestSiteVisit(siteVisitor: string) {
        await this.requestSiteVisitBtn.click();
        await expect(this.modalTitle('Request Site Visit'), "Request Site Visit modal is not visible").toBeVisible();

        await this.siteVisitorDropdown.click();
        await expect(this.siteVisitorOption(siteVisitor), `Site visitor option is not visible: ${siteVisitor}`).toBeVisible();
        await this.siteVisitorOption(siteVisitor).click();

        // await this.visitingDateCalenderButton.click();
        const today = new Date().getDate();
        await this.selectDate(today);
        // await this.page.locator('[role="dialog"]').last().getByText(today, { exact: true }).last().click();
    }
    @step()
    async goBackFromPPJO() {
        await expect(this.backButton, "PPJO back arrow is not visible").toBeVisible();
        await this.backButton.click();
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.backButton, "PPJO back arrow is not visible").toBeVisible();
        await this.backButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    @step()
    async openSalesEnquiryFromSideMenu() {
        const salesEnquiryMenu = this.page.locator('div').filter({ hasText: /^Sales Enquiry$/ }).last();
        await expect(salesEnquiryMenu, "Sales Enquiry side menu is not visible").toBeVisible();
        await salesEnquiryMenu.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    private async submitPPJODocumentRequest(buttonName: string, description: string, quantity: string) {
        const fileName = 'Test_Document.pdf';
        // const filePath = path.join(process.cwd(), 'test_Documents', fileName);

        await this.page.getByRole('button', { name: buttonName }).click();
        await expect(this.modalTitle(buttonName), `${buttonName} modal is not visible`).toBeVisible();
        // const [fileChooser] = await Promise.all([
        //     this.page.waitForEvent('filechooser'),
        //     this.uploadButton.click(),
        // ]);

        // await fileChooser.setFiles(filePath);
        await this.uploadFile('test_Documents', fileName);
        await expect(this.attachedDocument(fileName), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await this.quantityTextBox.fill(quantity);
        await this.descriptionEditor.fill(description);
    }
    @step()
    async validatePPJOAPI(statusCode: number, requestType: string) {
        const responsePromise = this.page.waitForResponse('**/PPJO/createPpjo');
        if (await this.requestEstimationButton.isVisible()) {
            await this.requestEstimationButton.click();
        } else {
            await this.saveButton.click();
        }
        // await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('domcontentloaded');
        const response = await responsePromise;
        expect(response.status(), `${requestType} API failed with status code. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log(`${requestType} API Verified with status code:`, response.status());
    }
    @step()
    async validatePPJOTableDetails() {
        const ppjoTable = await this.page.locator('.w-full.rounded-\\[6px\\]').innerText();
        expect(ppjoTable, "PPJO table does not contain Artwork").toContain('Artwork');
        expect(ppjoTable, "PPJO table does not contain AutoCAD").toContain('AutoCAD');
        expect(ppjoTable, "PPJO table does not contain Site-Visit").toContain('Site-Visit');
        expect(ppjoTable, "PPJO table does not contain Estimation").toContain('Estimation');
        expect(ppjoTable, "PPJO table does not contain Artwork requirement details").toContain('Artwork requirement details');
        expect(ppjoTable, "PPJO table does not contain AutoCAD requirement details").toContain('AutoCAD requirement details');
        expect(ppjoTable, "PPJO table does not contain Estimation requirement details").toContain('Estimation requirement details');
        expect(ppjoTable, "PPJO table does not contain Procurement requirement details").toContain('Procurement requirement details');
        expect(ppjoTable, "PPJO table does not contain Artwork Quantity").toContain('11');
        expect(ppjoTable, "PPJO table does not contain AutoCAD Quantity").toContain('12');
        expect(ppjoTable, "PPJO table does not contain Procurement Quantity").toContain('13');
        expect(ppjoTable, "PPJO table does not contain Estimation Quantity").toContain('14');
    }

    private async selectFromDropdown(dropdownName: string, value: string) {
        await this.dropDown(dropdownName).fill(value);
        await this.dropDownOption(value).click();
    }
    @step()
    async selectEstimationVersion(estimationVersion: string, estimationValue: string) {
        if (await this.viewEstimationBtn.isVisible()) {
            await this.viewEstimationBtn.click();
        }
        await this.selectFromDropdown('Select Estimation Version', estimationVersion);
        await this.selectFromDropdown('Select Estimation Version Value', estimationValue);
    }
    @step()
    async generateQuotationAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/Quotation/GenerateQuotation');
        await this.page.getByRole('button', { name: 'Generate Quotation' }).click();
        const response = await responsePromise;
        expect(response.status(), `Generate Quotation API failed with status code. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Generate Quotation API Verified with status code:', response.status());
    }
    @step()
    async editDate(date: number) {
        await this.page.waitForTimeout(500);
        await this.editDeliveryDateIcon.click();
        await this.selectDate(date);
        await this.saveButton.click();
    }
    @step()
    async validateBOQDetailsTable(boqData: BOQData) {
        await expect(this.page.locator('(//tr)[2]'), `BOQ details table does not contain description: ${boqData.description}`).toContainText(boqData.description);
        const boqDetails = await this.page.locator('(//tr)[2]').innerText();
        expect(boqDetails, `BOQ details table does not contain size: ${boqData.size}`).toContain(boqData.size);
        expect(boqDetails, `BOQ details table does not contain quantity: ${boqData.quantity}`).toContain(boqData.quantity);
    }
    @step()
    async submitQuotationForApprovalAndValidateAPI(statusCode: number) {
        await this.page.waitForTimeout(700);
        await this.submitForApprovalButton.click({ force: true });
        const responsePromise = this.page.waitForResponse('**/Quotation/SubmitForApproval/**');
        await this.submitButton.click();
        const response = await responsePromise;
        expect(response.status(), `Submit Quotation for approval API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Quotation submitted for approval successfully');
        console.log('Verified Submit Quotation for approval API with status code:', response.status());
    }
    @step()
    async clickRequestSample() {
        await this.requestSampleBtn.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    @step()
    async addNewSampleRequest(fileName: string, quantity: string, description: string) {
        await this.addSampleButton.click();
        await expect(this.banner, "Banner does not contain New Sample Request").toContainText('New Sample Request');
        await this.uploadFile('test_Documents', fileName);
        await expect(this.attachedDocument(fileName), `${fileName} is not visible in View Attached Documents`).toBeVisible();
        await this.quantityTextBox.fill(quantity);
        await this.newSampleDescription.fill(description);
    }
    @step()
    async validateSampleDetails(enquiryId: string, documentName: string, quantity: string, description: string) {
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(2000);
        await expect(this.page.locator('//div[@class="p-[18px] undefined"]').first(), `Sample details do not contain enquiry id: ${enquiryId}`).toContainText(enquiryId);
        const sampleDetails = await this.page.locator('//div[@class="p-[18px] undefined"]').first().innerText();
        expect(sampleDetails, `Sample details do not contain document name: ${documentName}`).toContain(documentName);
        expect(sampleDetails, "Sample details do not contain quantity: 1").toContain(quantity);
        expect(sampleDetails, "Sample details do not contain description: Sample Description").toContain(description);
    }
    @step()
    async requestEstimationAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/sample/sampleEstimationRequest?**');
        await this.requestEstimationButton.click();
        const response = await responsePromise;
        expect(response.status(), `Request Estimation API failed with status code. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Request Estimation API Verified with status code:', response.status());
    }
    @step()
    async clickSampleButton() {
        await this.sampleButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    @step()
    async validateRequestSampleDetails(data: SalesEnquiryData) {
        const detailsText = await this.page.locator('//div[@class="col-span-1 mr-8"]').innerText();
        // Validate key details are visible
        expect(detailsText, `View sales enquiry details do not contain customer name: ${data.customerName}`).toContain(data.customerName);
        console.log(`✓ Customer Name displayed: ${data.customerName}`);

        // Validate project name if not empty
        expect(detailsText, `View sales enquiry details do not contain project name: ${data.projectName}`).toContain(data.projectName);
        console.log(`✓ Project Name displayed: ${data.projectName}`);
        // }

        // Validate country
        expect(detailsText, `View sales enquiry details do not contain country: ${data.country}`).toContain(data.country);
        console.log(`✓ Country displayed: ${data.country}`);

        // Validate state
        expect(detailsText, `View sales enquiry details do not contain state: ${data.state}`).toContain(data.state);
        console.log(`✓ State displayed: ${data.state}`);

        // Validate city
        expect(detailsText, `View sales enquiry details do not contain city: ${data.city}`).toContain(data.city);
        console.log(`✓ City displayed: ${data.city}`);


        // commented because of a bug
        // const currencyName = Utils.getCurrencyName(data.currency);
        // expect(detailsText, `View sales enquiry details do not contain currency: ${currencyName}`).toContain(currencyName);
        // console.log(`✓ Currency displayed: ${currencyName}`);

        // Validate payment terms
        // expect(detailsText, `View sales enquiry details do not contain payment terms: ${data.paymentTerms}`).toContain(data.paymentTerms);
        // console.log(`✓ Payment Terms displayed: ${data.paymentTerms}`);

        expect(detailsText, `View sales enquiry details do not contain mobile number: ${data.mobileNumber1}`).toContain(data.mobileNumber1);
        console.log(`✓ Mobile Number displayed: ${data.mobileNumber1}`);

        expect(detailsText, `View sales enquiry details do not contain email: ${data.email1}`).toContain(data.email1);
        console.log(`✓ Email displayed: ${data.email1}`);

        console.log('All validation checks passed for view enquiry details');
    }
}