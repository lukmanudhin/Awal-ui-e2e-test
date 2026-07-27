import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getTradingData, type TradingData } from "../../../testData/tradingData";

test.describe('Create Sales Enquiry', () => {
    let tradingData: TradingData;
    let accessToken: string;
    test.setTimeout(100000);
    test.beforeEach('Login', async ({ page, loginPage, homePage, salesEnquiryPage, salesEnquiryAPI, stockViewAPI }) => {
        tradingData = getTradingData();
        accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        tradingData.material = await stockViewAPI.getMaterialWithHighStock(accessToken);
        tradingData.owner = await salesEnquiryAPI.getRandomEmployeeName();
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

    test.afterEach('Delete Sales Enquiry', async ({ tradingPage, page }) => {
        await tradingPage.deleteTradingAndValidateAPI(200);
        await expect(tradingPage.successMessage('Record deleted successfully.'), "Sales enquiry delete success message does not match").toHaveText('Record deleted successfully.');
        console.log(`Sales enquiry for ${tradingData.customerName} deleted successfully`);
        await page.close();
    });

    test('Verify new sales enquiry is created successfully', async ({ ppjoPage, modules, tradingPage, salesEnquiryPage }) => {
        await modules.goToModule({ module: "Sales", subModule: 'Counter Sales', nestedSubModule: 'Trading' });
        await tradingPage.clickCreateLeadButton();
        await tradingPage.createLead(tradingData);
        await expect(tradingPage.successMessage('Quick lead created successfully'), "Quick lead created success message does not match").toHaveText('Quick lead created successfully');
        await tradingPage.search(tradingData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Lead status does not match").toHaveText('Lead Created');
        await tradingPage.clickTrading();
        await tradingPage.addTrading(tradingData);
        await tradingPage.createTradingAndValidateAPI(201);
        await expect(tradingPage.successMessage('Material added successfully'), 'Material added success message does not match').toHaveText('Material added successfully');
        await tradingPage.validateMaterialTable(tradingData);
        await tradingPage.createOrderAndValidateAPI(200);
        await expect(tradingPage.successMessage('Trading order created successfully'), 'Trading order created success message does not match').toHaveText('Trading order created successfully');
        await ppjoPage.validateSampleDetails(tradingData.customerName, tradingData.city, tradingData.city, tradingData.customerName);
        await tradingPage.validateMaterialTable(tradingData);
        await tradingPage.requestApprovalAndValidateAPI(200);
        await expect(tradingPage.successMessage('Trading sent for approval'), 'Trading sent for approval success message does not match').toHaveText('Trading sent for approval');
        await tradingPage.search(tradingData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Lead status does not match").toHaveText('Pending For Approval');

        await modules.goToModule({ nestedSubModule: 'Trading Approval' })
        await tradingPage.search(tradingData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Lead status does not match").toHaveText('Pending For Approval');
        await tradingPage.clickTrading();
        await ppjoPage.validateSampleDetails(tradingData.customerName, tradingData.city, tradingData.city, tradingData.customerName);
        await tradingPage.validateMaterialTable(tradingData);
        await tradingPage.approveTradingInvoiceAndValidateAPI(200);
        await expect(tradingPage.successMessage('Trading approved successfully'), 'Trading approved success message does not match').toHaveText('Trading approved successfully');
        await tradingPage.goToTab('History');
        await tradingPage.search(tradingData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Lead status does not match").toHaveText('Approved');

        await modules.goToModule({ nestedSubModule: 'Trading' });
        await tradingPage.search(tradingData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Lead status does not match").toHaveText('Approved');
        await tradingPage.clickTrading();
        await ppjoPage.validateSampleDetails(tradingData.customerName, tradingData.city, tradingData.city, tradingData.customerName);
        await tradingPage.validateMaterialTable(tradingData);
        await tradingPage.enterPaymentMethodAndCampaign(tradingData);
        await tradingPage.generateInvoiceAndValidateAPI(200);
        await expect(tradingPage.successMessage('Invoice generated successfully'), 'Request for invoice generated success message does not match').toHaveText('Invoice generated successfully');

        await modules.goToModule({ nestedSubModule: 'Trading' });
        await tradingPage.search(tradingData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Lead status does not match").toHaveText('Completed');
    });
});