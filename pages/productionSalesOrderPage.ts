import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { BOQData } from "../testData/addBoqData";
import { ProductionData } from "../testData/productionData";

export class ProductionSalesOrderPage extends BasePage {
    public readonly quotationSection: Locator;
    public readonly mainContent: Locator;
    private readonly backArrow: Locator;
    private readonly viewBOMButton: Locator;
    private readonly viewEstimationButton: Locator;
    private readonly expandButton: Locator;
    private readonly productionEngineerDropdown: Locator;
    private readonly productionEngineerOptions: Locator;
    private readonly yesButton: Locator;
    private readonly checkedChecklistInputs: Locator;
    private readonly salesChecklistRemarksTextBox: Locator;
    private readonly productionRemarksTextBox: Locator;
    private readonly deliveryRemarksTextBox: Locator;
    private readonly deliveryCustomerNameTextBox: Locator;
    private readonly deliveryPhoneTextBox: Locator;
    private readonly deliveryLocationTextBox: Locator;
    private readonly installationCategoryTextBox: Locator;
    private readonly inductionDateTextBox: Locator;
    private readonly deliveryDateTextBox: Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.quotationSection = this.page.locator('form div').filter({ hasText: '1. Quotation' }).first();
        this.mainContent = this.page.getByRole('main');
        this.backArrow = this.page.getByRole('img', { name: /back[ _]arrow/ });
        this.viewBOMButton = this.page.getByRole('button', { name: 'View BOM' });
        this.viewEstimationButton = this.page.getByRole('button', { name: 'View Estimation' });
        this.expandButton = this.page.getByRole('button', { name: 'Expand' });
        this.productionEngineerDropdown = this.page.getByRole('button', { name: 'Open' });
        this.productionEngineerOptions = this.page.getByRole('option');
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.checkedChecklistInputs = this.mainContent.locator('input:checked');
        this.salesChecklistRemarksTextBox = this.page.locator('#remarks');
        this.productionRemarksTextBox = this.page.locator('#productionRemarks');
        this.deliveryRemarksTextBox = this.page.locator('#deliveryRemarks');
        this.deliveryCustomerNameTextBox = this.page.locator('#deliveryCustomerName');
        this.deliveryPhoneTextBox = this.page.locator('#deliveryPhone');
        this.deliveryLocationTextBox = this.page.locator('#deliveryLocation');
        this.installationCategoryTextBox = this.page.locator('#installationId');
        this.inductionDateTextBox = this.page.locator('input[name="inductionDate"]');
        this.deliveryDateTextBox = this.page.locator('input[name="deliveryDate"]');
    }

    @step()
    async openPendingSalesOrder(salesOrderId: string) {
        await this.search(salesOrderId);
        await this.clickViewIcon();
    }

    @step()
    async validateSalesOrderDetails(details: string[]) {
        for (const detail of details) {
            await expect(this.mainContent, `Sales order details do not contain: ${detail}`).toContainText(detail);
        }
    }

    // Header of the check list: customer name, sales order number and currency
    @step()
    async validateCheckListHeader(details: string[]) {
        for (const detail of details) {
            await expect(this.mainContent, `Sales order check list header does not contain: ${detail}`).toContainText(detail);
        }
    }

    // The check list is read only here, so every value must match what was submitted while creating the sales order
    @step()
    async validatePrefilledCheckList(data: ProductionData, customerName: string, mobileNumber: string) {
        await expect.poll(
            async () => this.checkedChecklistInputs.evaluateAll(inputs => inputs.map(input => input.closest('label, div')?.textContent?.trim() ?? '')),
            { message: 'Selected options of the sales order check list do not match' }
        ).toEqual(data.checkedChecklistOptions);
        await expect(this.salesChecklistRemarksTextBox, 'Sales checklist remarks do not match').toHaveValue(data.salesChecklistRemarks);
        await expect(this.productionRemarksTextBox, 'Production remarks do not match').toHaveValue(data.productionRemarks);
        await expect(this.deliveryRemarksTextBox, 'Delivery remarks do not match').toHaveValue(data.deliveryRemarks);
        await expect(this.deliveryCustomerNameTextBox, 'Delivery customer name does not match').toHaveValue(customerName);
        await expect(this.deliveryPhoneTextBox, 'Delivery phone does not match').toHaveValue(mobileNumber);
        await expect(this.deliveryLocationTextBox, 'Delivery location does not match').toHaveValue(data.deliveryLocation);
        await expect(this.installationCategoryTextBox, 'Installation category does not match').toHaveValue(data.installationCategory);
        await expect(this.inductionDateTextBox, 'Induction date is not prefilled').toHaveValue(/^\d{2}\/\d{2}\/\d{4}$/);
        await expect(this.deliveryDateTextBox, 'Delivery date is not prefilled').toHaveValue(/^\d{2}\/\d{2}\/\d{4}$/);
        console.log('Verified prefilled sales order check list details');
    }

    @step()
    async clickBackArrow() {
        await this.backArrow.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async viewBOM() {
        await this.viewBOMButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async validateBOQDetails(data: BOQData) {
        await expect(this.mainContent, 'BOQ product name does not match').toContainText(`Product Name - ${data.signName}`);
        await expect(this.mainContent, 'BOQ details do not match').toContainText(`Sign Code-${data.signCode}Sign Type-${data.signType}Sign Name-${data.signName}Description-${data.description}Size-${data.size}Quantity-${data.quantity}`);
    }

    @step()
    async validateBOMDetails(materials: string[]) {
        for (const material of materials) {
            await expect(this.mainContent, `BOM does not contain material: ${material}`).toContainText(material);
        }
    }

    @step()
    async viewEstimation(salesOrderId: string) {
        await this.search(salesOrderId);
        await this.viewEstimationButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async validateEstimationDetails(details: string[]) {
        for (const detail of details) {
            await expect(this.mainContent, `Estimation details do not contain: ${detail}`).toContainText(detail);
        }
    }

    @step()
    async expandSalesOrder(salesOrderId: string) {
        await this.expandButton.click();
    }

    // Selects the first available production engineer and returns the display name without the employee code
    @step()
    async selectProductionEngineer() {
        await this.productionEngineerDropdown.click();
        const engineerOption = this.productionEngineerOptions.nth(1);
        await expect(engineerOption, 'No production engineer is available in the dropdown').toBeVisible();
        const engineerText = (await engineerOption.innerText()).trim();
        await engineerOption.click();
        return engineerText.split(' - ').pop() || engineerText;
    }

    @step()
    async validateAssignProductionEngineerAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/pendingSalesOrder/assignProductionEngineer');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Assign production engineer API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified assign production engineer API with status code:', response.status());
    }
}
