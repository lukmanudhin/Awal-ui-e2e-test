import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { BOQData } from "../testData/addBoqData";

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
    async validateBOMDetails(data: BOQData, materials: string[]) {
        await expect(this.mainContent, 'BOM sign details do not match').toContainText(`Sign Code-${data.signCode}Sign Type-${data.signType}Sign Name-${data.signName}Description-${data.description}Size-${data.size}Quantity-${data.quantity}`);
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
