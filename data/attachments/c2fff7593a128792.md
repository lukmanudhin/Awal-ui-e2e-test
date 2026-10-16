# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: UI/sales/creditControlTest.spec.ts >> Credit Control Test E2E Flow >> Verify new sales enquiry is created successfully
- Location: tests/UI/sales/creditControlTest.spec.ts:36:9

# Error details

```
Error: Credit Status does not match

expect(locator).toBeVisible() failed

Locator: getByRole('row').getByRole('cell', { name: 'PendingFromSales', exact: true }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Credit Status does not match with timeout 15000ms
  - waiting for getByRole('row').getByRole('cell', { name: 'PendingFromSales', exact: true }).first()

```

# Test source

```ts
  1   | import { expect } from "@playwright/test";
  2   | import { test } from "../../../fixtures/baseFixtures";
  3   | import { ENV } from "../../../utils/ENV";
  4   | import { CreditControlData, FinanceAssesmentData, getCreditControlData, getFinanceAssesmentData, getSalesAssesmentData, SalesAssesmentData } from "../../../testData/creditControlData";
  5   | import { SalesOrderAPI } from "../../../API/salesOrderAPI";
  6   | 
  7   | test.describe('Credit Control Test E2E Flow', () => {
  8   |     let creditControlData: CreditControlData;
  9   |     let salesAssesmentData: SalesAssesmentData;
  10  |     let financeAssesmentData: FinanceAssesmentData
  11  |     test.setTimeout(260000);
  12  |     test.beforeEach('Login', async ({ page, loginPage, homePage, salesEnquiryPage, salesEnquiryAPI }) => {
  13  |         creditControlData = getCreditControlData();
  14  |         salesAssesmentData = getSalesAssesmentData();
  15  |         financeAssesmentData = getFinanceAssesmentData();
  16  |         const employeeName = await salesEnquiryAPI.getRandomEmployeeName();
  17  |         salesAssesmentData.recommendedBy = employeeName;
  18  |         salesAssesmentData.accountExecutive = employeeName;
  19  |         salesAssesmentData.salesManager = employeeName;
  20  | 
  21  |         await test.step('Login', async () => {
  22  |             await loginPage.launchAwalWebsite();
  23  |             await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
  24  |             await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
  25  |             console.log("Login successfull");
  26  |             await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
  27  |             await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
  28  |             await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
  29  |         });
  30  |     });
  31  | 
  32  |     test.afterEach('Delete Sales Enquiry', async ({ page }) => {
  33  |         await page.close();
  34  |     });
  35  | 
  36  |     test('Verify new sales enquiry is created successfully', async ({ creditControlPage, modules, salesEnquiryPage }) => {
  37  |         await modules.goToModule({ module: 'Finance', subModule: 'Accounts Receivable', nestedSubModule: 'Credit Control' })
  38  |         await creditControlPage.clickCreateNewCreditControl();
  39  |         await creditControlPage.createNewCreditControl(creditControlData);
  40  |         await expect(creditControlPage.successMessage('Data created successfully'), "Data created successfully message does not match").toHaveText('Data created successfully');
  41  |         await creditControlPage.search(creditControlData.customer);
  42  |         let applicationNumber = await creditControlPage.getApplicationNumber();
  43  |         await creditControlPage.search(applicationNumber);
> 44  |         await expect(creditControlPage.status('PendingFromSales'), 'Credit Status does not match').toBeVisible();
      |                                                                                                    ^ Error: Credit Status does not match
  45  |         await modules.goToModule({ module: 'Sales', subModule: 'Credit Control' });
  46  |         await creditControlPage.search(applicationNumber);
  47  |         await expect(salesEnquiryPage.status('New Request'), 'Credit Status does not match').toBeVisible();
  48  |         await creditControlPage.clickViewIcon();
  49  |         await creditControlPage.validateCreditControlDetails(creditControlData);
  50  |         await creditControlPage.createSalesAssesment(salesAssesmentData);
  51  |         await expect(creditControlPage.successMessage('Sales department created successfully'), "Sales department created successfully message does not match").toHaveText('Sales department created successfully');
  52  |         await creditControlPage.search(applicationNumber);
  53  |         await expect(salesEnquiryPage.status('Pending For Approval'), 'Credit Status does not match').toBeVisible();
  54  |         await modules.goToModule({ subModule: 'Credit Control (Manager)' });
  55  |         await salesEnquiryPage.search(applicationNumber);
  56  |         await expect(creditControlPage.status('Pending For Approval'), 'Credit Status does not match').toBeVisible();
  57  |         await creditControlPage.clickViewIcon();
  58  |         await creditControlPage.validateCreditControlDetails(creditControlData);
  59  |         await creditControlPage.goToTab('Sales Department Assessment');
  60  |         await creditControlPage.validateSalesAssesmentDetails(salesAssesmentData);
  61  |         await creditControlPage.approveCreditControlAndValidateAPI(200);
  62  |         await expect(creditControlPage.successMessage('Credit Control approved successfully'), "Credit Control approved successfully message does not match").toHaveText('Credit Control approved successfully');
  63  |         await creditControlPage.goToTab('History');
  64  |         await creditControlPage.search(applicationNumber);
  65  |         await expect(creditControlPage.status('Approved'), 'Credit Status does not match').toBeVisible();
  66  |         await modules.goToModule({ module: 'Finance', nestedSubModule: 'Credit Control' });
  67  |         await creditControlPage.search(applicationNumber);
  68  |         await expect(creditControlPage.status('Sales Approved'), 'Credit Status does not match').toBeVisible();
  69  |         await creditControlPage.clickEditIcon();
  70  |         await creditControlPage.goToTab('Customer Form');
  71  |         await creditControlPage.validateCreditControlDetails(creditControlData);
  72  |         await creditControlPage.goToTab('Sales Department Assessment');
  73  | 
  74  |         await creditControlPage.validateSalesAssesmentDetails(salesAssesmentData);
  75  | 
  76  |         await creditControlPage.goToTab('Finance Department Assessment');
  77  |         await creditControlPage.submitFinanceDepartmentAssesment(financeAssesmentData);
  78  |         await expect(creditControlPage.successMessage('Data created successfully'), "Data created successfully message does not match").toHaveText('Data created successfully');
  79  |         await creditControlPage.search(applicationNumber);
  80  |         await expect(creditControlPage.status('Pending For Approval'), 'Credit Status does not match').toBeVisible();
  81  |         await modules.goToModule({ nestedSubModule: 'Credit Control (Manager)' });
  82  |         await salesEnquiryPage.search(applicationNumber);
  83  |         await expect(creditControlPage.status('Pending For Approval'), 'Credit Status does not match').toBeVisible();
  84  |         await creditControlPage.clickViewIcon();
  85  |         await creditControlPage.goToTab('Customer Form');
  86  |         await creditControlPage.validateCreditControlDetails(creditControlData);
  87  |         await creditControlPage.goToTab('Sales Department Assessment');
  88  | 
  89  |         await creditControlPage.validateSalesAssesmentDetails(salesAssesmentData);
  90  | 
  91  |         await creditControlPage.goToTab('Finance Department Assessment');
  92  |         await creditControlPage.validateFinanceAssesmentDetails(financeAssesmentData);
  93  |         await creditControlPage.approveFinanceAssesmentAndValidateAPI(200);
  94  |         await expect(creditControlPage.successMessage('Data updated successfully'), "Data updated successfully message does not match").toHaveText('Data updated successfully');
  95  |         await creditControlPage.search(applicationNumber);
  96  |         await expect(creditControlPage.status('Approved'), 'Credit Control Status does not match').toBeVisible();
  97  |         await creditControlPage.goToHistory();
  98  |         
  99  |         await creditControlPage.search(applicationNumber);
  100 |         await expect(creditControlPage.status('Approved'), 'Credit Control Status does not match').toBeVisible();
  101 | 
  102 |         await modules.goToModule({ nestedSubModule: 'Credit Control' });
  103 |         await creditControlPage.search(applicationNumber);
  104 |         await expect(creditControlPage.status('Approved'), 'Credit Control Status does not match').toBeVisible();
  105 |         await creditControlPage.clickViewIcon();
  106 |         await creditControlPage.validateTabVisible('Customer Form');
  107 |         await creditControlPage.validateTabVisible('Sales Department Assessment');
  108 |         await creditControlPage.validateTabVisible('Finance Department Assessment');
  109 |     });
  110 | });
```