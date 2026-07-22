import { Page, Locator, expect } from "@playwright/test";
import { SalesEnquiryData } from "../testData/salesEnquiryData";
import { BasePage, step } from "./basePage";
import { Utils } from "../utils/utils";

export class SalesEnquiryPage extends BasePage {
    private readonly createSalesEnquiryButton: Locator;
    private readonly customerNameTextBox: Locator;
    private readonly flatOrVillaTextBox: Locator;
    private readonly buildingTextBox: Locator;
    private readonly blockTextBox: Locator;
    private readonly roadTextBox: Locator;
    private readonly areaTextBox: Locator;
    private readonly telephoneNumber1TextBox: Locator;
    private readonly mobileNumber1TextBox: Locator;
    private readonly faxTextBox: Locator;
    private readonly telephoneNumber2TextBox: Locator;
    private readonly mobileNumber2TextBox: Locator;
    private readonly email1: Locator;
    private readonly email2: Locator;
    private readonly websiteTextBox: Locator;
    private readonly pOBoxTextBox: Locator;
    private readonly countryDropdown: Locator;
    private readonly stateDropdown: Locator;
    private readonly cityDropdown: Locator;
    private readonly projectNameTextBox: Locator;
    private readonly dimensionTextBox: Locator;
    private readonly materialTextBox: Locator;
    private readonly colorTextBox: Locator;
    private readonly wallTextBox: Locator;
    private readonly requiredEquipments: Locator;
    private readonly equipmentProvidedByTxtbx: Locator;
    private readonly powerSupplyTxtBx: Locator;
    private readonly productDropdown: Locator;
    private readonly calenderBtn: Locator;
    private readonly payTermsDropdown: Locator;
    private readonly currencyDropdown: Locator;
    private readonly supplyTypeDropdown: Locator;
    private readonly pricingDateCalenderBtn: Locator;
    private readonly deleteButton: Locator;
    public readonly salesEnquiryTitle: Locator;
    private readonly deleteConfirmationButton: Locator;
    private readonly editIcons: Locator;
    private readonly updatePricingCalenderBtn: Locator;
    public readonly requestEstimationButton: Locator;
    public readonly createSalesEnquiryTitle: Locator;
    public readonly editSalesEnquiryTitle: Locator;
    private readonly createPPJOButton: Locator;
    public readonly viewEnquiryTitle: Locator;
    public readonly enquiryStatus: Locator;
    public readonly enquiryId: Locator;
    private readonly internalRequestBtn: Locator;
    private readonly enquiryBtn;
    public readonly socialMediaStatus: Locator;
    public readonly socialMediaImage: (name: string) => Locator;

    // Dynamic locators
    private readonly countryOption: (name: string) => Locator;
    private readonly stateOption: (name: string) => Locator;
    private readonly cityOption: (name: string) => Locator;
    private readonly equipmentOption: (name: string) => Locator;
    private readonly productOption: (name: string) => Locator;
    private readonly payTermsOption: (name: string) => Locator;
    private readonly currencyOption: (name: string) => Locator;
    private readonly supplyTypeOption: (name: string) => Locator;
    private readonly dateOption: (date: string) => Locator;
    private readonly projectModeRadio: (name: string) => Locator;
    private readonly permission: (name: string) => Locator;
    private readonly signageTypeRadio: (name: string) => Locator;
    private readonly timePurposeRadio: (name: string) => Locator;
    private readonly designSuppliedByOption: (name: string) => Locator;
    private readonly materialSuppliedByOption: (name: string) => Locator;
    private readonly projectRequirementTypeRadio: (name: string) => Locator;
    private readonly enquiryButton: (name: string) => Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.page = page;
        this.createSalesEnquiryButton = this.page.getByRole('button', { name: 'Sales Enquiry' });
        this.customerNameTextBox = this.page.getByRole('textbox', { name: 'Customer Name*' });
        this.flatOrVillaTextBox = this.page.getByRole('textbox', { name: 'Flat / Villa' }).or(this.page.getByRole('textbox', { name: 'Flat/Villa' }));
        this.buildingTextBox = this.page.getByRole('textbox', { name: 'Building' });
        this.blockTextBox = this.page.getByRole('textbox', { name: 'Block' });
        this.roadTextBox = this.page.getByRole('textbox', { name: 'Road' });
        this.areaTextBox = this.page.getByRole('textbox', { name: 'Area' });
        this.telephoneNumber1TextBox = this.page.getByRole('spinbutton', { name: 'Telephone Number 1' }).or(this.page.getByRole('textbox', { name: 'Telephone 1' }));
        this.mobileNumber1TextBox = this.page.getByPlaceholder('Enter Mobile Number 1').or(this.page.getByPlaceholder('Enter Number').first());
        this.faxTextBox = this.page.getByRole('spinbutton', { name: 'Fax' }).or(this.page.getByRole('textbox', { name: 'Fax' }));
        this.telephoneNumber2TextBox = this.page.getByRole('spinbutton', { name: 'Telephone Number 2' }).or(this.page.getByRole('textbox', { name: 'Telephone 2' }));
        this.mobileNumber2TextBox = this.page.getByPlaceholder('Enter Mobile Number 2').or(this.page.getByPlaceholder('Enter Number').nth(1));
        this.email1 = this.page.getByRole('textbox', { name: 'Email 1' });
        this.email2 = this.page.getByRole('textbox', { name: 'Email 2' });
        this.websiteTextBox = this.page.getByRole('textbox', { name: 'Website' });
        this.pOBoxTextBox = this.page.getByRole('textbox', { name: 'P.O. Box' }).or(this.page.getByRole('textbox', { name: 'PostBox No' }));
        this.countryDropdown = this.page.getByRole('combobox', { name: 'Country' });
        this.stateDropdown = this.page.getByRole('combobox', { name: 'State' });
        this.cityDropdown = this.page.getByRole('combobox', { name: 'City' });
        this.projectNameTextBox = this.page.getByRole('textbox', { name: 'Project Name' });
        this.dimensionTextBox = this.page.getByRole('textbox', { name: 'Size (Dimension)' });
        this.materialTextBox = this.page.getByRole('textbox', { name: 'Material Thickness' });
        this.colorTextBox = this.page.getByRole('textbox', { name: 'Color/Finish' });
        this.wallTextBox = this.page.getByRole('textbox', { name: 'Wall finishing Details' });
        this.requiredEquipments = this.page.getByRole('combobox', { name: 'Type Of Equipment Required' });
        this.equipmentProvidedByTxtbx = this.page.getByRole('textbox', { name: 'Equipment Provided by' });
        this.powerSupplyTxtBx = this.page.getByRole('textbox', { name: 'Power Supply' });
        this.productDropdown = this.page.getByRole('combobox', { name: 'Select products*' });
        this.calenderBtn = this.page.getByRole('button', { name: 'Choose date' }).first();
        this.payTermsDropdown = this.page.getByRole('combobox', { name: 'Payment Terms' });
        this.currencyDropdown = this.page.getByRole('combobox', { name: 'Currency' });
        this.supplyTypeDropdown = this.page.getByRole('combobox', { name: 'Supply Type*' });
        this.pricingDateCalenderBtn = this.page.getByRole('button', { name: 'Choose date', exact: true });
        this.enquiryButton = (name: string) => this.page.getByRole('button', { name: `${name}` });
        this.salesEnquiryTitle = this.page.locator("//h1");
        this.createSalesEnquiryTitle = this.page.locator('//span[normalize-space(text())="Create Sales Enquiry"]');
        this.deleteButton = this.page.locator('//img[contains(@src,"delete.svg")]').first();
        this.deleteConfirmationButton = this.page.getByRole('button', { name: 'Delete' });
        this.editIcons = this.page.locator('//img[contains(@src,"edit.svg")]').first();
        this.editSalesEnquiryTitle = this.page.locator('//span[normalize-space()="Edit Sales Enquiry"]');
        this.updatePricingCalenderBtn = this.page.locator('//button[contains(@aria-label,"Choose date, selected")]').last();
        this.requestEstimationButton = this.page.getByRole('button', { name: 'Request Estimation' });
        this.internalRequestBtn = this.page.getByRole('button', { name: 'Internal Request' });
        this.enquiryBtn = this.page.getByRole('button', { name: 'Enquiry' });
        this.socialMediaStatus = this.page.locator('//td[@data-app-table-col="4"]//span').first();

        // Dynamic locators initialization
        this.projectModeRadio = (name: string) => this.page.locator('label').filter({ hasText: `${name}` }).first();
        this.signageTypeRadio = (name: string) => this.page.locator(`//input[@value="${name}"]//following-sibling::div`);
        this.timePurposeRadio = (name: string) => this.page.locator(`//label[contains(text(),"${name}")]//preceding-sibling::div`);
        this.designSuppliedByOption = (name: string) => this.page.locator(`(//label[text()="${name}"])[1]//preceding-sibling::div`);
        this.materialSuppliedByOption = (name: string) => this.page.locator(`(//label[text()="${name}"])[2]//preceding-sibling::div`);
        this.projectRequirementTypeRadio = (name: string) => this.page.locator(`//label[text()="${name}"]//preceding-sibling::div`);
        this.countryOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.stateOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.cityOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.equipmentOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.productOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.payTermsOption = (name: string) => this.page.getByText(`${name}`, { exact: true });
        this.currencyOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.supplyTypeOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.dateOption = (date: string) => this.page.locator(`//div[@class="css-8uic9k" and text()="${date}"]`).first();
        this.createPPJOButton = this.page.locator('//span[text()="Create PPJO"]//parent::button').first();
        this.permission = (name: string) => this.page.locator(`//label[text()="${name}"]/preceding-sibling::div`);
        this.viewEnquiryTitle = this.page.getByRole('heading');
        this.enquiryStatus = this.page.locator('//td[@data-app-table-col="3"]//span').first();
        this.enquiryId = this.page.locator(`//td[@data-app-table-col="0"]//div`).first();
        this.socialMediaImage = (name: string) => this.page.getByRole('img', { name: `${name}` });
    }
    @step()
    async enterCustomerName(data: SalesEnquiryData) {
        await this.page.waitForTimeout(1000);
        await this.customerNameTextBox.fill(data.customerName, { force: true });
        await expect(this.customerNameTextBox, "Customer Name value mismatch while creating sales enquiry").toHaveValue(data.customerName);
    }
    @step()
    async enterSocialMedia(socialMedia: string) {
        await this.selectOptionFromDropdown('Social Media*', socialMedia)
    }

    @step()
    async clickEnquiryButton() {
        await expect(this.enquiryBtn, "Create Enquiry button is not visible").toBeVisible();
        await this.enquiryBtn.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
    }
    @step()
    async createSalesEnquiry(data: SalesEnquiryData) {
        await this.enterAddress(data);

        // Project details
        await this.projectNameTextBox.fill(data.projectName);
        await expect(this.projectNameTextBox, "Project Name value mismatch while creating sales enquiry").toHaveValue(data.projectName);

        // Radio buttons - assert checked state
        await this.projectModeRadio(data.projectMode).click();
        await expect(this.projectModeRadio(data.projectMode), `Project Mode option was not selected: ${data.projectMode}`).toBeChecked();

        await this.signageTypeRadio(data.signageType).click();
        await expect(this.signageTypeRadio(data.signageType), `Signage Type option was not selected: ${data.signageType}`).toBeChecked();

        await this.timePurposeRadio(data.timePurpose).click();
        await expect(this.timePurposeRadio(data.timePurpose), `Time Purpose option was not selected: ${data.timePurpose}`).toBeChecked();

        // Options - assert selected/checked
        await this.designSuppliedByOption(data.designSuppliedBy).click();
        await expect(this.designSuppliedByOption(data.designSuppliedBy), `Design Supplied By option was not selected: ${data.designSuppliedBy}`).toBeChecked();

        await this.materialSuppliedByOption(data.materialSuppliedBy).click();
        await expect(this.materialSuppliedByOption(data.materialSuppliedBy), `Material Supplied By option was not selected: ${data.materialSuppliedBy}`).toBeChecked();

        // Specification fields
        await this.dimensionTextBox.fill(data.dimension);
        await expect(this.dimensionTextBox, "Size dimension value mismatch while creating sales enquiry").toHaveValue(data.dimension);

        await this.materialTextBox.fill(data.materialThickness);
        await expect(this.materialTextBox, "Material Thickness value mismatch while creating sales enquiry").toHaveValue(data.materialThickness);

        await this.colorTextBox.fill(data.color);
        await expect(this.colorTextBox, "Color / Finish value mismatch while creating sales enquiry").toHaveValue(data.color);

        await this.projectRequirementTypeRadio(data.projectRequirementType).click();
        await expect(this.projectRequirementTypeRadio(data.projectRequirementType), `Project Requirement Type option was not selected: ${data.projectRequirementType}`).toBeChecked();

        await this.wallTextBox.fill(data.wall);
        await expect(this.wallTextBox, "Wall finishing details value mismatch while creating sales enquiry").toHaveValue(data.wall);

        // Equipment
        await this.requiredEquipments.click();
        await this.equipmentOption(data.equipment).click();

        await this.equipmentProvidedByTxtbx.fill(data.equipmentProvidedBy);
        await expect(this.equipmentProvidedByTxtbx, "Equipment Provided By value mismatch while creating sales enquiry").toHaveValue(data.equipmentProvidedBy);

        await this.permission(data.permission).check();
        await expect(this.permission(data.permission), `Permission option was not selected: ${data.permission}`).toBeChecked();

        await this.powerSupplyTxtBx.fill(data.powerSupply);
        await expect(this.powerSupplyTxtBx, "Power Supply value mismatch while creating sales enquiry").toHaveValue(data.powerSupply);

        // Product dropdown
        await this.productDropdown.click();
        for (const productName of data.product) {
            await this.productOption(productName).click();
        }

        // Calendar - delivery date
        // await this.calenderBtn.click();
        // await this.dateOption(`${data.date}`).click();
        await this.selectDate(data.date);

        // Payment terms
        await this.payTermsDropdown.fill(data.paymentTerms);
        await this.payTermsOption(data.paymentTerms).click();

        // Currency
        await this.currencyDropdown.clear();
        await this.currencyDropdown.click();
        await expect(this.currencyOption(data.currency), `Currency option is not visible: ${data.currency}`).toBeVisible();
        await this.currencyOption(data.currency).click();

        // Supply type
        await this.supplyTypeDropdown.clear();
        await this.supplyTypeDropdown.pressSequentially(data.supplyType);
        await expect(this.supplyTypeOption(data.supplyType), `Supply Type option is not visible: ${data.supplyType}`).toBeVisible();
        await this.supplyTypeOption(data.supplyType).click();

        // Calendar - pricing date
        // await this.pricingDateCalenderBtn.click();
        // await expect(this.dateOption(`${data.date}`), `Pricing date option is not visible: ${data.date}`).toBeVisible();
        // await this.dateOption(`${data.date}`).click();
        await this.selectDate(data.date, 1);

        // Final submit
        await expect(this.enquiryButton('Create Enquiry'), "Create Enquiry button is not visible").toBeVisible();
    }

    async enterAddress(data: SalesEnquiryData) {
        await this.flatOrVillaTextBox.fill(data.flatOrVilla);
        await expect(this.flatOrVillaTextBox, "Flat / Villa value mismatch while creating sales enquiry").toHaveValue(data.flatOrVilla);

        await this.buildingTextBox.fill(data.building);
        await expect(this.buildingTextBox, "Building value mismatch while creating sales enquiry").toHaveValue(data.building);

        await this.blockTextBox.fill(data.block);
        await expect(this.blockTextBox, "Block value mismatch while creating sales enquiry").toHaveValue(data.block);

        await this.roadTextBox.fill(data.road);
        await expect(this.roadTextBox, "Road value mismatch while creating sales enquiry").toHaveValue(data.road);

        await this.areaTextBox.fill(data.area);
        await expect(this.areaTextBox, "Area value mismatch while creating sales enquiry").toHaveValue(data.area);

        // Contact details
        await this.telephoneNumber1TextBox.fill(data.telephoneNumber1);
        await expect(this.telephoneNumber1TextBox, "Telephone Number 1 value mismatch while creating sales enquiry").toHaveValue(data.telephoneNumber1);

        await this.mobileNumber1TextBox.fill(data.mobileNumber1);
        await expect(this.mobileNumber1TextBox, "Mobile Number 1 value mismatch while creating sales enquiry").toHaveValue(data.mobileNumber1);

        await this.faxTextBox.fill(data.fax);
        await expect(this.faxTextBox, "Fax value mismatch while creating sales enquiry").toHaveValue(data.fax);

        await this.telephoneNumber2TextBox.fill(data.telephoneNumber2);
        await expect(this.telephoneNumber2TextBox, "Telephone Number 2 value mismatch while creating sales enquiry").toHaveValue(data.telephoneNumber2);

        await this.mobileNumber2TextBox.fill(data.mobileNumber2);
        await expect(this.mobileNumber2TextBox, "Mobile Number 2 value mismatch while creating sales enquiry").toHaveValue(data.mobileNumber2);

        await this.email1.fill(data.email1);
        await expect(this.email1, "Email 1 value mismatch while creating sales enquiry").toHaveValue(data.email1);

        await this.email2.fill(data.email2);
        await expect(this.email2, "Email 2 value mismatch while creating sales enquiry").toHaveValue(data.email2);

        await this.websiteTextBox.fill(data.website);
        await expect(this.websiteTextBox, "Website value mismatch while creating sales enquiry").toHaveValue(data.website);

        await this.pOBoxTextBox.fill(data.poBox);
        await expect(this.pOBoxTextBox, "P.O. Box value mismatch while creating sales enquiry").toHaveValue(data.poBox);

        // Country dropdown
        await this.countryDropdown.pressSequentially(data.country);
        await this.countryOption(data.country).click();

        // State dropdown
        await this.stateDropdown.pressSequentially(data.state);
        await this.stateOption(data.state).click();

        // City dropdown
        await this.cityDropdown.pressSequentially(data.city);
        await this.cityOption(data.city).click();
    }
    @step()
    async validateCreateSalesEnquiryAPI(statusCode: number, enquiryType: string) {
        const responsePromise = this.page.waitForResponse('**/salesEnquiry/upsertSalesEnquiry');
        await this.enquiryButton(enquiryType).click();
        const response = await responsePromise;
        const responseBody = await response.json();
        const extId = responseBody.result.extId;
        expect(response.status(), `Sales enquiry upsert API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified sales enquiry creation API with status code:', response.status());
        return extId;
    }
    @step()
    async validateDeleteSalesEnquiryAPI(statusCode: number) {
        await this.deleteButton.click();
        const responsePromise = this.page.waitForResponse('**/salesEnquiry/delete/**');
        await this.deleteConfirmationButton.click();
        const response = await responsePromise;
        expect(response.status(), `Sales enquiry delete API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Sales enquiry deleted successfully');
        console.log(`Verified sales enquiry deletion API with status code:`, response.status());
    }
    @step()
    async viewSalesEnquiry(customerName: string) {
        // Search for the customer
        await this.search(customerName);
        await expect(this.createdSalesEnquiry(customerName), `Sales enquiry is not visible for customer: ${customerName}`).toBeVisible();

        // // Click the eye icon to view the enquiry
        // const eyeIcon = this.page.locator('//img[contains(@src, "eye")]').first();
        await expect(this.eyeIcon, "View sales enquiry eye icon is not visible").toBeVisible();
    }
    @step()
    async validateViewEnquiryDetails(data: SalesEnquiryData) {
        // await expect(this.page.getByRole('heading'), "View Enquiry Title is does not contain View Enquiry").toContainText('View Enquiry');
        // Get all the detail labels and values from the view page
        // const detailsText = await this.page.locator('//div[@class="p-0 undefined"]').innerText();
        await expect(this.page.locator('//div[@class="p-[18px] undefined"]'), `View sales enquiry details do not contain customer name: ${data.customerName}`).toContainText(data.customerName);
        const detailsText = await this.page.locator('//div[@class="p-[18px] undefined"]').innerText();
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
    @step()
    async validateViewSalesEnquiryAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/getEnquiryDetails**');
        await this.eyeIcon.click();
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('domcontentloaded');
        const response = await responsePromise;
        expect(response.status(), `View sales enquiry API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Sales enquiry details fetched successfully');
        console.log('Verified view sales enquiry API with status code:', response.status());
    }
    @step()
    async editSalesEnquiry(customerName: string) {
        await this.search(customerName);
        await expect(this.createdSalesEnquiry(customerName), `Sales enquiry is not visible before edit for customer: ${customerName}`).toBeVisible();
        await this.editIcons.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    @step()
    async validateExistingDataIsVisibleInEditEnquiry(data: SalesEnquiryData) {
        await expect(this.customerNameTextBox, "Customer Name value mismatch in edit sales enquiry form").toHaveValue(data.customerName);
        await expect(this.flatOrVillaTextBox, "Flat / Villa value mismatch in edit sales enquiry form").toHaveValue(data.flatOrVilla);
        await expect(this.buildingTextBox, "Building value mismatch in edit sales enquiry form").toHaveValue(data.building);
        await expect(this.blockTextBox, "Block value mismatch in edit sales enquiry form").toHaveValue(data.block);
        await expect(this.roadTextBox, "Road value mismatch in edit sales enquiry form").toHaveValue(data.road);
        await expect(this.areaTextBox, "Area value mismatch in edit sales enquiry form").toHaveValue(data.area);
        await expect(this.telephoneNumber1TextBox, "Telephone Number 1 value mismatch in edit sales enquiry form").toHaveValue(data.telephoneNumber1);
        await expect(this.mobileNumber1TextBox, "Mobile Number 1 value mismatch in edit sales enquiry form").toHaveValue(data.mobileNumber1);
        await expect(this.faxTextBox, "Fax value mismatch in edit sales enquiry form").toHaveValue(data.fax);
        await expect(this.telephoneNumber2TextBox, "Telephone Number 2 value mismatch in edit sales enquiry form").toHaveValue(data.telephoneNumber2);
        await expect(this.mobileNumber2TextBox, "Mobile Number 2 value mismatch in edit sales enquiry form").toHaveValue(data.mobileNumber2);
        await expect(this.email1, "Email 1 value mismatch in edit sales enquiry form").toHaveValue(data.email1);
        await expect(this.email2, "Email 2 value mismatch in edit sales enquiry form").toHaveValue(data.email2);
        await expect(this.websiteTextBox, "Website value mismatch in edit sales enquiry form").toHaveValue(data.website);
        await expect(this.pOBoxTextBox, "P.O. Box value mismatch in edit sales enquiry form").toHaveValue(data.poBox);
        await expect(this.projectNameTextBox, "Project Name value mismatch in edit sales enquiry form").toHaveValue(data.projectName);
        await expect(this.projectModeRadio(data.projectMode), `Project Mode option mismatch in edit sales enquiry form: ${data.projectMode}`).toBeChecked();
        await expect(this.signageTypeRadio(data.signageType), `Signage Type option mismatch in edit sales enquiry form: ${data.signageType}`).toBeChecked();
        await expect(this.timePurposeRadio(data.timePurpose), `Time Purpose option mismatch in edit sales enquiry form: ${data.timePurpose}`).toBeChecked();
        await expect(this.designSuppliedByOption(data.designSuppliedBy), `Design Supplied By option mismatch in edit sales enquiry form: ${data.designSuppliedBy}`).toBeChecked();
        await expect(this.materialSuppliedByOption(data.materialSuppliedBy), `Material Supplied By option mismatch in edit sales enquiry form: ${data.materialSuppliedBy}`).toBeChecked();
        await expect(this.dimensionTextBox, "Size dimension value mismatch in edit sales enquiry form").toHaveValue(data.dimension);
        await expect(this.materialTextBox, "Material Thickness value mismatch in edit sales enquiry form").toHaveValue(data.materialThickness);
        await expect(this.colorTextBox, "Color / Finish value mismatch in edit sales enquiry form").toHaveValue(data.color);
        await expect(this.projectRequirementTypeRadio(data.projectRequirementType), `Project Requirement Type option mismatch in edit sales enquiry form: ${data.projectRequirementType}`).toBeChecked();
        await expect(this.wallTextBox, "Wall finishing details value mismatch in edit sales enquiry form").toHaveValue(data.wall);
        await expect(this.equipmentProvidedByTxtbx, "Equipment Provided By value mismatch in edit sales enquiry form").toHaveValue(data.equipmentProvidedBy);
        await expect(this.powerSupplyTxtBx, "Power Supply value mismatch in edit sales enquiry form").toHaveValue(data.powerSupply);
    }
    @step()
    async clickCreateEnquiryButton() {
        await expect(this.createSalesEnquiryButton, "Create Sales Enquiry button is not visible").toBeVisible();
        await this.createSalesEnquiryButton.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
    }
    @step()
    async clickInternalRequestButton() {
        await expect(this.internalRequestBtn, "Internal Request button is not visible").toBeVisible();
        await this.internalRequestBtn.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
    }

    // await page.getByRole('button', { name: 'Internal Request' }).click();
    @step()
    async updateSalesEnquiry(data: SalesEnquiryData) {
        await this.customerNameTextBox.fill(data.customerName, { timeout: 5000, force: true });
        await expect(this.customerNameTextBox, "Customer Name value mismatch while updating sales enquiry").toHaveValue(data.customerName);

        // Address fields
        await this.flatOrVillaTextBox.fill(data.flatOrVilla);
        await expect(this.flatOrVillaTextBox, "Flat / Villa value mismatch while updating sales enquiry").toHaveValue(data.flatOrVilla);

        await this.buildingTextBox.fill(data.building);
        await expect(this.buildingTextBox, "Building value mismatch while updating sales enquiry").toHaveValue(data.building);

        await this.blockTextBox.fill(data.block);
        await expect(this.blockTextBox, "Block value mismatch while updating sales enquiry").toHaveValue(data.block);

        await this.roadTextBox.fill(data.road);
        await expect(this.roadTextBox, "Road value mismatch while updating sales enquiry").toHaveValue(data.road);

        await this.areaTextBox.fill(data.area);
        await expect(this.areaTextBox, "Area value mismatch while updating sales enquiry").toHaveValue(data.area);

        // Contact details
        await this.telephoneNumber1TextBox.fill(data.telephoneNumber1);
        await expect(this.telephoneNumber1TextBox, "Telephone Number 1 value mismatch while updating sales enquiry").toHaveValue(data.telephoneNumber1);

        await this.mobileNumber1TextBox.fill(data.mobileNumber1);
        await expect(this.mobileNumber1TextBox, "Mobile Number 1 value mismatch while updating sales enquiry").toHaveValue(data.mobileNumber1);

        await this.faxTextBox.fill(data.fax);
        await expect(this.faxTextBox, "Fax value mismatch while updating sales enquiry").toHaveValue(data.fax);

        await this.telephoneNumber2TextBox.fill(data.telephoneNumber2);
        await expect(this.telephoneNumber2TextBox, "Telephone Number 2 value mismatch while updating sales enquiry").toHaveValue(data.telephoneNumber2);

        await this.mobileNumber2TextBox.fill(data.mobileNumber2);
        await expect(this.mobileNumber2TextBox, "Mobile Number 2 value mismatch while updating sales enquiry").toHaveValue(data.mobileNumber2);

        await this.email1.fill(data.email1);
        await expect(this.email1, "Email 1 value mismatch while updating sales enquiry").toHaveValue(data.email1);

        await this.email2.fill(data.email2);
        await expect(this.email2, "Email 2 value mismatch while updating sales enquiry").toHaveValue(data.email2);

        await this.websiteTextBox.fill(data.website);
        await expect(this.websiteTextBox, "Website value mismatch while updating sales enquiry").toHaveValue(data.website);

        await this.pOBoxTextBox.fill(data.poBox);
        await expect(this.pOBoxTextBox, "P.O. Box value mismatch while updating sales enquiry").toHaveValue(data.poBox);

        // Country dropdown
        await this.countryDropdown.clear();
        await this.countryDropdown.pressSequentially(data.country);
        await this.countryOption(data.country).click();

        // State dropdown
        await this.stateDropdown.clear();
        await this.stateDropdown.pressSequentially(data.state);
        await this.stateOption(data.state).click();

        // City dropdown
        await this.cityDropdown.clear();
        await this.cityDropdown.pressSequentially(data.city);
        await this.cityOption(data.city).click();

        // Project details
        await this.projectNameTextBox.fill(data.projectName);
        await expect(this.projectNameTextBox, "Project Name value mismatch while updating sales enquiry").toHaveValue(data.projectName);

        await this.projectModeRadio(data.projectMode).click();
        await expect(this.projectModeRadio(data.projectMode), `Project Mode option was not selected while updating sales enquiry: ${data.projectMode}`).toBeChecked();

        await this.signageTypeRadio(data.signageType).click();
        await expect(this.signageTypeRadio(data.signageType), `Signage Type option was not selected while updating sales enquiry: ${data.signageType}`).toBeChecked();

        await this.timePurposeRadio(data.timePurpose).click();
        await expect(this.timePurposeRadio(data.timePurpose), `Time Purpose option was not selected while updating sales enquiry: ${data.timePurpose}`).toBeChecked();

        await this.designSuppliedByOption(data.designSuppliedBy).click();
        await expect(this.designSuppliedByOption(data.designSuppliedBy), `Design Supplied By option was not selected while updating sales enquiry: ${data.designSuppliedBy}`).toBeChecked();

        await this.materialSuppliedByOption(data.materialSuppliedBy).click();
        await expect(this.materialSuppliedByOption(data.materialSuppliedBy), `Material Supplied By option was not selected while updating sales enquiry: ${data.materialSuppliedBy}`).toBeChecked();

        // Specification fields
        await this.dimensionTextBox.fill(data.dimension);
        await expect(this.dimensionTextBox, "Size dimension value mismatch while updating sales enquiry").toHaveValue(data.dimension);

        await this.materialTextBox.fill(data.materialThickness);
        await expect(this.materialTextBox, "Material Thickness value mismatch while updating sales enquiry").toHaveValue(data.materialThickness);

        await this.colorTextBox.fill(data.color);
        await expect(this.colorTextBox, "Color / Finish value mismatch while updating sales enquiry").toHaveValue(data.color);

        await this.projectRequirementTypeRadio(data.projectRequirementType).click();
        await expect(this.projectRequirementTypeRadio(data.projectRequirementType), `Project Requirement Type option was not selected while updating sales enquiry: ${data.projectRequirementType}`).toBeChecked();

        await this.wallTextBox.fill(data.wall);
        await expect(this.wallTextBox, "Wall finishing details value mismatch while updating sales enquiry").toHaveValue(data.wall);

        // Equipment
        await this.requiredEquipments.click();
        await this.uncheckAllCheckbox();
        await this.equipmentOption(data.equipment).click();

        await this.equipmentProvidedByTxtbx.fill(data.equipmentProvidedBy);
        await expect(this.equipmentProvidedByTxtbx, "Equipment Provided By value mismatch while updating sales enquiry").toHaveValue(data.equipmentProvidedBy);

        await this.powerSupplyTxtBx.fill(data.powerSupply);
        await expect(this.powerSupplyTxtBx, "Power Supply value mismatch while updating sales enquiry").toHaveValue(data.powerSupply);

        // Product dropdown
        await this.productDropdown.click();
        await this.uncheckAllCheckbox();
        for (const productName of data.product) {
            await this.productOption(productName).click();
        }

        // Calendar - delivery date
        // await this.calenderBtn.click();
        // await this.dateOption(`${data.date}`).click();
        await this.selectDate(data.date);


        // Payment terms
        await this.payTermsDropdown.clear();
        await this.payTermsDropdown.fill(data.paymentTerms);
        await this.payTermsOption(data.paymentTerms).click();

        // Currency
        await this.currencyDropdown.click();
        await expect(this.currencyOption(data.currency), `Currency option is not visible while updating sales enquiry: ${data.currency}`).toBeVisible();
        await this.currencyOption(data.currency).click();

        // Supply type
        await this.supplyTypeDropdown.clear();
        await this.supplyTypeDropdown.pressSequentially(data.supplyType);
        await expect(this.supplyTypeOption(data.supplyType), `Supply Type option is not visible while updating sales enquiry: ${data.supplyType}`).toBeVisible();
        await this.supplyTypeOption(data.supplyType).click();

        // Calendar - pricing date
        // await this.updatePricingCalenderBtn.click();
        // await expect(this.dateOption(`${data.date}`), `Pricing date option is not visible while updating sales enquiry: ${data.date}`).toBeVisible();
        // await this.dateOption(`${data.date}`).click();
        await this.selectDate(data.date, 1);
    }
    @step()
    async clickCreatePPJO() {
        await this.scrollUntilElementVisibleAndClick(this.createPPJOButton);
        await this.page.waitForLoadState('domcontentloaded');
    }
    @step()
    async validateCustomerStatus(customerName: string, status: string) {
        const customerRow = this.page.getByRole('row').filter({ hasText: customerName }).first();
        await expect(customerRow, `Sales enquiry row is not visible for customer: ${customerName}`).toBeVisible();
        await expect(customerRow, `Status does not match for customer: ${customerName}`).toContainText(status);
    }
    @step()
    async validateCustomerPPJOColumn(customerName: string, ppjoValues: string | string[]) {
        const customerRow = this.page.getByRole('row').filter({ hasText: customerName }).first();
        await expect(customerRow, `Sales enquiry row is not visible for customer: ${customerName}`).toBeVisible();

        const MAX_SCROLLS = 12;
        const SCROLL_DELAY_MS = 250;
        const expectedValues = Array.isArray(ppjoValues) ? ppjoValues : [ppjoValues];

        for (let i = 0; i < MAX_SCROLLS; i++) {
            const rowText = await customerRow.innerText();
            if (expectedValues.every((value) => rowText.includes(value))) break;
            await this.page.keyboard.press('ArrowRight');
            await this.page.waitForTimeout(SCROLL_DELAY_MS);
        }

        for (const expectedValue of expectedValues) {
            await expect(customerRow, `PPJO column does not contain "${expectedValue}" for customer: ${customerName}`).toContainText(expectedValue);
        }
    }

    // async getEnquiryId(customerName: string) {
    //     await this.search(customerName);
    //     await expect(this.createdSalesEnquiry(customerName), `Sales enquiry is not visible for customer: ${customerName}`).toBeVisible();
    //     const enquiryId = await this.page.locator('//tr/td[2]/div').textContent();
    //     return enquiryId;
    // }
    @step()
    async validateSalesEnquiryDeleted(name: string) {
        await this.searchBox.fill(name);
        await this.page.waitForTimeout(1000);
        await expect(this.createdSalesEnquiry(name), `Deleted sales enquiry is still visible for customer: ${name}`).not.toBeVisible();
    }

    // async clickViewIcon(){
    //     await this.eyeIcon.click();
    //     await this.page.waitForLoadState('domcontentloaded');
    // }
    @step()
    async searchToGetEnquiryId(customerName: string) {
        await this.page.waitForTimeout(2000);
        await this.searchBox.fill(customerName);
        await expect(this.createdSalesEnquiry(customerName).first(), `Sales enquiry is not visible for customer: ${customerName}`).toBeVisible();
        const enquiryId = await this.enquiryIdCell.textContent();
        return enquiryId || '';
    }
}