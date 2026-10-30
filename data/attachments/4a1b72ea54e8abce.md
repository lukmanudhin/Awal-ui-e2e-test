# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: UI/sales/creditControlTest.spec.ts >> Credit Control Test E2E Flow >> Verify new sales enquiry is created successfully
- Location: tests/UI/sales/creditControlTest.spec.ts:35:9

# Error details

```
TimeoutError: locator.innerText: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('//div[@class="MuiPickersFadeTransitionGroup-root css-1h73gvd"]')

```

# Test source

```ts
  27  |     private readonly bankBranchInput: Locator;
  28  |     private readonly bankAccountNumberInput: Locator;
  29  |     private readonly relationshipManagerInput: Locator;
  30  |     private readonly bankContactNumberInput: Locator;
  31  |     private readonly traderNameInput: Locator;
  32  |     private readonly tradeContactNumberInput: Locator;
  33  |     private readonly tradeContactPersonInput: Locator;
  34  |     private readonly facilityEnjoyedInput: Locator;
  35  |     private readonly tradeEmailInput: Locator;
  36  |     private readonly tradeDaysInput: Locator;
  37  |     private readonly customerAcknowledgementNameInput: Locator;
  38  |     private readonly acknowledgementDesignationInput: Locator;
  39  |     private readonly submitButton: Locator;
  40  |     private readonly applicationNumberLocator: Locator;
  41  |     private readonly createSalesAssessmentButton: Locator;
  42  |     private readonly proposedBHDInput: Locator;
  43  |     private readonly creditPeriodInput: Locator;
  44  |     private readonly remarksInput: Locator;
  45  |     private readonly createButton: Locator;
  46  |     private readonly approveButton: Locator;
  47  |     private readonly yesButton: Locator;
  48  |     private readonly monthOutstandingInput: Locator;
  49  |     private readonly limitApprovedInput: Locator;
  50  |     private readonly bankReferenceInput: Locator;
  51  |     private readonly tradeReferenceInput: Locator;
  52  |     private readonly proposedLimitInput: Locator;
  53  |     private readonly financeCreditPeriodInput: Locator;
  54  |     private readonly financeRemarksInput: Locator;
  55  |     private readonly financeSubmitButton: Locator;
  56  |     private readonly historyButton: Locator;
  57  | 
  58  |     constructor(public readonly page: Page) {
  59  |         super(page);
  60  |         this.yearCalenderButton = this.page.getByLabel('Choose date', { exact: true }).first();
  61  |         this.next_MonthIcon = this.page.getByRole('button', { name: 'Next month' });
  62  |         this.date_Locator = (date: string) => this.page.locator(`//div[@class="css-8uic9k" and text()="${date}"]`).first();
  63  |         this.acknowledgementCalenderBtn = this.page.locator('section').filter({ hasText: 'Upload Customer' }).getByLabel('Choose date');
  64  |         // this.statusCreditManager = this.page.locator('//td[@data-app-table-col="5"]//span');
  65  |         this.createNewButton = this.page.getByRole('button', { name: 'create new plus icon' });
  66  |         this.companyNameInput = this.page.getByRole('textbox', { name: 'Company Name' });
  67  |         this.crnNoInput = this.page.getByRole('textbox', { name: 'C.R. No.' });
  68  |         this.vatNoInput = this.page.getByRole('textbox', { name: 'VAT No' });
  69  |         this.contactPersonNameInput = this.page.getByPlaceholder('Enter Person Name');
  70  |         this.contactPositionInput = this.page.locator('#contactPosition');
  71  |         this.contactNumberInput = this.page.locator('#contactNumber');
  72  |         this.financeContactNameInput = this.page.getByRole('textbox', { name: 'Finance Contact Name' });
  73  |         this.financePositionInput = this.page.locator('#financePosition');
  74  |         this.financeNumberInput = this.page.locator('#financeNumber');
  75  |         this.founderNameInput = this.page.locator('div').filter({ hasText: /^NamePositionNationality$/ }).getByPlaceholder('Enter Name');
  76  |         this.founderPositionInput = this.page.locator('[id="owners.0.ownerPosition"]');
  77  |         this.founderNationalityInput = this.page.getByRole('textbox', { name: 'Nationality' });
  78  |         this.signatoryNameInput = this.page.locator('[id="signatories.0.signatoryName"]');
  79  |         this.poStatusCheckbox = (status: string) => this.page.getByRole('checkbox', { name: `${status}` });
  80  |         this.bankNameInput = this.page.getByRole('textbox', { name: 'Bank Name' });
  81  |         this.bankBranchInput = this.page.getByRole('textbox', { name: 'Branch' });
  82  |         this.bankAccountNumberInput = this.page.getByRole('textbox', { name: 'Bank Account Number' });
  83  |         this.relationshipManagerInput = this.page.getByRole('textbox', { name: 'Relationship Manager' });
  84  |         this.bankContactNumberInput = this.page.getByRole('textbox', { name: 'Bank Contact Number' });
  85  |         this.traderNameInput = this.page.getByRole('textbox', { name: 'Trader\'s Name' });
  86  |         this.tradeContactNumberInput = this.page.locator('[id="tradePreference.0.traderContactNumber"]');
  87  |         this.tradeContactPersonInput = this.page.locator('[id="tradePreference.0.tradeContactPerson"]');
  88  |         this.facilityEnjoyedInput = this.page.getByRole('textbox', { name: 'Facility Enjoyed BHD' });
  89  |         this.tradeEmailInput = this.page.getByRole('textbox', { name: 'Email', exact: true });
  90  |         this.tradeDaysInput = this.page.getByRole('textbox', { name: 'Days' });
  91  |         this.customerAcknowledgementNameInput = this.page.getByRole('textbox', { name: 'Name*' });
  92  |         this.acknowledgementDesignationInput = this.page.getByRole('textbox', { name: 'Designation' });
  93  |         this.submitButton = this.page.getByRole('button', { name: 'Submit' });
  94  |         this.applicationNumberLocator = this.page.locator('//tr/td[1]/div');
  95  |         this.createSalesAssessmentButton = this.page.getByRole('button', { name: 'Create Sales Assessment plus' });
  96  |         this.proposedBHDInput = this.page.getByRole('textbox', { name: '1. Revised / New Limit' });
  97  |         this.creditPeriodInput = this.page.getByRole('textbox', { name: 'Credit Period Days*' });
  98  |         this.remarksInput = this.page.getByRole('textbox', { name: 'Remarks / Comments*' });
  99  |         this.createButton = this.page.getByRole('button', { name: 'Create' });
  100 |         this.approveButton = this.page.getByRole('button', { name: 'Approve', exact: true });
  101 |         this.yesButton = this.page.getByRole('button', { name: 'Yes' });
  102 |         this.monthOutstandingInput = this.page.getByRole('spinbutton', { name: 'Month Outstanding (in BHD)' });
  103 |         this.limitApprovedInput = this.page.getByRole('spinbutton', { name: 'Limit Approved (in BHD) Over' });
  104 |         this.bankReferenceInput = this.page.getByRole('textbox', { name: 'Bank Reference' });
  105 |         this.tradeReferenceInput = this.page.getByRole('textbox', { name: 'Trade Reference' });
  106 |         this.proposedLimitInput = this.page.getByRole('spinbutton', { name: '5. Proposed / Revised New' });
  107 |         this.financeCreditPeriodInput = this.page.getByRole('spinbutton', { name: 'Credit Period Days' });
  108 |         this.financeRemarksInput = this.page.getByRole('textbox', { name: 'Remarks' });
  109 |         this.financeSubmitButton = this.page.getByRole('button', { name: 'submit' });
  110 |         this.historyButton = this.page.getByRole('button', { name: 'History history' });
  111 |     }
  112 | 
  113 |     @step()
  114 |     async clickCreateNewCreditControl() {
  115 |         await this.createNewButton.click();
  116 |         await this.page.waitForLoadState('domcontentloaded');
  117 |     }
  118 | 
  119 |     private async select_Date(targetDayNumber: number, calenderBtnLocator: Locator) {
  120 |         const targetDate = new Date();
  121 |         targetDate.setDate(targetDayNumber);
  122 | 
  123 |         await calenderBtnLocator.click({ force: true });
  124 |         await this.page.waitForTimeout(500);
  125 | 
  126 |         while (true) {
> 127 |             const headerText = await this.page.locator('//div[@class="MuiPickersFadeTransitionGroup-root css-1h73gvd"]').innerText();
      |                                                                                                                          ^ TimeoutError: locator.innerText: Timeout 15000ms exceeded.
  128 |             const currentDate = new Date(headerText);
  129 | 
  130 |             if (
  131 |                 currentDate.getMonth() === targetDate.getMonth() &&
  132 |                 currentDate.getFullYear() === targetDate.getFullYear()
  133 |             ) {
  134 |                 break;
  135 |             }
  136 |             await this.next_MonthIcon.click();
  137 |         }
  138 |         await this.date_Locator(`${targetDate.getDate()}`).click();
  139 |     }
  140 | 
  141 |     @step()
  142 |     async createNewCreditControl(data: CreditControlData) {
  143 |         await this.selectOptionFromDropdown('Customer*', data.customer)
  144 |         await this.companyNameInput.fill(data.company);
  145 |         await this.crnNoInput.fill(data.crnNo);
  146 |         await this.vatNoInput.fill(data.vatNo);
  147 |         await this.select_Date(new Date().getDate() + 3, this.yearCalenderButton)
  148 |         await this.selectOptionFromDropdown('Customer Industry', data.customerIndustry)
  149 |         await this.contactPersonNameInput.fill(data.contactPerson);
  150 |         await this.contactPositionInput.fill(data.contactPersonPosition);
  151 |         await this.contactNumberInput.fill(data.contactPersonNumber);
  152 |         await this.financeContactNameInput.fill(data.financeContactName);
  153 |         await this.financePositionInput.fill(data.financeContactPosition);
  154 |         await this.financeNumberInput.fill(data.financeContactNumber);
  155 |         await this.founderNameInput.fill(data.founderName);
  156 |         await this.founderPositionInput.fill(data.founderPosition);
  157 |         await this.founderNationalityInput.fill(data.founderNationality);
  158 |         await this.signatoryNameInput.fill(data.signatoryName);
  159 |         await this.uploadFile('test_Documents', data.fileName);
  160 |         await this.poStatusCheckbox(data.poStatus).check();
  161 |         await this.bankNameInput.fill(data.bankName);
  162 |         await this.bankBranchInput.fill(data.bankBranch);
  163 |         await this.bankAccountNumberInput.fill(data.bankAccountNumber);
  164 |         await this.relationshipManagerInput.fill(data.relationshipManager);
  165 |         await this.bankContactNumberInput.fill(data.bankContactNumber);
  166 |         await this.traderNameInput.fill(data.traderName);
  167 |         await this.tradeContactNumberInput.fill(data.tradeContactNumber);
  168 |         await this.tradeContactPersonInput.fill(data.tradeContactPerson);
  169 |         await this.facilityEnjoyedInput.fill(data.facilityEnjoyed);
  170 |         await this.tradeEmailInput.fill(data.tradeEmail);
  171 |         await this.tradeDaysInput.fill(data.tradeDays);
  172 |         await this.customerAcknowledgementNameInput.fill(data.customerAcknowledgementName);
  173 |         await this.acknowledgementDesignationInput.fill(data.acknowledgementDesignation);
  174 |         await this.select_Date(new Date().getDate() + 5, this.acknowledgementCalenderBtn);
  175 |         await this.uploadFile('test_Documents', data.fileName, 1);
  176 |         await this.submitButton.click();
  177 |     }
  178 |     @step()
  179 |     async getApplicationNumber() {
  180 |         return await this.applicationNumberLocator.textContent() || "";
  181 |     }
  182 |     @step()
  183 |     async validateCreditControlDetails(data: CreditControlData) {
  184 |         await this.page.waitForLoadState('domcontentloaded');
  185 |         await this.page.waitForTimeout(2000);
  186 |         await expect(this.page.locator('//div[@class="flex-grow p-6"]'), `Credit details do not contain customer: ${data.customer}`).toContainText(data.customer);
  187 |         const creditDetails = await this.page.locator('//div[@class="flex-grow p-6"]').innerText();
  188 |         expect(creditDetails, "Credit details do not contain customer acknowledgement name").toContain(data.customerAcknowledgementName);
  189 |         expect(creditDetails, "Credit details do not contain CRN no").toContain(data.crnNo);
  190 |         expect(creditDetails, "Credit details do not contain VAT no").toContain(data.vatNo);
  191 |         expect(creditDetails, "Credit details do not contain customer industry").toContain(data.customerIndustry);
  192 |         expect(creditDetails, "Credit details do not contain contact person").toContain(data.contactPerson);
  193 |         expect(creditDetails, "Credit details do not contain contact person position").toContain(data.contactPersonPosition);
  194 |         expect(creditDetails, "Credit details do not contain contact person number").toContain(data.contactPersonNumber);
  195 |         expect(creditDetails, "Credit details do not contain finance contact name").toContain(data.financeContactName);
  196 |         expect(creditDetails, "Credit details do not contain finance contact position").toContain(data.financeContactPosition);
  197 |         expect(creditDetails, "Credit details do not contain finance contact number").toContain(data.financeContactNumber);
  198 |         expect(creditDetails, "Credit details do not contain founder name").toContain(data.founderName);
  199 |         expect(creditDetails, "Credit details do not contain founder position").toContain(data.founderPosition);
  200 |         expect(creditDetails, "Credit details do not contain founder nationality").toContain(data.founderNationality);
  201 |         expect(creditDetails, "Credit details do not contain signatory name").toContain(data.signatoryName);
  202 |         expect(creditDetails, "Credit details do not contain bank name").toContain(data.bankName);
  203 |         expect(creditDetails, "Credit details do not contain bank branch").toContain(data.bankBranch);
  204 |         expect(creditDetails, "Credit details do not contain bank account number").toContain(data.bankAccountNumber);
  205 |         expect(creditDetails, "Credit details do not contain relationship manager").toContain(data.relationshipManager);
  206 |         expect(creditDetails, "Credit details do not contain bank contact number").toContain(data.bankContactNumber);
  207 |         expect(creditDetails, "Credit details do not contain trader name").toContain(data.traderName);
  208 |         expect(creditDetails, "Credit details do not contain trade contact number").toContain(data.tradeContactNumber);
  209 |         expect(creditDetails, "Credit details do not contain trade contact person").toContain(data.tradeContactPerson);
  210 |         expect(creditDetails, "Credit details do not contain facility enjoyed").toContain(data.facilityEnjoyed);
  211 |         expect(creditDetails, "Credit details do not contain trade email").toContain(data.tradeEmail);
  212 |         expect(creditDetails, "Credit details do not contain trade days").toContain(data.tradeDays);
  213 |         expect(creditDetails, "Credit details do not contain customer acknowledgement name").toContain(data.customerAcknowledgementName);
  214 |         expect(creditDetails, "Credit details do not contain acknowledgement designation").toContain(data.acknowledgementDesignation);
  215 |     }
  216 |     @step()
  217 |     async createSalesAssesment(data: SalesAssesmentData) {
  218 |         await this.createSalesAssessmentButton.click();
  219 |         await this.page.waitForLoadState('domcontentloaded');
  220 |         await this.proposedBHDInput.fill(data.proposedBHD);
  221 |         await this.creditPeriodInput.fill(data.creditPeriod);
  222 |         await this.selectOptionFromDropdown('Payment Terms*', data.paymentTerms);
  223 |         await this.remarksInput.fill(data.remarks);
  224 |         await this.selectOptionFromDropdown('Recommended By*', data.recommendedBy);
  225 |         await this.selectOptionFromDropdown('Account Executive*', data.accountExecutive);
  226 |         await this.selectOptionFromDropdown('Sales Manager*', data.salesManager);
  227 |         await this.createButton.click();
```