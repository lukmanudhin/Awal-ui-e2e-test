import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class RequestApprovalPage extends BasePage {
    private readonly approveButton: Locator;
    private readonly yesButton: Locator;
    private readonly submitToSalesButton: Locator;
    private readonly confirmButton: Locator;
    public readonly approvedStatus: Locator;
    private readonly reasonTextBox: Locator;
    public readonly rejectStatus: Locator;
    public readonly status: Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.approveButton = this.page.getByRole('button', { name: 'Approve' });
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.submitToSalesButton = this.page.getByRole('button', { name: 'Submit to Sales' });
        this.confirmButton = this.page.getByRole('button', { name: 'Confirm' });
        this.approvedStatus = this.page.getByText('Approved', { exact: true });
        this.reasonTextBox = this.page.getByRole('textbox', { name: 'Reason*' });
        this.rejectStatus = this.page.locator('//span[text()="Rejected"]');
        this.status = this.page.locator('//td[@data-app-table-col="5"]//span');
    }
    @step()
    async clickViewCostEstimation(customerName: string) {
        await this.search(customerName);
        await this.page.getByText('View Cost Estimation').first().click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    @step()
    async clickViewCostEstimationAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/getVersionOptionsByPpjo?ppjoNumber=**');
        await this.page.getByRole('button', { name: 'View Cost Estimation' }).click();
        const response = await responsePromise;
        expect(response.status(), `View Cost Estimation API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Cost Estimation viewed successfully');
        console.log('Verified View Cost Estimation API with status code:', response.status());
    }
    @step()
    async approveEstimationAndValidateAPI(statusCode: number) {
        await this.approveButton.click();
        const responsePromise = this.page.waitForResponse('**/estimation/updateOptionStatusByVerOptId');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Approve Cost Estimation API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Cost Estimation approved successfully');
        console.log('Verified Approve Cost Estimation API with status code:', response.status());
    }
    @step()
    async submitToSalesAndValidateAPI(statusCode: number) {
        await this.submitToSalesButton.click();
        const responsePromise = this.page.waitForResponse('**/estimation/updateRequestNormalById');
        await this.confirmButton.click();
        const response = await responsePromise;
        expect(response.status(), `Submit to Sales API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Cost Estimation submitted to sales successfully');
        console.log('Verified Submit to Sales API with status code:', response.status());

    }
    @step()
    async rejectEstimationAndValidateAPI(statusCode: number) {
        await this.rejectButton.click();
        await this.reasonTextBox.fill('Reject Estimation E2E Test');
        const responsePromise = this.page.waitForResponse('**/estimation/updateOptionStatusByVerOptId');
        await this.rejectButton.nth(1).click();
        const response = await responsePromise;
        expect(response.status(), `Reject Cost Estimation API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Cost Estimation Rejected successfully');
        console.log('Verified Reject Cost Estimation API with status code:', response.status());
    }
}