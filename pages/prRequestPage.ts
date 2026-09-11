import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class PRRequestPage extends BasePage {
    private readonly selectAllChkBx: Locator;
    private readonly createPRButton: Locator;
    private readonly submitForApprovalButton: Locator;
    private readonly approveButton: Locator;
    private readonly confirmButton: Locator;
    private readonly reasonTxtBx: Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.selectAllChkBx = this.page.locator('#select-all');
        this.createPRButton = this.page.getByRole('button', { name: 'Create PR' });
        this.submitForApprovalButton = this.page.getByRole('button', { name: 'Submit For Approval' });
        this.approveButton = this.page.getByRole('button', { name: 'Approve' });
        this.confirmButton = this.page.getByRole('button', { name: 'Confirm' });
        this.reasonTxtBx = this.page.getByRole('textbox', { name: 'Reason for Rejection' });
    }
    @step()
    async createPRRequestAndValidateAPI(statusCode: number) {
        await this.selectAllChkBx.check();
        await this.createPRButton.click();
        const responsePromise = this.page.waitForResponse('**/purchaseRequisition/createPR');
        await this.submitForApprovalButton.click();
        const response = await responsePromise;
        expect(response.status(), `Create PR RequestAPI status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('PR created successfully');
        console.log(`Verified PR creation API with status code:`, response.status());
    }

    @step()
    async searchPR(name: string) {
        await this.page.waitForTimeout(500);
        await this.searchBox.fill(name);
        await this.page.waitForTimeout(2000);
        const prId = await this.enquiryIdCell.textContent();
        return prId || "";
    }
    @step()
    async approvePRRequestAndValidateAPI(statusCode: number) {
        await this.approveButton.click();
        const responsePromise = this.page.waitForResponse('**/purchaseRequisitionManager/update');
        await this.confirmButton.click();
        const response = await responsePromise;
        expect(response.status(), `Approve PR Request API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('PR approved successfully');
        console.log(`Verified PR approval API with status code:`, response.status());
    }

    async goToNestedSubModulePRToPO() {
        await this.page.locator('(//span[text()="PR to PO"])[2]').click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async rejectPRRequestAndValidateAPI(statusCode: number) {
        await this.rejectButton.click();
        await this.reasonTxtBx.fill('PR Manager Rejects PR E2E Test');
        const responsePromise = this.page.waitForResponse('**/purchaseRequisitionManager/update');
        await this.rejectButton.nth(1).click();
        const response = await responsePromise;
        expect(response.status(), `Reject PR Request API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('PR rejected successfully');
        console.log(`Verified PR rejected API with status code:`, response.status());
    }    
}