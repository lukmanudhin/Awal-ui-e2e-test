import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class ProductionJobOrderPage extends BasePage {
    public readonly mainContent: Locator;
    private readonly backArrow: Locator;
    private readonly approveButton: Locator;
    private readonly yesButton: Locator;
    private readonly runningStatus: Locator;
    private readonly pendingStatus: Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.mainContent = this.page.getByRole('main');
        this.backArrow = this.page.getByRole('img', { name: /back[ _]arrow/ });
        this.approveButton = this.page.getByRole('button', { name: 'Approve', exact: true });
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.runningStatus = this.page.getByRole('cell', { name: 'Running', exact: true });
        this.pendingStatus = this.page.getByRole('cell', { name: 'Pending', exact: true });
    }

    @step()
    async openPJO(pjoNumber: string) {
        await this.search(pjoNumber);
        await this.clickViewIcon();
    }

    @step()
    async validatePJODetails(details: string[]) {
        for (const detail of details) {
            await expect(this.mainContent, `PJO details do not contain: ${detail}`).toContainText(detail);
        }
    }

    @step()
    async validatePJOMaterials(materials: string[]) {
        for (const material of materials) {
            await expect(this.mainContent, `PJO BOM does not contain material: ${material}`).toContainText(material);
        }
    }

    @step()
    async validateBOLDepartments(departments: string[]) {
        for (const department of departments) {
            await expect(this.mainContent, `PJO BOL does not contain department: ${department}`).toContainText(department);
        }
    }

    @step()
    async clickBackArrow() {
        await this.backArrow.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async approvePJOAndValidateAPI(statusCode: number) {
        await this.approveButton.click();
        const responsePromise = this.page.waitForResponse('**/pjoManager/pJOApprove');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Approve PJO API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified approve PJO API with status code:', response.status());
    }

    @step()
    async validateTaskProgress(departmentCount: number) {
        await expect(this.runningStatus, `Expected ${departmentCount} departments to be Running`).toHaveCount(departmentCount);
        await expect(this.pendingStatus, `Expected ${departmentCount} departments to have a Pending status`).toHaveCount(departmentCount);
    }
}
