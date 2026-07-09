import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { SalesEnquiryData } from "../testData/salesEnquiryData";
import { BOQData } from "../testData/addBoqData";
import { Utils } from "../utils/utils";

export class CostEstimationPage extends BasePage {
    private readonly addEstimationBtn: Locator;
    private readonly viewIcon: Locator;
    private readonly closeButton: Locator;
    public readonly costEstimationTitle: Locator;
    public readonly timeLine: Locator;
    private readonly finishedProductDropdown: Locator;
    private readonly finishedProductOption: Locator;
    private readonly banner: Locator;
    private readonly signCodeTxtBx: Locator;
    private readonly signTypeTxtBx: Locator;
    private readonly signNameTxtBx: Locator;
    private readonly descriptionTxtBx: Locator;
    private readonly sizeTxtBx: Locator;
    private readonly quantityTxtBx: Locator;
    public readonly saveButton: Locator;
    private readonly addBOQBtn: Locator;
    public readonly submitApprovalButton: Locator;
    private readonly generateCostEstimationBtn: Locator;
    private readonly generateBtn: Locator;
    public readonly boqDetailsTitle: Locator;
    private readonly deleteIcon: Locator;
    private readonly deleteBtn: Locator;
    private readonly editIcon: Locator;
    private readonly updateBtn: Locator;
    public readonly addBOMBtn: Locator;
    private readonly warrantyValueTxtBx: Locator;
    private readonly addItemBtn: Locator;
    private readonly consumableTxtBx: Locator;
    private readonly studioEditIcon: Locator;
    private readonly estimationHours: Locator;
    private readonly machineHours: Locator;
    private readonly otHours: Locator;
    private readonly updateItemBtn: Locator;
    private readonly editMetalIcon: Locator;
    private readonly editElectricalIcon: Locator;
    private readonly editCuttingIcon: Locator;
    private readonly variationTxtBx: Locator;
    private readonly variationCell: Locator;
    public readonly variationValueCell: Locator;
    private readonly totalValueCell: Locator;
    private readonly summaryTotalUnitCell: Locator;
    private readonly summaryTotalBDCell: Locator;
    private readonly labourSellingCell: Locator;
    private readonly bdSellingCell: Locator;
    private readonly summarySubmitBtn: Locator;
    private readonly m3TxtBx: Locator;
    private readonly trailerTxtBx: Locator;
    private readonly volumeTxtBx: Locator;
    private readonly packingHeightTxtBx: Locator;
    private readonly packingLengthTxtBx: Locator;
    private readonly packingWidthTxtBx: Locator;
    private readonly noOfBoxTxtBx: Locator;
    private readonly saveAndNextBtn: Locator;
    private readonly submitForApprovalBtn: Locator;
    private readonly sampleTxtBx: Locator;
    private readonly electricalTxtBx: Locator;
    private readonly digitalPrintingTxtBx: Locator;
    private readonly wallPaintingTxtBx: Locator;
    private readonly installationTxtBx: Locator;
    private readonly stainlessSteelWorksTxtBx: Locator;
    private readonly galvanizingTxtBx: Locator;
    private readonly platingTxtBx: Locator;
    private readonly rentalItemsTxtBx: Locator;
    private readonly corianTxtBx: Locator;
    private readonly waterproofingTxtBx: Locator;
    private readonly glassTxtBx: Locator;
    private readonly concreteFootingTxtBx: Locator;
    private readonly scaffoldingTxtBx: Locator;
    private readonly labChargesTxtBx: Locator;
    private readonly designChargesTxtBx: Locator;
    private readonly cradleTxtBx: Locator;
    private readonly craneTxtBx: Locator;
    private readonly hiabTxtBx: Locator;
    private readonly trailorTxtBx: Locator;
    private readonly miscellaneousCostTxtBx: Locator;
    private readonly editButton: Locator;
    private readonly tickIcon: Locator;
    private readonly nextButton: Locator;
    private readonly totalHoursTxtBx: Locator;
    private readonly addLabourBtn: Locator;
    private readonly hourlyRateTxtBx: Locator;
    private readonly machineHoursTxtBx: Locator;
    private readonly otHoursTxtBx: Locator;
    private readonly estimationHoursTxtBx: Locator;
    public readonly totalLabourCostValue: Locator;
    public readonly summaryVariationValue: Locator;
    public readonly summaryVariationCell: Locator;
    private readonly packingStatus: Locator;
    private readonly vatTxtBx: Locator;
    private readonly withHoldTxtBx: Locator;
    private readonly discountTxtBx: Locator;
    private readonly yesButton: Locator;
    private readonly createNewBOQBtn: Locator;
    private readonly submitToEstimatorBtn: Locator;
    private readonly submitToEstimatorMessage: Locator;
    private readonly confirmButton: Locator;
    private readonly backArrowIcon: Locator;
    private readonly viewAttachmentsButton: Locator;

    // Dynamic locators
    private readonly ppjoBanner: (name: string) => Locator;
    private readonly costingStatus: (name: string) => Locator;
    private readonly deleteCostingIcon: (name: string) => Locator;
    private readonly generateCostingBtn: (name: string) => Locator;
    private readonly dropDown: (name: string) => Locator;
    private readonly dropDownOption: (name: string) => Locator;
    private readonly deliveryPeriod: Locator;
    private readonly warrantyPeriod: Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.addEstimationBtn = this.page.getByRole('button', { name: 'Add Estimation Details' });
        this.viewIcon = this.page.locator('//img[@alt="view"]').or(this.page.getByRole('button', { name: 'View' }));
        this.closeButton = this.page.getByRole('button', { name: 'close' }).first();
        this.costEstimationTitle = this.page.getByRole('heading');
        this.timeLine = this.page.locator('//span[@class="text-[12px] tabular-nums"]');
        this.finishedProductDropdown = this.page.getByRole('combobox', { name: 'Finished product*' });
        this.finishedProductOption = this.page.getByRole('option', { name: 'Apple ball' });
        this.banner = this.page.getByRole('banner');
        this.signCodeTxtBx = this.page.getByRole('textbox', { name: 'Sign Code / BOQ*' });
        this.signTypeTxtBx = this.page.getByRole('textbox', { name: 'Sign Type*' });
        this.signNameTxtBx = this.page.getByRole('textbox', { name: 'Sign Name*' });
        this.descriptionTxtBx = this.page.getByRole('textbox', { name: 'Description*' });
        this.sizeTxtBx = this.page.getByRole('textbox', { name: 'Size*' });
        this.quantityTxtBx = this.page.getByRole('spinbutton', { name: 'Quantity' });
        this.saveButton = this.page.getByRole('button', { name: 'Save' });
        this.addBOQBtn = this.page.getByRole('button', { name: 'Add New BOQ plus_icon' });
        this.submitApprovalButton = this.page.getByRole('button', { name: 'Submit for Approval' });
        this.generateCostEstimationBtn = this.page.getByRole('button', { name: 'Generate Estimation' }).first();
        this.generateBtn = this.page.getByRole('button', { name: 'Generate', exact: true });
        this.boqDetailsTitle = this.page.locator('//div[text()="BOQ Details"]');
        this.deleteIcon = this.page.getByRole('button', { name: 'Delete Icon' }).first();
        this.deleteBtn = this.page.getByRole('button', { name: 'Delete', exact: true });
        this.editIcon = this.page.getByRole('button', { name: 'Edit Icon' }).first();
        this.updateBtn = this.page.getByRole('button', { name: 'Update' });
        this.addBOMBtn = this.page.getByRole('button', { name: 'Add BOM Add BOM' });
        this.warrantyValueTxtBx = this.page.getByRole('spinbutton', { name: 'Warranty Value*' });
        this.addItemBtn = this.page.getByRole('button', { name: 'Add Item' });
        this.consumableTxtBx = this.page.getByRole('spinbutton', { name: 'Consumables %' });
        // this.studioEditIcon = this.page.getByRole('row', { name: 'Design Studio' }).locator('img').nth(1);
        this.studioEditIcon = this.page.locator('//div[contains(text(),"Design Studio")]//parent::td//following-sibling::td[@data-app-table-col="11"]//img[contains(@src,"edit")]');
        this.estimationHours = this.page.getByRole('spinbutton', { name: 'Est Hours*' });
        this.machineHours = this.page.getByRole('spinbutton', { name: 'Machine Utilization Hours' });
        this.otHours = this.page.getByRole('spinbutton', { name: 'OT Hours %' });
        this.updateItemBtn = this.page.getByRole('button', { name: 'Update item' });
        // this.editMetalIcon = this.page.getByRole('row', { name: 'Metal' }).locator('img').nth(1);
        this.editMetalIcon = this.page.locator('//div[contains(text(),"Metal")]//parent::td//following-sibling::td[@data-app-table-col="11"]//img[contains(@src,"edit")]');
        // this.editElectricalIcon = this.page.getByRole('row', { name: 'Electrical Dept' }).locator('img').nth(1);
        this.editElectricalIcon = this.page.locator('//div[contains(text(),"Electrical")]//parent::td//following-sibling::td[@data-app-table-col="11"]//img[contains(@src,"edit")]');
        // this.editCuttingIcon = this.page.getByRole('row', { name: 'Cutting Testing' }).locator('img').nth(1);
        this.editCuttingIcon = this.page.locator('//div[contains(text(),"Cutting")]//parent::td//following-sibling::td[@data-app-table-col="11"]//img[contains(@src,"edit")]');
        this.variationTxtBx = this.page.getByRole('spinbutton', { name: 'Variation (%)' });
        this.variationCell = this.page.locator('//tr[2]/td/div[contains(text(),"VARIATION")]');
        this.variationValueCell = this.page.locator('//tr[2]/td[2]/div');
        this.totalValueCell = this.page.locator('(//tr[4]/td/div)[2]');
        this.summaryTotalUnitCell = this.page.locator('(//tr//td[2])[5]');
        this.summaryTotalBDCell = this.page.locator('(//tr//td[2])[7]');
        this.labourSellingCell = this.page.locator('(//tr//td[5])[1]');
        this.bdSellingCell = this.page.locator('(//tr//td[5])[3]');
        this.summarySubmitBtn = this.page.getByRole('button', { name: 'Save & Submit' });
        this.m3TxtBx = this.page.getByRole('spinbutton', { name: 'M³', exact: true });
        this.trailerTxtBx = this.page.getByRole('spinbutton', { name: 'No of Trailer' });
        this.volumeTxtBx = this.page.getByRole('spinbutton', { name: 'T. Volume M³' });
        this.packingLengthTxtBx = this.page.getByRole('spinbutton', { name: 'Length*' });
        this.packingWidthTxtBx = this.page.getByRole('spinbutton', { name: 'Width*' });
        this.packingHeightTxtBx = this.page.getByRole('spinbutton', { name: 'Height*' });
        this.noOfBoxTxtBx = this.page.getByRole('spinbutton', { name: 'No of Box*' });
        this.saveAndNextBtn = this.page.getByRole('button', { name: 'Save & Next' });
        this.submitForApprovalBtn = this.page.getByRole('button', { name: 'Submit for Approval' });
        this.sampleTxtBx = this.page.getByRole('spinbutton', { name: 'Sample Cost' });
        this.electricalTxtBx = this.page.locator('input[id*="electrical"]');
        this.digitalPrintingTxtBx = this.page.locator('input[id*="digitalPrinting"]');
        this.wallPaintingTxtBx = this.page.locator('input[id*="wallPainting"]');
        this.installationTxtBx = this.page.locator('input[id*="installation"]');
        this.stainlessSteelWorksTxtBx = this.page.locator('input[id*="stainlessSteelWorks"]');
        this.galvanizingTxtBx = this.page.locator('input[id*="galvanizing"]');
        this.platingTxtBx = this.page.locator('input[id*="plating"]');
        this.rentalItemsTxtBx = this.page.locator('input[id*="rentalItems"]');
        this.corianTxtBx = this.page.locator('input[id*="corian"]');
        this.waterproofingTxtBx = this.page.locator('input[id*="waterproofing"]');
        this.glassTxtBx = this.page.locator('input[id*="glass"]');
        this.concreteFootingTxtBx = this.page.locator('input[id*="concreteFooting"]');
        this.scaffoldingTxtBx = this.page.locator('input[id*="scaffolding"]');
        this.labChargesTxtBx = this.page.locator('input[id*="labCharges"]');
        this.designChargesTxtBx = this.page.locator('input[id*="designCharges"]');
        this.cradleTxtBx = this.page.locator('input[id*="cradle"]');
        this.craneTxtBx = this.page.locator('input[id*="crane"]');
        this.hiabTxtBx = this.page.locator('input[id*="hiab"]');
        this.trailorTxtBx = this.page.locator('input[id*="trailor"]');
        this.miscellaneousCostTxtBx = this.page.locator('input[id*="miscillaneousCost"]');
        this.editButton = this.page.getByRole('button', { name: 'Edit' });
        this.tickIcon = this.page.getByRole('table').getByRole('button', { name: 'Save' });
        this.nextButton = this.page.getByRole('button', { name: 'Next' });
        this.totalHoursTxtBx = this.page.getByRole('spinbutton', { name: 'Total Hours' });
        this.addLabourBtn = this.page.getByRole('button', { name: 'Add Labour Add Labour' });
        this.hourlyRateTxtBx = this.page.getByRole('spinbutton', { name: 'Hourly Rate' });
        this.machineHoursTxtBx = this.page.locator('input[id*="machineUtilizationHours"]');
        this.estimationHoursTxtBx = this.page.locator('input[id*="estHours"]');
        this.otHoursTxtBx = this.page.locator('input[id*="otHoursPercentage"]');
        this.totalLabourCostValue = this.page.locator('(//td[2])[1]');
        this.summaryVariationValue = this.page.locator('//tr[2]/td[2]');
        this.summaryVariationCell = this.page.locator('//tr[2]/td[contains(text(),"VARIATION")]');
        this.packingStatus = this.page.locator('//tr[1]/td[3]/div/span');
        this.vatTxtBx = this.page.locator('#vatPercentage');
        this.withHoldTxtBx = this.page.locator('#withHoldingTaxPercentage');
        this.discountTxtBx = this.page.locator('#discountPercentage');
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.createNewBOQBtn = this.page.getByRole('button', { name: 'Create New BOQ' });
        this.submitToEstimatorBtn = this.page.getByRole('button', { name: 'Resubmit to Estimator' });
        this.submitToEstimatorMessage = this.page.locator('//p[contains(text(),"Are you")]');
        this.confirmButton = this.page.getByRole('button', { name: 'Confirm' });
        this.backArrowIcon = this.page.getByRole('img', { name: 'back arrow' });
        this.viewAttachmentsButton = this.page.getByRole('button', { name: 'view View Attachment' });
        this.deliveryPeriod = this.page.getByRole('spinbutton', { name: 'Delivery Period*' });
        this.warrantyPeriod = this.page.getByRole('spinbutton', { name: 'Warranty Period*' });

        // Dynamic locators initialization
        this.ppjoBanner = (name: string) => this.page.getByRole('banner').getByText(`${name}`);
        this.costingStatus = (name: string) => this.page.locator(`//div[text()="${name}"]/parent::td/following-sibling::td/div/span`);
        this.deleteCostingIcon = (name: string) => this.page.locator(`//div[text()="${name}"]/parent::td/following-sibling::td[3]/child::div/child::div/child::span/child::img`);
        this.generateCostingBtn = (name: string) => this.page.locator(`//div[text()="${name}"]/parent::td/following-sibling::td[2]/child::div/child::button`);
        this.dropDown = (name: string) => this.page.getByRole('combobox', { name: `${name}` });
        this.dropDownOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
    }
    @step()
    async validateEstimationDetailsTable() {
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(5000);
        const ppjoTable = await this.page.locator('.w-full.rounded-\\[6px\\]').or(this.page.locator('//div[contains(@class,"w-full rounded")]')).innerText();
        expect(ppjoTable, "PPJO table does not contain Artwork").toContain('Artwork');
        expect(ppjoTable, "PPJO table does not contain AutoCAD").toContain('AutoCAD');
        expect(ppjoTable, "PPJO table does not contain Site-Visit").toContain('Site-Visit');
        expect(ppjoTable, "PPJO table does not contain Estimation").toContain('Estimation');
        expect(ppjoTable, "PPJO table does not contain Artwork Quantity").toContain('11');
        expect(ppjoTable, "PPJO table does not contain AutoCAD Quantity").toContain('12');
        expect(ppjoTable, "PPJO table does not contain Procurement Quantity").toContain('13');
        expect(ppjoTable, "PPJO table does not contain Estimation Quantity").toContain('14');
    }
    @step()
    async validateCustomerDetails(data: SalesEnquiryData, enquiryId: string) {
        await this.page.waitForTimeout(2000);
        const detailsText = await this.page.locator('.p-4').first().innerText();

        expect(detailsText, `View cost estimation details do not contain enquiry id: ${enquiryId}`).toContain(enquiryId);
        console.log(`✓ Customer Name displayed: ${enquiryId}`);

        // Validate key details are visible
        expect(detailsText, `View cost estimation details do not contain customer name: ${data.customerName}`).toContain(data.customerName);
        console.log(`✓ Customer Name displayed: ${data.customerName}`);

        // Validate project name if not empty
        expect(detailsText, `View cost estimation details do not contain project name: ${data.projectName}`).toContain(data.projectName);
        console.log(`✓ Project Name displayed: ${data.projectName}`);
        // }

        // Validate country
        expect(detailsText, `View cost estimation details do not contain country: ${data.country}`).toContain(data.country);
        console.log(`✓ Country displayed: ${data.country}`);

        // Validate state
        expect(detailsText, `View cost estimation details do not contain state: ${data.state}`).toContain(data.state);
        console.log(`✓ State displayed: ${data.state}`);

        // Validate city
        expect(detailsText, `View cost estimation details do not contain city: ${data.city}`).toContain(data.city);
        console.log(`✓ City displayed: ${data.city}`);

        // const currencyName = Utils.getCurrencyName(data.currency);
        // expect(detailsText, `View cost estimation details do not contain currency: ${currencyName}`).toContain(currencyName);
        // console.log(`✓ Currency displayed: ${currencyName}`);

        // Validate payment terms
        expect(detailsText, `View cost estimation details do not contain payment terms: ${data.paymentTerms}`).toContain(data.paymentTerms);
        console.log(`✓ Payment Terms displayed: ${data.paymentTerms}`);

        expect(detailsText, `View cost estimation details do not contain mobile number: ${data.mobileNumber1}`).toContain(data.mobileNumber1);
        console.log(`✓ Mobile Number displayed: ${data.mobileNumber1}`);

        expect(detailsText, `View cost estimation details do not contain email: ${data.email1}`).toContain(data.email1);
        console.log(`✓ Email displayed: ${data.email1}`);

        console.log('All validation checks passed for view cost estimation details');
    }
    @step()
    private async validateViewAttachDetails(documentName: string, quantity: string, description: string) {
        await this.page.waitForTimeout(1000);
        const detailText = await this.page.locator('(//main)[2]').innerText();
        expect(detailText, `Attachment details do not contain document name: ${documentName}`).toContain(documentName);
        expect(this.page.getByRole('spinbutton', { name: 'Quantity' }), `Attachment quantity value mismatch. Expected: ${quantity}`).toHaveValue(quantity);
        expect(detailText, `Attachment details do not contain description: ${description}`).toContain(description);
    }
    @step()
    async clickViewButton(count: number) {
        const target = this.viewIcon.nth(count);

        // Keep scrolling until the nth button appears in DOM
        await expect(async () => {
            await this.page.mouse.wheel(0, 400);
            await target.waitFor({ state: 'visible', timeout: 2_000 });
        }, `View button at index ${count} was not visible after scrolling`).toPass({ timeout: 15_000 });
        await this.viewIcon.nth(count).click();
        // await this.page.waitForTimeout(500);
    }
    @step()
    async validateArtworkAttachmentDetails(documentName: string, quantity: string, description: string) {
        await this.clickViewButton(0);
        await expect(this.ppjoBanner('Artwork'), "Artwork PPJO banner text does not match").toContainText('Artwork');
        await this.page.waitForTimeout(500);
        await this.validateViewAttachDetails(documentName, quantity, description);
        await this.closeButton.click();
        await this.page.waitForTimeout(500);
    }
    @step()
    async validateSampleAttachmentDetails(documentName: string, quantity: string, description: string) {
        await this.clickViewButton(0);
        await expect(this.ppjoBanner('Sample'), "Sample PPJO banner text does not match").toContainText('Sample');
        await this.page.waitForTimeout(500);
        await this.validateViewAttachDetails(documentName, quantity, description);
        await this.closeButton.click();
        await this.page.waitForTimeout(500);
    }
    @step()
    async validateAutoCADAttachmentDetails(documentName: string, quantity: string, description: string) {
        await this.clickViewButton(1);
        await expect(this.ppjoBanner('AutoCAD'), "AutoCAD PPJO banner text does not match").toContainText('AutoCAD');
        await this.page.waitForTimeout(500);
        await this.validateViewAttachDetails(documentName, quantity, description);
        await this.closeButton.click();
        await this.page.waitForTimeout(500);
    }
    @step()
    async validateEstimationAttachmentDetails(documentName: string, quantity: string, description: string) {
        await this.clickViewButton(3);
        // await this.clickViewButton(2);
        await expect(this.ppjoBanner('Estimation'), "Estimation PPJO banner text does not match").toContainText('Estimation');
        await this.page.waitForTimeout(500);
        await this.validateViewAttachDetails(documentName, quantity, description);
        await this.closeButton.click();
        await this.page.waitForTimeout(500);
    }
    @step()
    async validateProcurementAttachmentDetails(documentName: string, quantity: string, description: string) {
        await this.clickViewButton(4);
        // await this.clickViewButton(3);
        await expect(this.ppjoBanner('Procurement'), "Procurement PPJO banner text does not match").toContainText('Procurement');
        await this.page.waitForTimeout(500);
        await this.validateViewAttachDetails(documentName, quantity, description);
        await this.page.waitForTimeout(500);
        await this.closeButton.click();
    }
    @step()
    async clickAddEstimation() {
        await this.addEstimationBtn.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    @step()
    async addBOQ(boqData: BOQData) {
        await this.addBOQBtn.click();
        await this.createNewBOQBtn.click();
        await expect(this.banner, "Add BOQ banner text does not match").toContainText('Add BOQ');
        await this.finishedProductDropdown.fill(boqData.finishedProduct);
        await this.finishedProductOption.click();
        await this.signCodeTxtBx.fill(boqData.signCode);
        await this.signTypeTxtBx.fill(boqData.signType);
        await this.signNameTxtBx.fill(boqData.signName);
        await this.descriptionTxtBx.fill(boqData.description);
        await this.sizeTxtBx.fill(boqData.size);
        await this.page.mouse.wheel(0, 500);
        await this.quantityTxtBx.fill(boqData.quantity);
        await this.selectFromDropdown('Delivery Type*', boqData.deliveryType);
        await this.deliveryPeriod.fill(boqData.deliveryPeriod);
        await this.selectFromDropdown('Warranty Type*', boqData.warrantyType);
        await this.warrantyPeriod.fill(boqData.warrantyPeriod);
    }
    @step()
    async validateAddBOQAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/boq/createBoq');
        await this.saveButton.click();
        const response = await responsePromise;
        expect(response.status(), `Add BOQ API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('BOQ added successfully');
        console.log('Verified BOQ API with status code:', response.status());
    }
    @step()
    async validateBOQDetailsTable(boqData: BOQData) {
        await this.page.waitForTimeout(1000);
        const boqDetails = await this.page.locator('(//tr)[2]').innerText();
        expect(boqDetails, `BOQ details table does not contain finished product: ${boqData.finishedProduct}`).toContain(boqData.finishedProduct);
        expect(boqDetails, `BOQ details table does not contain sign code: ${boqData.signCode}`).toContain(boqData.signCode);
        expect(boqDetails, `BOQ details table does not contain sign type: ${boqData.signType}`).toContain(boqData.signType);
        expect(boqDetails, `BOQ details table does not contain sign name: ${boqData.signName}`).toContain(boqData.signName);
        expect(boqDetails, `BOQ details table does not contain description: ${boqData.description}`).toContain(boqData.description);
        expect(boqDetails, `BOQ details table does not contain size: ${boqData.size}`).toContain(boqData.size);
        expect(boqDetails, `BOQ details table does not contain quantity: ${boqData.quantity}`).toContain(boqData.quantity);
    }
    @step()
    async clickGenerateCostEstimationAndValidateBOQ_API(statusCode: number) {
        await this.scrollUntilElementVisibleAndClick(this.generateCostEstimationBtn);
        const responsePromise = this.page.waitForResponse('**/bom/getAllBomById/**');
        await this.generateBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Add BOQ API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
    }
    @step()
    async validateBOQDetails(boqData: BOQData) {
        await this.page.waitForTimeout(500);
        const boqDetails = await this.page.locator('div.grid-cols-2').innerText();
        expect(boqDetails, `BOQ details do not contain sign code: ${boqData.signCode}`).toContain(boqData.signCode);
        expect(boqDetails, `BOQ details do not contain sign type: ${boqData.signType}`).toContain(boqData.signType);
        expect(boqDetails, `BOQ details do not contain quantity: ${boqData.quantity}`).toContain(boqData.quantity);
        expect(boqDetails, `BOQ details do not contain description: ${boqData.description}`).toContain(boqData.description);
        expect(boqDetails, `BOQ details do not contain size: ${boqData.size}`).toContain(boqData.size);
    }
    @step()
    async clickDeleteIcon() {
        await this.scrollUntilElementVisibleAndClick(this.deleteIcon);
    }
    @step()
    async validateDeleteBOQAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/boq/deleteBoqById?**');
        await this.deleteBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Delete BOQ API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('BOQ deleted successfully');
        console.log('Verified BOQ API with status code:', response.status());
    }
    @step()
    async editBOQ(boqData: BOQData) {
        await this.editIcon.click();
        await expect(this.banner, "Edit BOQ banner text does not match").toContainText('Edit BOQ');
        await expect(this.finishedProductDropdown, `Finished product value mismatch in edit BOQ. Expected: ${boqData.finishedProduct}`).toHaveValue(boqData.finishedProduct);
        await this.finishedProductDropdown.fill(boqData.finishedProduct);
        await this.finishedProductOption.click();
        await expect(this.signCodeTxtBx, `Sign code value mismatch in edit BOQ. Expected: ${boqData.signCode}`).toHaveValue(boqData.signCode);
        await this.signCodeTxtBx.fill(boqData.signCode);
        await expect(this.signTypeTxtBx, `Sign type value mismatch in edit BOQ. Expected: ${boqData.signType}`).toHaveValue(boqData.signType);
        await this.signTypeTxtBx.fill(boqData.signType);
        await expect(this.signNameTxtBx, `Sign name value mismatch in edit BOQ. Expected: ${boqData.signName}`).toHaveValue(boqData.signName);
        await this.signNameTxtBx.fill(boqData.signName);
        await expect(this.descriptionTxtBx, `Description value mismatch in edit BOQ. Expected: ${boqData.description}`).toHaveValue(boqData.description);
        await this.descriptionTxtBx.fill(boqData.description);
        await expect(this.sizeTxtBx, `Size value mismatch in edit BOQ. Expected: ${boqData.size}`).toHaveValue(boqData.size);
        await this.sizeTxtBx.fill(boqData.size);
        await expect(this.quantityTxtBx, `Quantity value mismatch in edit BOQ. Expected: ${boqData.quantity}`).toHaveValue(boqData.quantity);
        await this.quantityTxtBx.fill(boqData.quantity);
    }

    private async selectFromDropdown(dropdownName: string, value: string) {
        await this.dropDown(dropdownName).clear();
        await this.dropDown(dropdownName).fill(value);
        await this.dropDownOption(value).click();
    }
    @step()
    async validateEditBOQAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/boq/updateBoqById');
        await this.updateBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Update BOQ API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('BOQ updated successfully');
        console.log('Verified BOQ API with status code:', response.status());
        await expect(this.page.getByRole('paragraph'), 'BOQ success message does not match').toContainText('BOQ updated successfully');
    }
    @step()
    async addConsumables(consumables: string) {
        await this.consumableTxtBx.fill(consumables);
    }
    @step()
    async validateConsumablesAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/bom/updateConsumableByEstimationDetailId');
        await this.saveButton.click();
        const response = await responsePromise;
        expect(response.status(), `Add Consumables API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Consumables added successfully');
        console.log('Verified Consumables API with status code:', response.status());
    }

    private async labourAndCostingDetails(estimationHours: string, machineHours: string, otHours: string, warrantyValue: string) {
        await expect(this.banner, "Labour and costing banner text does not match").toContainText('(Labour - Time) & Cost');
        await this.page.waitForTimeout(500);
        await this.otHours.fill(otHours);
        await this.estimationHours.fill(estimationHours);
        await this.machineHours.fill(machineHours);
        await this.selectFromDropdown('Warranty Type*', 'Percentage');
        await this.warrantyValueTxtBx.fill(warrantyValue);
    }
    @step()
    async validateLabourAndCostingAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/bol/updateEstimationBolById');
        await this.updateItemBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Edit Labour and Costing API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Labour and Costing updated successfully');
        console.log('Verified Labour and Costing API with status code:', response.status());
    }
    @step()
    async editDesignStudio(estimationHours: string, machineHours: string, otHours: string, warrantyValue: string) {
        await this.studioEditIcon.click({ force: true });
        await this.labourAndCostingDetails(estimationHours, machineHours, otHours, warrantyValue);
    }
    @step()
    async editMetalFabrication(estimationHours: string, machineHours: string, otHours: string, warrantyValue: string) {
        await this.editMetalIcon.click({ force: true });
        await this.labourAndCostingDetails(estimationHours, machineHours, otHours, warrantyValue);
    }
    @step()
    async editElectrical(estimationHours: string, machineHours: string, otHours: string, warrantyValue: string) {
        await this.editElectricalIcon.click({ force: true });
        await this.labourAndCostingDetails(estimationHours, machineHours, otHours, warrantyValue);
    }
    @step()
    async editCutting(estimationHours: string, machineHours: string, otHours: string, warrantyValue: string) {
        await this.editCuttingIcon.click({ force: true });
        await this.labourAndCostingDetails(estimationHours, machineHours, otHours, warrantyValue);
    }
    @step()
    async addBOM(material: string, quantity: string, warrantyValue: string) {
        await this.addBOMBtn.click();
        await this.selectFromDropdown('Material*', material);
        await this.quantityTxtBx.fill(quantity);
        await this.selectFromDropdown('Warranty Type*', 'Percentage');
        await this.warrantyValueTxtBx.fill(warrantyValue);
    }
    @step()
    async validateAddBOM_API(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/bom/createEstimationBom');
        await this.addItemBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Add BOM API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('BOM added successfully');
        console.log('Verified BOM API with status code:', response.status());
    }
    @step()
    async enterVariation(variation: string) {
        await this.variationTxtBx.fill(variation);
        expect(await this.variationCell.innerText(), 'Variation cell is not updated').toBe(`VARIATION (${variation}%)`);
    }
    @step()
    async validateSummaryTable() {
        const totalValue = await this.totalValueCell.innerText();
        expect(this.summaryTotalUnitCell, `Summary total unit value mismatch. Expected: ${totalValue}`).toHaveText(totalValue);
        expect(this.summaryTotalBDCell, `Summary total BD value mismatch. Expected: ${totalValue}`).toHaveText(totalValue);
        expect(this.labourSellingCell, `Labour selling value mismatch. Expected: ${totalValue}`).toHaveText(totalValue);
        expect(this.bdSellingCell, `BD selling value mismatch. Expected: ${totalValue}`).toHaveText(totalValue);
    }
    @step()
    async submitSummaryAndValidateCreateSummaryAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/summary/createSummary');
        await this.summarySubmitBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Create Summary API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Summary created successfully');
        console.log('Verified Summary API with status code:', response.status());
    }
    @step()
    async generatePackingCost() {
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(3000);
        await expect(this.costingStatus('Packing'), 'Packing status does not match').toHaveText('Initiate');
        // await expect(this.deleteCostingIcon('Packing')).toBeDisabled();
        await this.generateCostingBtn('Packing').click();
        await expect(this.m3TxtBx, "M3 value should be 0.000 before packing dimensions are entered").toHaveValue('0.000');
        await expect(this.trailerTxtBx, "Trailer value should be 0.000 before packing dimensions are entered").toHaveValue('0.000');
        await expect(this.volumeTxtBx, "Volume value should be 0.000 before packing dimensions are entered").toHaveValue('0.000');
        await expect
            .poll(async () => {
                await this.packingLengthTxtBx.fill('3');
                return await this.packingLengthTxtBx.inputValue();
            })
            .toBe('3');
        await expect
            .poll(async () => {
                await this.packingHeightTxtBx.fill('3');
                return await this.packingHeightTxtBx.inputValue();
            })
            .toBe('3');
        await expect
            .poll(async () => {
                await this.packingWidthTxtBx.fill('3');
                return await this.packingWidthTxtBx.inputValue();
            })
            .toBe('3');
        await expect
            .poll(async () => {
                await this.noOfBoxTxtBx.fill('3');
                return await this.noOfBoxTxtBx.inputValue();
            })
            .toBe('3');
        await expect(this.m3TxtBx, "M3 value was not updated after packing dimensions were entered").not.toHaveValue('0.000');
        await expect(this.trailerTxtBx, "Trailer value was not updated after packing dimensions were entered").not.toHaveValue('0.000');
        await expect(this.volumeTxtBx, "Volume value was not updated after packing dimensions were entered").not.toHaveValue('0.000');
    }
    @step()
    async validatePackingCostAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/packing/createPacking');
        await this.saveAndNextBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Packing API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Packing created successfully');
        console.log('Verified Packing API with status code:', response.status());
    }
    @step()
    async addPackingBOM(material: string, quantity: string) {
        await this.addBOMBtn.click();
        await this.selectFromDropdown('Material*', material);
        await this.quantityTxtBx.fill(quantity);
    }
    @step()
    async validateBOQdetailsInCostDistribution(boqData: BOQData) {
        await this.page.waitForTimeout(2000);
        const boqDetails = await this.page.locator('(//tr)[3]').innerText();
        expect(boqDetails, `Cost distribution BOQ details do not contain sign code: ${boqData.signCode}`).toContain(boqData.signCode);
        expect(boqDetails, `Cost distribution BOQ details do not contain sign type: ${boqData.signType}`).toContain(boqData.signType);
        expect(boqDetails, `Cost distribution BOQ details do not contain sign name: ${boqData.signName}`).toContain(boqData.signName);
        expect(boqDetails, `Cost distribution BOQ details do not contain description: ${boqData.description}`).toContain(boqData.description);
        expect(boqDetails, `Cost distribution BOQ details do not contain size: ${boqData.size}`).toContain(boqData.size);
        expect(boqDetails, `Cost distribution BOQ details do not contain quantity: ${boqData.quantity}`).toContain(boqData.quantity);
    }
    @step()
    async enterSampleCost(sampleCost: string) {
        await this.page.waitForTimeout(500);
        await this.sampleTxtBx.fill(sampleCost);
        await expect(this.page.locator('//td[@data-app-table-col="31"]'), `Sample cost column value mismatch. Expected: ${sampleCost}.000`).toHaveText(`${sampleCost}.000`);
        await expect(this.page.locator('(//td)[63]'), `Sample cost summary value mismatch. Expected: ${sampleCost}.000`).toHaveText(`${sampleCost}.000`);
    }
    @step()
    async editCostDistributionTable() {
        await this.editButton.click();
        await this.electricalTxtBx.fill('2')
        await this.digitalPrintingTxtBx.fill('3')
        await this.wallPaintingTxtBx.fill('4')
        await this.installationTxtBx.fill('5')
        await this.stainlessSteelWorksTxtBx.fill('1')
        await this.galvanizingTxtBx.fill('2')
        await this.platingTxtBx.fill('4')
        await this.rentalItemsTxtBx.fill('5')
        await this.corianTxtBx.fill('7')
        await this.waterproofingTxtBx.fill('8')
        await this.glassTxtBx.fill('6')
        await this.concreteFootingTxtBx.fill('3')
        await this.scaffoldingTxtBx.fill('1')
        await this.labChargesTxtBx.fill('5')
        await this.designChargesTxtBx.fill('6')
        await this.cradleTxtBx.fill('6')
        await this.craneTxtBx.fill('2')
        await this.hiabTxtBx.fill('7')
        await this.trailorTxtBx.fill('9')
        await this.miscellaneousCostTxtBx.fill('2');
        await this.tickIcon.click();
    }
    @step()
    async validateCreateCostDistributionAPI(statusCode: number) {
        const responsePromise = Promise.race([
            this.page.waitForResponse('**/costDistribution/createCostDistribution'),
            this.page.waitForResponse('**/otherCosting/createOtherCosting')
        ]);
        await this.saveButton.click();
        const response = await responsePromise;
        expect(response.status(), `Create Cost Distribution API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Cost Distribution created successfully');
        console.log('Verified Cost Distribution API with status code:', response.status());
    }
    @step()
    async clickNextButton() {
        await this.nextButton.click();
    }
    @step()
    async addLabour(department: string, otHours: string, estimationHours: string, machineHours: string) {
        await this.addLabourBtn.click();
        await this.page.waitForTimeout(500);
        await expect(this.banner, "Add labour banner text does not match").toContainText('(Labour - Time) & Cost');
        await expect(this.totalHoursTxtBx, "Total hours should be empty before labour hours are entered").toHaveValue('');
        await this.selectFromDropdown('Department*', department);
        await this.otHours.fill(otHours);
        await this.estimationHours.fill(estimationHours);
        await this.machineHours.fill(machineHours);
        await expect(this.totalHoursTxtBx, "Total hours was not calculated after labour hours were entered").not.toHaveValue('');
        await expect(this.hourlyRateTxtBx, "Hourly rate was not populated after department selection").not.toHaveValue('');
        const totalHours = parseFloat(String(await this.totalHoursTxtBx.inputValue())).toString();
        const hourlyRate = parseFloat(String(await this.hourlyRateTxtBx.inputValue())).toLocaleString('en-US');
        return [totalHours, hourlyRate];
    }
    @step()
    async validateAddPackingLabourAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/bol/createEstimationBol');
        await this.addItemBtn.click();
        const response = await responsePromise;
        expect(response.status(), `Add Packing Labour API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Packing Labour added successfully');
        console.log('Verified Packing Labour API with status code:', response.status());
    }
    @step()
    async validateBOLTable(department: string, totalHours: string, hourlyRate: string, machineHours: string, otHours: string, estimationHours: string) {
        await this.page.waitForTimeout(500);
        const bolDetails = await this.page.locator('(//tr)[2]').innerText();
        await expect(this.machineHoursTxtBx, `Machine hours value mismatch in BOL table. Expected: ${machineHours}`).toHaveValue(machineHours);
        await expect(this.otHoursTxtBx, `OT hours value mismatch in BOL table. Expected: ${otHours}`).toHaveValue(otHours);
        await expect(this.estimationHoursTxtBx, `Estimation hours value mismatch in BOL table. Expected: ${estimationHours}`).toHaveValue(estimationHours);
        expect(bolDetails, `BOL table does not contain department: ${department}`).toContain(department);
        expect(bolDetails, `BOL table does not contain total hours: ${totalHours}`).toContain(totalHours);
        expect(bolDetails, `BOL table does not contain hourly rate: ${hourlyRate}`).toContain(hourlyRate);
    }
    @step()
    async getTotalLabourCost() {
        const totalLabourCost = await this.page.locator('//tfoot//td[2]').innerText();
        return parseFloat(totalLabourCost.replace(/,/g, ''));
    }
    @step()
    async enterSummaryVariation(variation: string) {
        await this.variationTxtBx.fill(variation);
        expect(await this.summaryVariationCell.innerText(), 'Variation cell is not updated').toBe(`VARIATION (${variation}%)`);
    }
    @step()
    async validateEnquiryDetailsInSummary(salesEnquiryData: SalesEnquiryData) {
        await this.page.waitForTimeout(500);
        const customerDetails = await this.page.locator('div.p-4').first().innerText();
        expect(customerDetails, `Summary enquiry details do not contain customer name: ${salesEnquiryData.customerName}`).toContain(salesEnquiryData.customerName);
        expect(customerDetails, `Summary enquiry details do not contain project name: ${salesEnquiryData.projectName}`).toContain(salesEnquiryData.projectName);
        // expect(customerDetails, `Summary enquiry details do not contain currency: ${Utils.getCurrencyName(salesEnquiryData.currency)}`).toContain(Utils.getCurrencyName(salesEnquiryData.currency));
        if ((await this.page.locator('div.p-4').first().innerText()).includes(salesEnquiryData.supplyType)) {
            expect(customerDetails, `Summary enquiry details do not contain supply type: ${salesEnquiryData.supplyType}`).toContain(salesEnquiryData.supplyType);
        }
    }
    @step()
    async validateEnquiryDetailsInSummaryTable(BOQDetails: BOQData) {
        await this.page.waitForTimeout(500);
        const SummaryTable = await this.page.locator('//tbody/tr').first().innerText();
        expect(SummaryTable, `Summary table does not contain sign code: ${BOQDetails.signCode}`).toContain(BOQDetails.signCode);
        expect(SummaryTable, `Summary table does not contain sign name: ${BOQDetails.signName}`).toContain(BOQDetails.signName);
        expect(SummaryTable, `Summary table does not contain quantity: ${BOQDetails.quantity}`).toContain(BOQDetails.quantity);
        expect(SummaryTable, `Summary table does not contain description: ${BOQDetails.description}`).toContain(BOQDetails.description);
    }
    @step()
    async editSummary(salesEnquiryData: SalesEnquiryData, vat: string, withHold: string, discount: string) {
        await this.editButton.click();
        if (salesEnquiryData.supplyType === 'Local') {
            await expect(this.page.locator('(//td[@colspan="24"])[1]//following-sibling::td[1]'), "Local summary VAT value should be empty or 0.000 before edit").toHaveText(/^(-|0\.000)$/);
            await this.vatTxtBx.fill(`${vat}`);
            await expect(this.page.locator('(//td[@colspan="24"])[1]//following-sibling::td[1]'), "Local summary VAT value was not updated after edit").not.toHaveText(/^(-|0\.000)$/);
            await expect(this.page.locator('(//td[@colspan="24"])[3]//following-sibling::td[1]'), "Local summary VAT value should be empty or 0.000 before edit").toHaveText(/^(-|0\.000)$/);
            await this.withHoldTxtBx.fill(`${withHold}`);
            await expect(this.page.locator('(//td[@colspan="24"])[3]//following-sibling::td[1]'), "Local summary VAT value was not updated after edit").not.toHaveText(/^(-|0\.000)$/);
            await expect(this.page.locator('//td[@data-app-table-col="27"]//div').first(), "Export summary discount value should be empty or 0.000 before edit").toHaveText(/^(-|0\.000)$/);
            await this.discountTxtBx.fill(`${discount}`);
            await expect(this.page.locator('//td[@data-app-table-col="27"]//div'), "Export summary discount value was not updated after edit").not.toHaveText(/^(-|0\.000)$/);
        } else {
            await expect(this.page.locator('(//td[@colspan="24"])[3]//following-sibling::td[1]'), "Export summary VAT value should be empty or 0.000 before edit").toHaveText(/^(-|0\.000)$/);
            await this.vatTxtBx.fill(`${vat}`);
            await expect(this.page.locator('(//td[@colspan="24"])[3]//following-sibling::td[1]'), "Export summary VAT value was not updated after edit").not.toHaveText(/^(-|0\.000)$/);
            await expect(this.page.locator('//td[@data-app-table-col="29"]//div').first(), "Export summary discount value should be empty or 0.000 before edit").toHaveText(/^(-|0\.000)$/);
            await this.discountTxtBx.fill(`${discount}`);
            await expect(this.page.locator('//td[@data-app-table-col="29"]//div'), "Export summary discount value was not updated after edit").not.toHaveText(/^(-|0\.000)$/);
        }
        await this.page.getByTitle('Save').click();
    }
    @step()
    async validateCalculateSummaryAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/summaryWithIncentive/CalculateSummaryWithIncentive');
        await this.saveButton.click();
        const response = await responsePromise;
        expect(response.status(), `Calculate Summary API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Summary calculated successfully');
        console.log('Verified Calculate Summary API with status code:', response.status());
    }
    @step()
    async savePriceIndicationSlipAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/estimation/updateOptionStatusByVerOptId');
        await this.saveButton.click();
        const response = await responsePromise;
        expect(response.status(), `Save Price Indication Slip API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Price Indication Slip saved successfully');
        console.log('Verified Save Price Indication Slip API with status code:', response.status());
    }
    @step()
    async submitForApprovalAndValidateAPI(statusCode: number) {
        await this.submitApprovalButton.click();
        const responsePromise = this.page.waitForResponse('**/estimation/updateRequestNormalById');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Submit for approval API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Submitted for approval successfully');
        console.log('Verified Submit for approval API with status code:', response.status());
    }
    @step()
    async goBackToEstimationListPage() {
        // Alexandrine Dicki
        await this.backArrowIcon.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.backArrowIcon.click();
    }
    @step()
    async verifyPackingStatus(status: string) {
        const packingStatus = await this.packingStatus.textContent();
        if (packingStatus !== status) {
            await this.page.reload();
            await this.page.waitForLoadState('domcontentloaded');
        }
        await expect(this.packingStatus, `Packing status is not ${status}`).toContainText(status);
    }
    @step()
    async validateSampleDetailsTable() {
        await this.page.waitForTimeout(2000);
        const ppjoTable = await this.page.locator('//div[contains(@class,"w-full rounded")]').innerText();
        expect(ppjoTable, "PPJO table does not contain Artwork").toContain('Sample');
        expect(ppjoTable, "PPJO table does not contain AutoCAD").toContain('17');
    }
    @step()
    async addBOL(estimationHours: string, machineHours: string, otHours: string, warrantyValue: string) {
        await this.addItemBtn.click();
        await this.selectFromDropdown('Department*', 'Design Studio');
        await this.labourAndCostingDetails(estimationHours, machineHours, otHours, warrantyValue);
    }
    @step()
    async validateAddBOLAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/bol/createEstimationBol');
        await this.addItemBtn.nth(1).click();
        const response = await responsePromise;
        expect(response.status(), `Add BOL API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('BOL added successfully');
        console.log('Verified Add BOL API with status code:', response.status());
    }
    @step()
    async resubmitToEstimator() {
        await this.submitToEstimatorBtn.click();
        await expect(this.submitToEstimatorMessage, "Confirmation message not found").toContainText('Are you sure you want to resubmit this estimation to the estimator?');
        await this.confirmButton.click();
    }
    @step()
    async validateRequestTableVisible(title: string, requestType: string) {
        await this.page.waitForTimeout(500);
        const boqDetails = await this.page.locator('(//div[@class="mt-4 bg-white p-4 rounded-md"])[2]').innerText();
        expect(boqDetails).toContain(title);
        expect(boqDetails).toContain(requestType);
        expect(boqDetails).toContain('View Attachment');
    }
    @step()
    async validateViewDiscountAttachments(documentName: string, reason: string) {
        await this.page.keyboard.press('End');
        await this.page.waitForTimeout(250);
        await this.viewAttachmentsButton.click();
        await this.page.waitForTimeout(500);
        await expect(this.ppjoBanner('Attachments'), "Attachments banner not found").toBeVisible();
        const detailText = await this.page.locator('(//main)[2]').innerText();
        expect(detailText, `Attachment details do not contain document name: ${documentName}`).toContain(documentName);
        // expect(detailText, `Attachment details do not contain reason: ${reason}`).toContain(reason);
        await this.closeButton.click();
    }
}