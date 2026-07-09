import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { SalesEnquiryData } from "../testData/salesEnquiryData";

export class RequestNormalPage extends BasePage {
    private readonly costEstimationButton: Locator;
    public readonly costEstimationTitle: Locator;
    public readonly requestNormalTab: Locator;

    // Dynamic locators
    public readonly estimationStatus: Locator;
    private readonly customerRow: (name: string) => Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.costEstimationButton = this.page.locator('//span[text()="Generate Cost Estimation"]');
        this.costEstimationTitle = this.page.getByRole('heading');
        this.requestNormalTab = this.page.getByRole('tab', { name: 'Request (Normal)' });

        // Dynamic locators initialization
        this.customerRow = (name: string) => this.page.getByRole('row').filter({ hasText: name }).first();
        this.estimationStatus = this.page.locator('//td[@data-app-table-col="5"]//span');
    }
    @step()
    async validateEnquiryDetailsInRequestNormal(customerName: string) {
        await expect(this.customerRow(customerName), `Sales enquiry row is not visible for customer: ${customerName}`).toContainText(customerName);
        await expect(this.customerRow(customerName), `Estimation status is not New Request for customer: ${customerName}`).toContainText('New Request');
        await expect(this.customerRow(customerName), `Generate Cost Estimation Button is not visible for customer: ${customerName}`).toContainText('Generate Cost Estimation');
    }
    @step()
    async clickGenerateCostEstimation() {
        await this.scrollUntilElementVisibleAndClick(this.costEstimationButton);
    }
}