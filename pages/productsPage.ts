import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class ProductsPage extends BasePage {
    public readonly productTab: Locator;
    private readonly categoryDropdown: Locator;
    private readonly materialDropdown: Locator;
    private readonly tailoringDropdown: Locator;
    private readonly lengthTextBox: Locator;
    private readonly heightTextBox: Locator;
    private readonly widthTextBox: Locator;
    private readonly saveButton: Locator;
    private readonly materialDropDown: Locator;
    private readonly illuminationDropDown: Locator;
    private readonly mountingDropDown: Locator;
    private readonly tombStoneLength: Locator;
    private readonly tombStoneHeight: Locator;
    private readonly tombStoneWidth: Locator;
    public readonly embriodSuccessMessage: Locator;
    public readonly acrylicSuccessMessage: Locator;
    public readonly signageSuccessMessage: Locator;
    public readonly atmProductsSuccessMessage: Locator;
    public readonly vinylGraphicSuccessMessage: Locator;
    public readonly tradingSuccessMessage: Locator;
    public readonly pvcSuccessMessage: Locator;
    private readonly tapAway: Locator;
    private readonly mirrorSizeField: Locator;
    private readonly coneSize: Locator;
    private readonly bollardSize: Locator;

    // Dynamic locators
    private readonly radioButton: (name: string) => Locator;
    private readonly optionCheckBox: (name: string) => Locator;
    private readonly sizeValue: (name: string) => Locator;
    private readonly productTabByName: (name: string) => Locator;
    private readonly productFieldById: (id: string) => Locator;
    private readonly dropDown: (name: string) => Locator;
    private readonly dropDownOption: (name: string) => Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.productTab = this.page.locator('//button[contains(@class,"MuiTab-root")]');
        this.embriodSuccessMessage = this.page.getByRole('paragraph').filter({ hasText: 'Embroidery tailoring created' });
        this.acrylicSuccessMessage = this.page.getByRole('paragraph').filter({ hasText: 'Acrylic products created' });
        this.categoryDropdown = this.page.getByRole('combobox', { name: 'Category' });
        this.materialDropdown = this.page.getByRole('combobox', { name: 'Material / Finish' });
        this.tailoringDropdown = this.page.getByRole('combobox', { name: 'Tailoring Options' });
        this.saveButton = this.page.getByRole('button', { name: 'Save' });
        this.lengthTextBox = this.page.locator('#length');
        this.heightTextBox = this.page.locator('#height');
        this.widthTextBox = this.page.locator('#width');
        this.materialDropDown = this.page.getByRole('combobox', { name: 'Material And Finish' });
        this.illuminationDropDown = this.page.getByRole('combobox', { name: 'Illumination Options' });
        this.mountingDropDown = this.page.getByRole('combobox', { name: 'Mounting Options' });
        this.tombStoneLength = this.page.locator('#tombstoneLength');
        this.tombStoneHeight = this.page.locator('#tombstoneHeight');
        this.tombStoneWidth = this.page.locator('#tombstoneWidth');
        this.signageSuccessMessage = this.page.getByRole('paragraph').filter({ hasText: /signage.*created successfully/i });
        this.atmProductsSuccessMessage = this.page.getByRole('paragraph').filter({ hasText: /atm products created successfully/i });
        this.vinylGraphicSuccessMessage = this.page.getByRole('paragraph').filter({ hasText: /vinyl graphic created successfully/i });
        this.tradingSuccessMessage = this.page.getByRole('paragraph').filter({ hasText: /trading.*created successfully/i });
        this.pvcSuccessMessage = this.page.getByRole('paragraph').filter({ hasText: /pvc.*created successfully/i });
        this.mirrorSizeField = this.page.locator('#mirrorSize');
        this.coneSize = this.page.locator('#coneSize');
        this.bollardSize = this.page.locator('#bollardSize');
        this.tapAway = this.page.locator('body');

        // Dynamic locators initialization
        this.productTabByName = (name: string) => this.productTab.filter({ hasText: name }).first();
        this.productFieldById = (id: string) => this.page.locator(`input#${id}:visible`).first();
        this.dropDown = (name: string) => this.page.getByRole('combobox', { name: `${name}` });
        this.dropDownOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.optionCheckBox = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.sizeValue = (name: string) => this.page.getByText(`${name}`);
        this.radioButton = (name: string) => this.page.locator('label').filter({ hasText: `${name}` }).first();
    }
    @step()
    async enterEmbroidingDetails(category: string, material: string, tailoring: string) {
        await this.categoryDropdown.click();
        await this.uncheckAllCheckbox();
        await this.optionCheckBox(category).click();
        await this.page.keyboard.press('Tab');
        await this.materialDropdown.click();
        await this.uncheckAllCheckbox();
        await this.optionCheckBox(material).click();
        await this.page.keyboard.press('Tab');
        await this.tailoringDropdown.click();
        await this.uncheckAllCheckbox();
        await this.optionCheckBox(tailoring).click();
        await this.page.keyboard.press('Tab');
    }
    @step()
    async enterAcrylicProductDetails(material: string, illumination: string, mounting: string, length: string, height: string, width: string) {
        await this.lengthTextBox.clear();
        await this.lengthTextBox.fill(length);
        await this.heightTextBox.clear();
        await this.heightTextBox.fill(height);
        await this.widthTextBox.clear();
        await this.widthTextBox.fill(width);
        await this.materialDropDown.click();
        await this.uncheckAllCheckbox();
        await this.optionCheckBox(material).click();
        await this.page.keyboard.press('Tab');
        await this.illuminationDropDown.click();
        await this.uncheckAllCheckbox();
        await this.optionCheckBox(illumination).click();
        await this.page.keyboard.press('Tab');
        await this.mountingDropDown.click();
        await this.uncheckAllCheckbox();
        await this.optionCheckBox(mounting).click();
        await this.page.keyboard.press('Tab');
        await this.enterTombStoneDetails('5', '5', '5');
    }

    private async enterTombStoneDetails(length: string, height: string, width: string) {
        await this.tombStoneLength.clear();
        await this.tombStoneLength.fill(length);
        await this.tombStoneHeight.clear();
        await this.tombStoneHeight.fill(height);
        await this.tombStoneWidth.clear();
        await this.tombStoneWidth.fill(width);
    }
    @step()
    async validateCreateEmbroideryAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/salesEnquiryForm/upsertEmbroidery');
        await this.saveButton.click();
        const response = await responsePromise;
        expect(response.status(), `Embroidery API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Embroidery and Tailoring created successfully');
        console.log('Verified embroidery creation API with status code:', response.status());
    }
    @step()
    async validateCreateAcrylicProductAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/salesEnquiryForm/upsertAcrylicProducts');
        await this.saveButton.click();
        const response = await responsePromise;
        expect(response.status(), `Acrylic products API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Acrylic product created successfully');
        console.log('Verified acrylic product creation API with status code:', response.status());
    }

    // ------------------------------------------------------------
    public getExpectedProductTabs(productNames: string[]) {
        const tabNames = productNames.map(productName => productName === 'PVC Products' ? 'PVC' : productName);
        return tabNames;
    }
    @step()
    async validateProductTabsListed(productNames: string[]) {
        await expect(this.productTab.first(), "Product tabs are not visible").toBeVisible();
        const productTabNames = (await this.productTab.allTextContents()).map(productTabName => productTabName.trim());

        for (const expectedProductTab of this.getExpectedProductTabs(productNames)) {
            expect(productTabNames, `Product tab is not listed: ${expectedProductTab}`).toContain(expectedProductTab);
        }
    }

    private async openProductTab(productName: string) {
        const tabName = productName === 'PVC Products' ? 'PVC' : productName;
        await expect(this.productTabByName(tabName), `Product tab is not visible: ${tabName}`).toBeVisible();
        await this.productTabByName(tabName).click();
    }

    private async fillNumberField(fieldId: string, value: string, fieldName: string) {
        await this.productFieldById(fieldId).clear();
        await this.productFieldById(fieldId).fill(value);
        await expect(this.productFieldById(fieldId), `${fieldName} value mismatch`).toHaveValue(value);
    }

    private async validateProductAPIAndPopup(endpoint: string, statusCode: number, successMessage: Locator | null, apiName: string) {
        const responsePromise = this.page.waitForResponse(`**/salesEnquiryForm/${endpoint}`);
        if (await this.saveButton.isVisible()) {
            await this.saveButton.click();
        } else {
            await this.page.getByRole('button', { name: 'Submit' }).click();
        }
        const response = await responsePromise;
        expect(response.status(), `${apiName} API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        if (successMessage) {
            await expect(successMessage, `${apiName} success popup message is not displayed`).toBeVisible();
        }
        console.log(`${apiName} created successfully`);
        console.log(`Verified ${apiName} API with status code:`, response.status());
    }
    @step()
    async validateCreateSignageAPI(statusCode: number) {
        await this.validateProductAPIAndPopup('upsertSignageIlluminated', statusCode, null, 'Signage');
    }
    @step()
    async validateCreateAtmProductAPI(statusCode: number) {
        await this.validateProductAPIAndPopup('upsertAtmProducts', statusCode, this.atmProductsSuccessMessage, 'ATM products');
    }
    @step()
    async validateCreateVinylGraphicAPI(statusCode: number) {
        await this.validateProductAPIAndPopup('upsertVinylGraphic', statusCode, this.vinylGraphicSuccessMessage, 'Vinyl graphic');
    }
    @step()
    async validateCreateTradingProductAPI(statusCode: number) {
        await this.validateProductAPIAndPopup('upsertTradingProducts', statusCode, this.tradingSuccessMessage, 'Trading products');
    }
    @step()
    async validateCreatePvcProductAPI(statusCode: number) {
        await this.validateProductAPIAndPopup('upsertPvcProducts', statusCode, this.pvcSuccessMessage, 'PVC products');
    }
    @step()
    async enterAndSaveAllSelectedProductDetails(productNames: string[]) {
        if (productNames.includes('Signage')) {
            await this.enterSignageDetails();
            await this.validateCreateSignageAPI(201);
        }

        if (productNames.includes('Embroidery & Tailoring')) {
            await this.openProductTab('Embroidery & Tailoring');
            await this.enterEmbroidingDetails("Badges", "Pin", "Nylon");
            await this.validateCreateEmbroideryAPI(201);
            await expect(this.embriodSuccessMessage, "Embroidery success message does not match").toHaveText('Embroidery tailoring created successfully');
        }

        if (productNames.includes('ATM Products')) {
            await this.enterAtmProductDetails();
            await this.validateCreateAtmProductAPI(201);
        }

        if (productNames.includes('Acrylic Products')) {
            await this.openProductTab('Acrylic Products');
            await this.enterAcrylicProductDetails("Acrylic", "LED Strip", "Bolts", '5', '5', '5');
            await this.validateCreateAcrylicProductAPI(201);
            await expect(this.acrylicSuccessMessage, "Acrylic products success message does not match").toHaveText('Acrylic products created successfully');
        }

        if (productNames.includes('Vinyl Graphic')) {
            await this.enterVinylGraphicDetails();
            await this.validateCreateVinylGraphicAPI(201);
        }

        if (productNames.includes('Trading')) {
            await this.enterTradingDetails();
            await this.validateCreateTradingProductAPI(201);
        }

        if (productNames.includes('PVC Products')) {
            await this.enterPvcProductDetails();
            await this.validateCreatePvcProductAPI(201);
        }
    }


    private async selectFromDropdown(dropdownName: string, value: string) {
        await this.dropDown(dropdownName).clear();
        await this.dropDown(dropdownName).fill(value);
        await this.dropDownOption(value).click();
    }
    @step()
    async selectOptionFromCheckbox(dropdownName: string, value: string) {
        await this.dropDown(dropdownName).click();
        await this.uncheckAllCheckbox();
        await this.optionCheckBox(value).click();
        await this.tapAway.click();
    }
    @step()
    async enterSignageDetails() {
        await this.openProductTab('Signage');
        await this.selectFromDropdown('Illuminated', 'Back Lit');
        await this.selectOptionFromCheckbox('Material & Finish', 'Day & Night Vinyl');
        await this.selectFromDropdown('Illumination Options', 'Led Module');
        await this.selectOptionFromCheckbox('Mounting Options', 'Bolts');
        await this.selectOptionFromCheckbox('Aluminium', 'Painted');
        await this.selectOptionFromCheckbox('Stainless Steel', 'Mirror Finish');
        await this.selectOptionFromCheckbox('Acrylic', 'Plain');
        await this.selectOptionFromCheckbox('Titanium Steel', 'Satin Gold');
        await this.selectFromDropdown('Brass', 'Gold Plated');
        await this.selectOptionFromCheckbox('Wood', 'Painted');
    }
    @step()
    async enterAtmProductDetails() {
        await this.openProductTab('ATM Products');
        await this.selectFromDropdown('Aluminium', 'Painted');
        await this.selectOptionFromCheckbox('Stainless Steel', 'Mirror Finish');
        await this.selectOptionFromCheckbox('Acrylic', 'Colored Acrylic');
        await this.selectOptionFromCheckbox('Titanium Steel', 'Gold Mirror');
        await this.selectOptionFromCheckbox('Brass', 'Gold Plated');
        await this.selectFromDropdown('Wood', 'Painted');
        await this.selectOptionFromCheckbox('Copper', 'Brush');
        await this.selectOptionFromCheckbox('Illumination Options', 'Led Module');
        await this.selectOptionFromCheckbox('Mounting Options', 'Bolts');
    }

    @step()
    async enterVinylGraphicDetails() {
        await this.selectOptionFromCheckbox('Vinyl And Graphic Application', 'Vinyl Cut Letters');
        await this.fillNumberField('rollUp', '5', 'Roll Up');
        await this.selectOptionFromCheckbox('Material / Finish', 'Manifestation');
        await this.fillNumberField('popUp', '6', 'Pop Up');
    }
    @step()
    async enterTradingDetails() {
        await this.openProductTab('Trading');
        await this.selectOptionFromCheckbox('Traffic Mirrors', 'Supply Only');
        await this.mirrorSizeField.click();
        await this.uncheckAllCheckbox();
        await this.optionCheckBox('Pole or Wall').click();
        await this.coneSize.fill('750');
        await this.dropDownOption('750 MM').click()
        await this.selectOptionFromCheckbox('Sleeves', 'White');
        await this.bollardSize.fill('750');
        await this.dropDownOption('750 MM').click();
        await this.selectFromDropdown('Solar Trolleys', 'Direction Arrow Board');
        await this.radioButton('Yes').click();
        await this.radioButton('Orange').click();
        await this.radioButton('Plain').click();
    }
    @step()
    async enterPvcProductDetails() {
        await this.openProductTab('PVC Products');
        await this.selectOptionFromCheckbox('Material And Finish', 'Rigid PVC')
        await this.fillNumberField('length', '5', 'PVC Length');
        await this.fillNumberField('width', '6', 'PVC Width');
        await this.fillNumberField('height', '7', 'PVC Height');
    }
}
