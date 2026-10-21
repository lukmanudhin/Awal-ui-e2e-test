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
    private readonly materialRow: (material: string) => Locator;

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
        this.materialRow = (material: string) => this.page.getByRole('row').filter({ hasText: material });
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
    async validateSelectedSalesOrderDetails(details: string[]) {
        for (const detail of details) {
            await expect(this.mainContent, `Selected sales order table does not contain: ${detail}`).toContainText(detail);
        }
    }

    @step()
    async enterPJOQuantity(quantity: string) {
        await this.plannedQuantityTextBox.first().fill(quantity);
    }

    @step()
    async viewStockDetails() {
        await this.viewStockDetailsButton.click();
    }

    // Out of stock materials are highlighted in yellow, available materials stay white
    @step()
    async validateStockHighlight(outOfStockMaterial: string, availableMaterial: string) {
        await expect(this.materialRow(outOfStockMaterial), `Out of stock material is not highlighted in yellow: ${outOfStockMaterial}`).toHaveCSS('background-color', 'rgb(255, 249, 193)');
        await expect(this.materialRow(availableMaterial), `Available material should not be highlighted: ${availableMaterial}`).toHaveCSS('background-color', 'rgb(255, 255, 255)');
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

    @step()
    async validatePRRaisedLink() {
        await expect(this.prRaisedLink, 'PR Raised is not a hyperlink to the purchase request sheet').toHaveAttribute('href', /purchase-request-sheet\?PRIds=/);
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

    // Required stock is fully free for the available material, the shortage stays pending for the out of stock material
    @step()
    async validateMRPResultsSummary(availableMaterial: string, outOfStockMaterial: string) {
        const availableCells = this.materialRow(availableMaterial).getByRole('cell');
        const outOfStockCells = this.materialRow(outOfStockMaterial).getByRole('cell');
        await expect(availableCells.nth(-3), 'Pending quantity of the available material should be 0').toHaveText('0');
        await expect(outOfStockCells.nth(-4), 'Free stock of the out of stock material should be 0').toHaveText('0');
        const requiredStock = (await outOfStockCells.nth(-6).innerText()).trim();
        await expect(outOfStockCells.nth(-3), 'Pending quantity of the out of stock material does not match its required stock').toHaveText(requiredStock);
        console.log('Verified MRP results summary');
    }

    @step()
    async startAllocationProcess() {
        await this.startAllocationButton.click();
        await this.viewReportButton.waitFor({ state: 'visible', timeout: 60000 });
    }

    @step()
    async validateAllocationProcessCompleted(itemCount: number) {
        await expect(this.mainContent, 'Allocation process did not complete').toContainText(`100% Completed (${itemCount} of ${itemCount} items Processed)`);
    }

    // The available material is fully allocated, the out of stock material is not allocated and its whole requirement stays pending
    @step()
    async validateAllocatedMaterialsReport(details: string[], availableMaterial: string, outOfStockMaterial: string) {
        for (const detail of details) {
            await expect(this.mainContent, `Allocated materials report does not contain: ${detail}`).toContainText(detail);
        }
        const availableCells = this.materialRow(availableMaterial).getByRole('cell');
        const outOfStockCells = this.materialRow(outOfStockMaterial).getByRole('cell');
        const availableRequired = (await availableCells.nth(-5).innerText()).trim();
        const outOfStockRequired = (await outOfStockCells.nth(-5).innerText()).trim();
        await expect(availableCells.nth(-4), 'Allocated quantity of the available material does not match its required quantity').toHaveText(availableRequired);
        await expect(availableCells.nth(-3), 'Pending quantity of the available material should be 0').toHaveText('0');
        await expect(outOfStockCells.nth(-4), 'Allocated quantity of the out of stock material should be 0').toHaveText('0');
        await expect(outOfStockCells.nth(-3), 'Pending quantity of the out of stock material does not match its required quantity').toHaveText(outOfStockRequired);
        console.log('Verified allocated materials report');
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
