import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class DepartmentAssignmentCompletionPage extends BasePage {
    public readonly mainContent: Locator;
    private readonly completedButton: Locator;

    // Dynamic locators
    private readonly departmentTaskViewIcon: (department: string, pjoNumber: string) => Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.mainContent = this.page.getByRole('main');
        this.completedButton = this.page.getByRole('button', { name: 'Completed', exact: true });

        // Dynamic locators initialization
        this.departmentTaskViewIcon = (department: string, pjoNumber: string) => this.page.getByRole('row', { name: `${department} ${pjoNumber}` }).locator('img');
    }

    // The same PJO is listed once per department, so the view icon is picked from the row of the department
    @step()
    async openDepartmentTask(department: string, pjoNumber: string) {
        await this.search(pjoNumber);
        await this.departmentTaskViewIcon(department, pjoNumber).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async validateDepartmentTaskDetails(details: string[]) {
        for (const detail of details) {
            await expect(this.mainContent, `Department assignment completion details do not contain: ${detail}`).toContainText(detail);
        }
    }

    @step()
    async uploadDesignFile(folderName: string, fileName: string) {
        await this.uploadFile(folderName, fileName);
    }

    @step()
    async validateCompleteDepartmentTaskAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/DepartmentAssignmentCompletion/createDepartmentAssignmentCompletion');
        await this.completedButton.click();
        const response = await responsePromise;
        expect(response.status(), `Complete department task API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified complete department task API with status code:', response.status());
    }
}
