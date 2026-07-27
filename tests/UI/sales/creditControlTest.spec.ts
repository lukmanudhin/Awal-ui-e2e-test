import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { CreditControlData, FinanceAssesmentData, getCreditControlData, getFinanceAssesmentData, getSalesAssesmentData, SalesAssesmentData } from "../../../testData/creditControlData";
import { SalesOrderAPI } from "../../../API/salesOrderAPI";

test.describe('Credit Control Test E2E Flow', () => {
    let creditControlData: CreditControlData;
    let salesAssesmentData: SalesAssesmentData;
    let financeAssesmentData: FinanceAssesmentData
    test.setTimeout(260000);
    test.beforeEach('Login', async ({ page, loginPage, homePage, salesEnquiryPage, salesEnquiryAPI }) => {
        creditControlData = getCreditControlData();
        salesAssesmentData = getSalesAssesmentData();
        financeAssesmentData = getFinanceAssesmentData();
        const employeeName = await salesEnquiryAPI.getRandomEmployeeName();
        salesAssesmentData.recommendedBy = employeeName;
        salesAssesmentData.accountExecutive = employeeName;
        salesAssesmentData.salesManager = employeeName;

        await test.step('Login', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
        });
    });

    test.afterEach('Delete Sales Enquiry', async ({ page }) => {
        await page.close();
    });

    test('Verify new sales enquiry is created successfully', async ({ creditControlPage, modules, salesEnquiryPage }) => {
        await modules.goToModule({ module: 'Finance', subModule: 'Accounts Receivable', nestedSubModule: 'Credit Control' })
        await creditControlPage.clickCreateNewCreditControl();
        await creditControlPage.createNewCreditControl(creditControlData);
        await expect(creditControlPage.successMessage('Data created successfully'), "Data created successfully message does not match").toHaveText('Data created successfully');
        await creditControlPage.search(creditControlData.customer);
        let applicationNumber = await creditControlPage.getApplicationNumber();
        await creditControlPage.search(applicationNumber);
        await expect(creditControlPage.status, 'Credit Status does not match').toHaveText('PendingFromSales');
        await modules.goToModule({ module: 'Sales', subModule: 'Credit Control' });
        await creditControlPage.search(applicationNumber);
        await expect(salesEnquiryPage.enquiryStatus, 'Credit Status does not match').toHaveText('New Request');
        await creditControlPage.clickViewIcon();
        await creditControlPage.validateCreditControlDetails(creditControlData);
        await creditControlPage.createSalesAssesment(salesAssesmentData);
        await expect(creditControlPage.successMessage('Sales department created successfully'), "Sales department created successfully message does not match").toHaveText('Sales department created successfully');
        await creditControlPage.search(applicationNumber);
        await expect(salesEnquiryPage.enquiryStatus, 'Credit Status does not match').toHaveText('Pending For Approval');
        await modules.goToModule({ subModule: 'Credit Control (Manager)' });
        await salesEnquiryPage.search(applicationNumber);
        await expect(creditControlPage.status, 'Credit Status does not match').toHaveText('Pending For Approval');
        await creditControlPage.clickViewIcon();
        await creditControlPage.validateCreditControlDetails(creditControlData);
        await creditControlPage.goToTab('Sales Department Assessment');
        await creditControlPage.validateSalesAssesmentDetails(salesAssesmentData);
        await creditControlPage.approveCreditControlAndValidateAPI(200);
        await expect(creditControlPage.successMessage('Credit Control approved successfully'), "Credit Control approved successfully message does not match").toHaveText('Credit Control approved successfully');
        await creditControlPage.goToTab('History');
        await creditControlPage.search(applicationNumber);
        await expect(creditControlPage.status, 'Credit Status does not match').toHaveText('Approved');
        await modules.goToModule({ module: 'Finance', nestedSubModule: 'Credit Control' });
        await creditControlPage.search(applicationNumber);
        await expect(creditControlPage.status, 'Credit Status does not match').toHaveText('Sales Approved');
        await creditControlPage.clickEditIcon();
        await creditControlPage.goToTab('Customer Form');
        await creditControlPage.validateCreditControlDetails(creditControlData);
        await creditControlPage.goToTab('Sales Department Assessment');

        await creditControlPage.validateSalesAssesmentDetails(salesAssesmentData);

        await creditControlPage.goToTab('Finance Department Assessment');
        await creditControlPage.submitFinanceDepartmentAssesment(financeAssesmentData);
        await expect(creditControlPage.successMessage('Data created successfully'), "Data created successfully message does not match").toHaveText('Data created successfully');
        await creditControlPage.search(applicationNumber);
        await expect(creditControlPage.status, 'Credit Status does not match').toHaveText('Pending For Approval');
        await modules.goToModule({ nestedSubModule: 'Credit Control (Manager)' });
        await salesEnquiryPage.search(applicationNumber);
        await expect(creditControlPage.status, 'Credit Status does not match').toHaveText('Pending For Approval');
        await creditControlPage.clickViewIcon();
        await creditControlPage.goToTab('Customer Form');
        await creditControlPage.validateCreditControlDetails(creditControlData);
        await creditControlPage.goToTab('Sales Department Assessment');

        await creditControlPage.validateSalesAssesmentDetails(salesAssesmentData);

        await creditControlPage.goToTab('Finance Department Assessment');
        await creditControlPage.validateFinanceAssesmentDetails(financeAssesmentData);
        await creditControlPage.approveFinanceAssesmentAndValidateAPI(200);
        await expect(creditControlPage.successMessage('Data updated successfully'), "Data updated successfully message does not match").toHaveText('Data updated successfully');
        await creditControlPage.search(applicationNumber);
        await expect(creditControlPage.status, 'Credit Control Status does not match').toHaveText('Approved');
        await creditControlPage.goToHistory();
        
        await creditControlPage.search(applicationNumber);
        await expect(creditControlPage.status, 'Credit Control Status does not match').toHaveText('Approved');

        await modules.goToModule({ nestedSubModule: 'Credit Control' });
        await creditControlPage.search(applicationNumber);
        await expect(creditControlPage.status, 'Credit Control Status does not match').toHaveText('Approved');
        await creditControlPage.clickViewIcon();
        await creditControlPage.validateTabVisible('Customer Form');
        await creditControlPage.validateTabVisible('Sales Department Assessment');
        await creditControlPage.validateTabVisible('Finance Department Assessment');
    });
});