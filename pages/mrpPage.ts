import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { PRRequestPage } from "./prRequestPage";

export class MRPPage extends BasePage {
    public readonly mainContent: Locator;
    public readonly mrpCreatedMessage: Locator;
    private readonly createMRPButton: Locator;
    private readonly selectAllCheckBox: Locator;
    private readonly submitButton: Locator;
    private readonly plannedQuantityTextBox: Locator;
    private readonly viewStockDetailsButton: Locator;
    private readonly runMRPButton: Locator;
    private readonly prRaisedLink: Locator;
    private readonly viewReportButton: Locator;
    private readonly startAllocationButton: Locator;
    private readonly createPJOButton: Locator;
    private readonly yesButton: Locator;
    private readonly okButton: Locator;
    private readonly expandButton: Locator;

    // Dynamic locators
    private readonly pjoNumberCell: (salesOrderId: string) => Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.mainContent = this.page.getByRole('main');
        this.mrpCreatedMessage = this.page.getByText(/created under MRP No\./);
        this.createMRPButton = this.page.getByRole('button', { name: 'Create MRP plus' });
        this.selectAllCheckBox = this.page.locator('#select-all');
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });
        this.plannedQuantityTextBox = this.page.locator('input[id^="yetToStart-"]');
        this.viewStockDetailsButton = this.page.getByRole('button', { name: 'View Stock Details' });
        this.runMRPButton = this.page.getByRole('button', { name: 'Run MRP' });
        this.prRaisedLink = this.page.getByRole('link', { name: 'PR Raised' });
        this.viewReportButton = this.page.getByRole('button', { name: 'View Report' });
        this.startAllocationButton = this.page.getByRole('button', { name: 'Start Allocation Process' });
        this.createPJOButton = this.page.getByRole('button', { name: 'Create PJO & Assign Department' });
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.okButton = this.page.getByRole('button', { name: 'OK' });
        this.expandButton = this.page.getByRole('button', { name: 'Expand' });

        // Dynamic locators initialization
        this.pjoNumberCell = (salesOrderId: string) => this.page.locator('table table tbody tr').filter({ hasText: salesOrderId }).getByRole('cell').nth(4);
    }

    @step()
    async clickCreateMRP() {
        await this.createMRPButton.click();
    }

    @step()
    async submitPendingSalesOrderAndValidateAPI(statusCode: number) {
        await this.selectAllCheckBox.check();
        const responsePromise = this.page.waitForResponse('**/mrpProcessing/pendingSalesOrders');
        await this.submitButton.click();
        const response = await responsePromise;
        expect(response.status(), `Submit pending sales order for MRP API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified submit pending sales order for MRP API with status code:', response.status());
    }

    @step()
    async enterPJOQuantity(quantity: string) {
        await this.plannedQuantityTextBox.first().fill(quantity);
    }

    @step()
    async viewStockDetails() {
        await this.viewStockDetailsButton.click();
    }

    @step()
    async runMRPAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/mrpProcessing/CreateMRP');
        await this.runMRPButton.click();
        const response = await responsePromise;
        expect(response.status(), `Run MRP API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified run MRP API with status code:', response.status());
    }

    @step()
    async validateMRPCompleted() {
        await expect(this.mainContent, 'MRP run did not complete').toContainText('100% Completed', { timeout: 60000 });
        await expect(this.prRaisedLink, 'PR Raised link is not visible after the MRP run').toBeVisible();
    }

    // Opens the purchase request sheet that the MRP run raised, which opens in a new tab
    @step()
    async openRaisedPRSheet() {
        const popupPromise = this.page.waitForEvent('popup');
        await this.prRaisedLink.click();
        const popup = await popupPromise;
        await popup.waitForLoadState('domcontentloaded');
        return new PRRequestPage(popup);
    }

    @step()
    async viewReport() {
        await this.viewReportButton.click();
    }

    @step()
    async startAllocationProcess() {
        await this.startAllocationButton.click();
        await this.viewReportButton.waitFor({ state: 'visible', timeout: 60000 });
    }

    @step()
    async createPJOAndAssignDepartmentAndValidateAPI(statusCode: number) {
        await this.createPJOButton.click();
        const responsePromise = this.page.waitForResponse('**/pjo/CreatePJO');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Create PJO API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified create PJO API with status code:', response.status());
    }

    @step()
    async getMRPNumber() {
        const message = await this.mrpCreatedMessage.innerText();
        const mrpNumber = message.match(/MRP\d+/)?.[0] || '';
        await this.okButton.click();
        return mrpNumber;
    }

    @step()
    async getPJONumber(mrpNumber: string, salesOrderId: string) {
        await this.search(mrpNumber);
        await this.expandButton.click();
        await expect(this.pjoNumberCell(salesOrderId), `PJO is not listed under ${mrpNumber}`).toBeVisible();
        return (await this.pjoNumberCell(salesOrderId).innerText()).trim();
    }
}
