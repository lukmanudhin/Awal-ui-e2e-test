import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { CreateMIRData } from "../testData/createMIR";

export class MaterialIndentRequestPage extends BasePage {
    private readonly createButton: Locator;
    private readonly addMaterialButton: Locator;
    private readonly descriptionTxtBx: Locator;
    private readonly sizeTxtBx: Locator;
    private readonly dropDown: (name: string) => Locator;
    private readonly dropDownOption: (name: string) => Locator;
    private readonly reqQuantityTxtBx: Locator
    private readonly remarksTxtBx: Locator;
    private readonly saveButton: Locator;
    private readonly submitButton: Locator;
    private readonly yesButton: Locator;
    public readonly mirStatus: Locator;
    public readonly priorityLevel: Locator;
    private readonly approveButton: Locator;
    private readonly historyButton: Locator;
    public readonly stockStatus: Locator;
    public readonly status: Locator
    private readonly pendingQuantity: Locator
    public readonly issuingQuantity: Locator
    private readonly selectAllMaterialChkBx: Locator;
    private readonly issueMaterialButton: Locator;
    public readonly materialStatus: Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.createButton = this.page.getByRole('button', { name: 'Create plus icon' });
        this.addMaterialButton = this.page.getByRole('button', { name: 'Add Material' });
        this.descriptionTxtBx = this.page.getByRole('textbox', { name: 'Description' });
        this.sizeTxtBx = this.page.getByRole('textbox', { name: 'Size' });
        this.reqQuantityTxtBx = this.page.getByRole('spinbutton', { name: 'Req Qty*' });
        this.remarksTxtBx = this.page.getByRole('textbox', { name: 'Remarks' });
        this.saveButton = this.page.getByRole('button', { name: 'Save' });
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.mirStatus = this.page.locator('//td[@data-app-table-col="9"]//span').last();
        this.priorityLevel = this.page.locator('//td[@data-app-table-col="8"]//span').last();
        this.approveButton = this.page.getByRole('button', { name: 'Approve' });
        this.historyButton = this.page.getByRole('button', { name: 'History filter' });
        this.stockStatus = this.page.locator('//td[@data-app-table-col="12"]//span').last();
        this.status = this.page.locator('//td[@data-app-table-col="6"]//span').last();
        this.dropDown = (name: string) => this.page.getByRole('combobox', { name: `${name}` });
        this.dropDownOption = (name: string) => this.page.getByRole('option', { name: `${name}` });
        this.pendingQuantity = this.page.locator('//td[@data-app-table-col="8"]');
        this.issuingQuantity = this.page.locator('#issuingQuantity-0');
        this.selectAllMaterialChkBx = this.page.locator('//input[@type="checkbox"]').first();
        this.issueMaterialButton = this.page.getByRole('button', { name: 'Issue Materials' });
        this.materialStatus = this.page.locator('//td[@data-app-table-col="7"]//span').first();
    }

    private async selectFromDropdown(dropdownName: string, value: string) {
        await this.dropDown(dropdownName).clear();
        await this.dropDown(dropdownName).fill(value);
        await this.dropDownOption(value).click({ force: true });
    }
    @step()
    async createMaterialIndentRequest(mirDetails: CreateMIRData) {
        await this.createButton.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.selectFromDropdown('Requisition Type*', mirDetails.requisitionType);
        await this.selectFromDropdown('Priority Level', mirDetails.priority);
        await this.selectFromDropdown('PJO Number', mirDetails.pjoNumber);
    }
    @step()
    async addMaterial(mirDetails: CreateMIRData) {
        await this.addMaterialButton.click();
        await expect(this.descriptionTxtBx, "Description text box is not cleared").toHaveValue('');
        await expect(this.sizeTxtBx, "Size text box is not cleared").toHaveValue('');
        await this.selectFromDropdown('Material Name*', mirDetails.material);
        await expect(this.descriptionTxtBx, "Description text box should not be empty").not.toHaveValue('');
        await expect(this.sizeTxtBx, "Size text box should not be empty").not.toHaveValue('');
        await this.reqQuantityTxtBx.fill(mirDetails.quantity);
        await this.remarksTxtBx.fill(mirDetails.remarks);
        await this.selectDate(new Date().getDate() + 5);
        await this.saveButton.click();
    }
    @step()
    async validateMaterialInformationTable(mirDetails: CreateMIRData) {
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.locator('//tbody/tr'), `Table row does not contain material: ${mirDetails.material}`).toContainText(mirDetails.material);
        const tableRow = await this.page.locator('//tbody/tr').innerText();
        expect(tableRow, "Table row does not contain quantity").toContain(mirDetails.quantity);
        // expect(tableRow).toContain(mirDetails.remarks);
    }
    @step()
    async submitMaterialIndentRequestAndValidateAPI(statusCode: number) {
        await this.submitButton.click();
        const responsePromise = this.page.waitForResponse('**/materialIndentRequest/create');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Create Material Indent Request status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified material indent request creation API with status code:', response.status());
        const responseBody = await response.json();
        return responseBody.result;
    }
    @step()
    async getMaterialIndentRequestNumber() {
        const materialIndentRequestNumber = await this.page.locator('//td[@data-app-table-row="0" and @data-app-table-col="1"]//div').innerText();
        return materialIndentRequestNumber;
    }
    @step()
    async managerApprovesMaterialRequestAndValidateAPI(statusCode: number) {
        await this.approveButton.click();
        const responsePromise = this.page.waitForResponse('**/mirManager/update');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Approve Material Indent Request status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified material indent request approval API with status code:', response.status());
    }
    @step()
    async goToHistory() {
        await this.historyButton.click();
    }
    @step()
    async enterIssueQuantity(requestedQuantity: string, quantity: string) {
        const requested = parseInt(requestedQuantity);
        const issued = parseInt(quantity);
        const finalPendingQuantity = requested - issued;
        expect(await this.pendingQuantity.innerText(), "Pending quantity does not match expected value").toBe(requestedQuantity);
        await this.issuingQuantity.fill(quantity);
        expect(await this.pendingQuantity.innerText(), "Pending quantity does not match expected value").toBe(`${finalPendingQuantity}`);
    }
    @step()
    async issueMaterialAndValidateAPI(statusCode: number) {
        await this.selectAllMaterialChkBx.check();
        await this.issueMaterialButton.click();
        const responsePromise = this.page.waitForResponse('**/materialIssueNote/createIssueMaterial');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Issue Material status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified issue material API with status code:', response.status());
    }
    @step()
    async getMaterialCurrentQuatity() {
        const currentQuantity = await this.page.locator('//td[@data-app-table-col="3"]//span').innerText();
        return parseFloat(currentQuantity);
    }

}