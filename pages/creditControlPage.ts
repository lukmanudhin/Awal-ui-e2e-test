import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { CreditControlData, FinanceAssesmentData, SalesAssesmentData } from "../testData/creditControlData";

export class CreditControlPage extends BasePage {
    private readonly yearCalenderButton: Locator;
    private readonly next_MonthIcon: Locator;
    private readonly acknowledgementCalenderBtn: Locator;
    private readonly date_Locator: (date: string) => Locator;
    public readonly status: Locator;
    // public readonly statusCreditManager: Locator;
    private readonly createNewButton: Locator;
    private readonly companyNameInput: Locator;
    private readonly crnNoInput: Locator;
    private readonly vatNoInput: Locator;
    private readonly contactPersonNameInput: Locator;
    private readonly contactPositionInput: Locator;
    private readonly contactNumberInput: Locator;
    private readonly financeContactNameInput: Locator;
    private readonly financePositionInput: Locator;
    private readonly financeNumberInput: Locator;
    private readonly founderNameInput: Locator;
    private readonly founderPositionInput: Locator;
    private readonly founderNationalityInput: Locator;
    private readonly signatoryNameInput: Locator;
    private readonly poStatusCheckbox: (status: string) => Locator;
    private readonly bankNameInput: Locator;
    private readonly bankBranchInput: Locator;
    private readonly bankAccountNumberInput: Locator;
    private readonly relationshipManagerInput: Locator;
    private readonly bankContactNumberInput: Locator;
    private readonly traderNameInput: Locator;
    private readonly tradeContactNumberInput: Locator;
    private readonly tradeContactPersonInput: Locator;
    private readonly facilityEnjoyedInput: Locator;
    private readonly tradeEmailInput: Locator;
    private readonly tradeDaysInput: Locator;
    private readonly customerAcknowledgementNameInput: Locator;
    private readonly acknowledgementDesignationInput: Locator;
    private readonly submitButton: Locator;
    private readonly applicationNumberLocator: Locator;
    private readonly createSalesAssessmentButton: Locator;
    private readonly proposedBHDInput: Locator;
    private readonly creditPeriodInput: Locator;
    private readonly remarksInput: Locator;
    private readonly createButton: Locator;
    private readonly approveButton: Locator;
    private readonly yesButton: Locator;
    private readonly monthOutstandingInput: Locator;
    private readonly limitApprovedInput: Locator;
    private readonly bankReferenceInput: Locator;
    private readonly tradeReferenceInput: Locator;
    private readonly proposedLimitInput: Locator;
    private readonly financeCreditPeriodInput: Locator;
    private readonly financeRemarksInput: Locator;
    private readonly financeSubmitButton: Locator;
    private readonly historyButton: Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.yearCalenderButton = this.page.getByLabel('Choose date', { exact: true }).first();
        this.next_MonthIcon = this.page.getByRole('button', { name: 'Next month' });
        this.date_Locator = (date: string) => this.page.locator(`//div[@class="css-8uic9k" and text()="${date}"]`).first();
        this.status = this.page.locator('//td[@data-app-table-col="4"]//span').first();
        this.acknowledgementCalenderBtn = this.page.locator('section').filter({ hasText: 'Upload Customer' }).getByLabel('Choose date');
        // this.statusCreditManager = this.page.locator('//td[@data-app-table-col="5"]//span');
        this.createNewButton = this.page.getByRole('button', { name: 'create new plus icon' });
        this.companyNameInput = this.page.getByRole('textbox', { name: 'Company Name' });
        this.crnNoInput = this.page.getByRole('textbox', { name: 'C.R. No.' });
        this.vatNoInput = this.page.getByRole('textbox', { name: 'VAT No' });
        this.contactPersonNameInput = this.page.getByPlaceholder('Enter Person Name');
        this.contactPositionInput = this.page.locator('#contactPosition');
        this.contactNumberInput = this.page.locator('#contactNumber');
        this.financeContactNameInput = this.page.getByRole('textbox', { name: 'Finance Contact Name' });
        this.financePositionInput = this.page.locator('#financePosition');
        this.financeNumberInput = this.page.locator('#financeNumber');
        this.founderNameInput = this.page.locator('div').filter({ hasText: /^NamePositionNationality$/ }).getByPlaceholder('Enter Name');
        this.founderPositionInput = this.page.locator('[id="owners.0.ownerPosition"]');
        this.founderNationalityInput = this.page.getByRole('textbox', { name: 'Nationality' });
        this.signatoryNameInput = this.page.locator('[id="signatories.0.signatoryName"]');
        this.poStatusCheckbox = (status: string) => this.page.getByRole('checkbox', { name: `${status}` });
        this.bankNameInput = this.page.getByRole('textbox', { name: 'Bank Name' });
        this.bankBranchInput = this.page.getByRole('textbox', { name: 'Branch' });
        this.bankAccountNumberInput = this.page.getByRole('textbox', { name: 'Bank Account Number' });
        this.relationshipManagerInput = this.page.getByRole('textbox', { name: 'Relationship Manager' });
        this.bankContactNumberInput = this.page.getByRole('textbox', { name: 'Bank Contact Number' });
        this.traderNameInput = this.page.getByRole('textbox', { name: 'Trader\'s Name' });
        this.tradeContactNumberInput = this.page.locator('[id="tradePreference.0.traderContactNumber"]');
        this.tradeContactPersonInput = this.page.locator('[id="tradePreference.0.tradeContactPerson"]');
        this.facilityEnjoyedInput = this.page.getByRole('textbox', { name: 'Facility Enjoyed BHD' });
        this.tradeEmailInput = this.page.getByRole('textbox', { name: 'Email', exact: true });
        this.tradeDaysInput = this.page.getByRole('textbox', { name: 'Days' });
        this.customerAcknowledgementNameInput = this.page.getByRole('textbox', { name: 'Name*' });
        this.acknowledgementDesignationInput = this.page.getByRole('textbox', { name: 'Designation' });
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });
        this.applicationNumberLocator = this.page.locator('//tr/td[1]/div');
        this.createSalesAssessmentButton = this.page.getByRole('button', { name: 'Create Sales Assessment plus' });
        this.proposedBHDInput = this.page.getByRole('textbox', { name: '1. Revised / New Limit' });
        this.creditPeriodInput = this.page.getByRole('textbox', { name: 'Credit Period Days*' });
        this.remarksInput = this.page.getByRole('textbox', { name: 'Remarks / Comments*' });
        this.createButton = this.page.getByRole('button', { name: 'Create' });
        this.approveButton = this.page.getByRole('button', { name: 'Approve', exact: true });
        this.yesButton = this.page.getByRole('button', { name: 'Yes' });
        this.monthOutstandingInput = this.page.getByRole('spinbutton', { name: 'Month Outstanding (in BHD)' });
        this.limitApprovedInput = this.page.getByRole('spinbutton', { name: 'Limit Approved (in BHD) Over' });
        this.bankReferenceInput = this.page.getByRole('textbox', { name: 'Bank Reference' });
        this.tradeReferenceInput = this.page.getByRole('textbox', { name: 'Trade Reference' });
        this.proposedLimitInput = this.page.getByRole('spinbutton', { name: '5. Proposed / Revised New' });
        this.financeCreditPeriodInput = this.page.getByRole('spinbutton', { name: 'Credit Period Days' });
        this.financeRemarksInput = this.page.getByRole('textbox', { name: 'Remarks' });
        this.financeSubmitButton = this.page.getByRole('button', { name: 'submit' });
        this.historyButton = this.page.getByRole('button', { name: 'History history' });
    }

    @step()
    async clickCreateNewCreditControl() {
        await this.createNewButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    private async select_Date(targetDayNumber: number, calenderBtnLocator: Locator) {
        const targetDate = new Date();
        targetDate.setDate(targetDayNumber);

        await calenderBtnLocator.click({ force: true });
        await this.page.waitForTimeout(500);

        while (true) {
            const headerText = await this.page.locator('//div[@class="MuiPickersFadeTransitionGroup-root css-1h73gvd"]').innerText();
            const currentDate = new Date(headerText);

            if (
                currentDate.getMonth() === targetDate.getMonth() &&
                currentDate.getFullYear() === targetDate.getFullYear()
            ) {
                break;
            }
            await this.next_MonthIcon.click();
        }
        await this.date_Locator(`${targetDate.getDate()}`).click();
    }

    @step()
    async createNewCreditControl(data: CreditControlData) {
        await this.selectOptionFromDropdown('Customer*', data.customer)
        await this.companyNameInput.fill(data.company);
        await this.crnNoInput.fill(data.crnNo);
        await this.vatNoInput.fill(data.vatNo);
        await this.select_Date(new Date().getDate() + 3, this.yearCalenderButton)
        await this.selectOptionFromDropdown('Customer Industry', data.customerIndustry)
        await this.contactPersonNameInput.fill(data.contactPerson);
        await this.contactPositionInput.fill(data.contactPersonPosition);
        await this.contactNumberInput.fill(data.contactPersonNumber);
        await this.financeContactNameInput.fill(data.financeContactName);
        await this.financePositionInput.fill(data.financeContactPosition);
        await this.financeNumberInput.fill(data.financeContactNumber);
        await this.founderNameInput.fill(data.founderName);
        await this.founderPositionInput.fill(data.founderPosition);
        await this.founderNationalityInput.fill(data.founderNationality);
        await this.signatoryNameInput.fill(data.signatoryName);
        await this.uploadFile('test_Documents', data.fileName);
        await this.poStatusCheckbox(data.poStatus).check();
        await this.bankNameInput.fill(data.bankName);
        await this.bankBranchInput.fill(data.bankBranch);
        await this.bankAccountNumberInput.fill(data.bankAccountNumber);
        await this.relationshipManagerInput.fill(data.relationshipManager);
        await this.bankContactNumberInput.fill(data.bankContactNumber);
        await this.traderNameInput.fill(data.traderName);
        await this.tradeContactNumberInput.fill(data.tradeContactNumber);
        await this.tradeContactPersonInput.fill(data.tradeContactPerson);
        await this.facilityEnjoyedInput.fill(data.facilityEnjoyed);
        await this.tradeEmailInput.fill(data.tradeEmail);
        await this.tradeDaysInput.fill(data.tradeDays);
        await this.customerAcknowledgementNameInput.fill(data.customerAcknowledgementName);
        await this.acknowledgementDesignationInput.fill(data.acknowledgementDesignation);
        await this.select_Date(new Date().getDate() + 5, this.acknowledgementCalenderBtn);
        await this.uploadFile('test_Documents', data.fileName, 1);
        await this.submitButton.click();
    }
    @step()
    async getApplicationNumber() {
        return await this.applicationNumberLocator.textContent() || "";
    }
    @step()
    async validateCreditControlDetails(data: CreditControlData) {
        await expect(this.page.locator('//div[@class="flex-grow p-6"]')).toContainText(data.customer);
        const creditDetails = await this.page.locator('//div[@class="flex-grow p-6"]').innerText();
        expect(creditDetails).toContain(data.customerAcknowledgementName);
        expect(creditDetails).toContain(data.crnNo);
        expect(creditDetails).toContain(data.vatNo);
        expect(creditDetails).toContain(data.customerIndustry);
        expect(creditDetails).toContain(data.contactPerson);
        expect(creditDetails).toContain(data.contactPersonPosition);
        expect(creditDetails).toContain(data.contactPersonNumber);
        expect(creditDetails).toContain(data.financeContactName);
        expect(creditDetails).toContain(data.financeContactPosition);
        expect(creditDetails).toContain(data.financeContactNumber);
        expect(creditDetails).toContain(data.founderName);
        expect(creditDetails).toContain(data.founderPosition);
        expect(creditDetails).toContain(data.founderNationality);
        expect(creditDetails).toContain(data.signatoryName);
        expect(creditDetails).toContain(data.bankName);
        expect(creditDetails).toContain(data.bankBranch);
        expect(creditDetails).toContain(data.bankAccountNumber);
        expect(creditDetails).toContain(data.relationshipManager);
        expect(creditDetails).toContain(data.bankContactNumber);
        expect(creditDetails).toContain(data.traderName);
        expect(creditDetails).toContain(data.tradeContactNumber);
        expect(creditDetails).toContain(data.tradeContactPerson);
        expect(creditDetails).toContain(data.facilityEnjoyed);
        expect(creditDetails).toContain(data.tradeEmail);
        expect(creditDetails).toContain(data.tradeDays);
        expect(creditDetails).toContain(data.customerAcknowledgementName);
        expect(creditDetails).toContain(data.acknowledgementDesignation);
    }
    @step()
    async createSalesAssesment(data: SalesAssesmentData) {
        await this.createSalesAssessmentButton.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.proposedBHDInput.fill(data.proposedBHD);
        await this.creditPeriodInput.fill(data.creditPeriod);
        await this.selectOptionFromDropdown('Payment Terms*', data.paymentTerms);
        await this.remarksInput.fill(data.remarks);
        await this.selectOptionFromDropdown('Recommended By*', data.recommendedBy);
        await this.selectOptionFromDropdown('Account Executive*', data.accountExecutive);
        await this.selectOptionFromDropdown('Sales Manager*', data.salesManager);
        await this.createButton.click();
    }
    @step()
    async validateSalesAssesmentDetails(data: SalesAssesmentData) {
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.locator('//div[@class="p-0 undefined"]')).toContainText(data.creditPeriod);
        const salesAssesmentDetails = await this.page.locator('//div[@class="p-0 undefined"]').innerText();
        expect(salesAssesmentDetails).toContain(data.paymentTerms);
        // expect(salesAssesmentDetails).toContain(data.recommendedBy);
        // expect(salesAssesmentDetails).toContain(data.accountExecutive);
        // expect(salesAssesmentDetails).toContain(data.salesManager);
        expect(salesAssesmentDetails).toContain(data.remarks);
    }
    @step()
    async approveCreditControlAndValidateAPI(statusCode: number) {
        await this.approveButton.click();
        const responsePromise = this.page.waitForResponse('**/CreditControl/statusApprovedOrRejectedByManager');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Calculate Summary API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Summary calculated successfully');
        console.log('Verified Calculate Summary API with status code:', response.status());
    }
    @step()
    async validateTabVisible(tabName: string) {
        await expect(this.tab(tabName), `Tab is not visible: ${tabName}`).toBeVisible();
    }
    @step()
    async submitFinanceDepartmentAssesment(data: FinanceAssesmentData) {
        await this.monthOutstandingInput.fill(data.monthOutstanding);
        await this.limitApprovedInput.fill(data.limitApproved);
        await this.bankReferenceInput.fill(data.bankReference);
        await this.tradeReferenceInput.fill(data.tradeReference);
        await this.selectOptionFromDropdown('Payment Terms*', data.paymentTerms);
        await this.proposedLimitInput.fill(data.proposedLimit);
        await this.financeCreditPeriodInput.fill(data.creditPeriod);
        await this.financeRemarksInput.fill(data.remarks);
        await this.financeSubmitButton.click();
    }
    @step()
    async validateFinanceAssesmentDetails(data: FinanceAssesmentData) {
        await expect(this.page.locator('//div[@class="p-[18px] !pb-0"]')).toContainText(data.monthOutstanding);
        const financeAssesmentDetails = await this.page.locator('//div[@class="p-[18px] !pb-0"]').innerText();
        expect(financeAssesmentDetails).toContain(data.limitApproved);
        expect(financeAssesmentDetails).toContain(data.bankReference);
        expect(financeAssesmentDetails).toContain(data.tradeReference);
        expect(financeAssesmentDetails).toContain(data.paymentTerms);
        expect(financeAssesmentDetails).toContain(data.proposedLimit);
        expect(financeAssesmentDetails).toContain(data.creditPeriod);
        // expect(financeAssesmentDetails).toContain(data.remarks);
    }
    @step()
    async approveFinanceAssesmentAndValidateAPI(statusCode: number) {
        await this.approveButton.click();
        const responsePromise = this.page.waitForResponse('**/creditControl/statusApprovedOrRejectedByManager');
        await this.yesButton.click();
        const response = await responsePromise;
        expect(response.status(), `Approve Finance Assesment API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Finance Assesment approved successfully');
        console.log('Verified Approve Finance Assesment API with status code:', response.status());
    }
    @step()
    async goToHistory(){
        await this.historyButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
}