import { Page, Locator, expect } from "@playwright/test";
import path from "path";
import { BasePage, step } from "./basePage";
import { ProductionData } from "../testData/productionData";

export class QCTaskRequestsPage extends BasePage {
    public readonly mainContent: Locator;
    private readonly assignedQCDropdown: Locator;
    private readonly startQCButton: Locator;
    private readonly testTypeDropdown: Locator;
    // The test row ids carry a timestamp suffix (description_1793189257156), so they are matched by prefix
    private readonly testDescriptionTextBox: Locator;
    private readonly testCriteriaTextBox: Locator;
    private readonly expectedResultTextBox: Locator;
    private readonly actualResultTextBox: Locator;
    private readonly testPassedCheckBox: Locator;
    private readonly saveTestIcon: Locator;
    private readonly acceptedQuantityTextBox: Locator;
    private readonly rejectedQuantityTextBox: Locator;
    private readonly nonConformityDetailsTextBox: Locator;
    private readonly submitButton: Locator;

    // Dynamic locators
    private readonly assignedQCOption: (name: string) => Locator;
    private readonly testTypeOption: (name: string) => Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.mainContent = this.page.getByRole('main');
        this.assignedQCDropdown = this.page.getByRole('combobox', { name: 'Select Assigned QC' });
        this.startQCButton = this.page.getByRole('button', { name: 'Start QC' });
        this.testTypeDropdown = this.page.getByRole('combobox', { name: 'Select', exact: true });
        this.testDescriptionTextBox = this.page.locator('[id^="description_"]');
        this.testCriteriaTextBox = this.page.locator('[id^="testCriteria_"]');
        this.expectedResultTextBox = this.page.locator('[id^="expectedResult_"]');
        this.actualResultTextBox = this.page.locator('[id^="actualResult_"]');
        this.testPassedCheckBox = this.page.getByRole('checkbox').first();
        this.saveTestIcon = this.page.getByRole('img', { name: 'Save' });
        this.acceptedQuantityTextBox = this.page.getByRole('textbox', { name: 'Accepted Quantity' });
        this.rejectedQuantityTextBox = this.page.getByRole('textbox', { name: 'Rejected Quantity' });
        this.nonConformityDetailsTextBox = this.page.getByRole('textbox', { name: 'Enter Details' });
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });

        // Dynamic locators initialization
        this.assignedQCOption = (name: string) => this.page.getByText(name);
        this.testTypeOption = (name: string) => this.page.getByRole('option', { name });
    }

    @step()
    async validateQCTaskDetails(details: string[]) {
        for (const detail of details) {
            await expect(this.mainContent, `QC task details do not contain: ${detail}`).toContainText(detail);
        }
    }

    @step()
    async validateAssignQCAPI(qcEmployee: string, statusCode: number) {
        await this.assignedQCDropdown.click();
        const responsePromise = this.page.waitForResponse('**/QCTask/updateAssignedQC');
        await this.assignedQCOption(qcEmployee).click();
        const response = await responsePromise;
        expect(response.status(), `Assign QC API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified assign QC API with status code:', response.status());
    }

    @step()
    async clickStartQC() {
        await this.startQCButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    async enterQCTestDetails(data: ProductionData) {
        await this.testTypeDropdown.click();
        await this.testTypeOption(data.qcTestType).click();
        await this.testDescriptionTextBox.fill(data.qcTestDescription);
        await this.testCriteriaTextBox.fill(data.qcTestCriteria);
        await this.expectedResultTextBox.fill(data.qcExpectedResult);
        await this.actualResultTextBox.fill(data.qcActualResult);
        await this.testPassedCheckBox.check();
    }

    // Saving the test row only switches it to read only, the backend is called when the QC is submitted
    @step()
    async saveQCTest() {
        await this.saveTestIcon.click();
    }

    @step()
    async enterNonConformityDetails(data: ProductionData) {
        await this.acceptedQuantityTextBox.fill(data.qcAcceptedQuantity);
        await this.rejectedQuantityTextBox.fill(data.qcRejectedQuantity);
        await this.nonConformityDetailsTextBox.fill(data.nonConformityDetails);
        // BasePage.uploadFile would pick the "Upload Attachment" label as the trigger, the file chooser opens from Browse files
        const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.browseFileButton.click(),
        ]);
        await fileChooser.setFiles(path.join(process.cwd(), data.uploadFolder, data.uploadFileName));
    }

    @step()
    async validateSubmitQCAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/QCTask/createQcTest');
        await this.submitButton.click();
        const response = await responsePromise;
        expect(response.status(), `Submit QC API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified submit QC API with status code:', response.status());
    }
}
