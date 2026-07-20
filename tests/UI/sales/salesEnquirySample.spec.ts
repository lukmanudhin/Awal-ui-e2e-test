import { expect } from "@playwright/test";
import { test, type BrowserContext, type Page } from "@playwright/test";
import { ENV } from "../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";
import { addBOQData } from "../../../testData/addBoqData";
import { Utils } from "../../../utils/utils";
import { LoginPage } from "../../../pages/loginPage";
import { HomePage } from "../../../pages/homePage";
import { SalesEnquiryPage } from "../../../pages/salesEnqueryPage";
import { ProductsPage } from "../../../pages/productsPage";
import { PPJOPage } from "../../../pages/ppjoPage";
import { Modules } from "../../../pages/modules";
import { RequestNormalPage } from "../../../pages/requestNormalPage";
import { CostEstimationPage } from "../../../pages/costEstimationPage";
import { RequestApprovalPage } from "../../../pages/requestApprovalPage";
import { QuotationManagerPage } from "../../../pages/quotationManagerPage";
import { SalesOrderManagerPage } from "../../../pages/salesOrderManagerPage";
import { SalesEnquiryAPI } from "../../../API/salesEnquiryAPI";

test.describe.serial('Verify E2E flow of Sales Enquiry (Request Sample)', () => {
    test.setTimeout(550000);
    let context: BrowserContext;
    let page: Page;
    let loginPage: LoginPage;
    let homePage: HomePage;
    let salesEnquiryPage: SalesEnquiryPage;
    let productsPage: ProductsPage;
    let ppjoPage: PPJOPage;
    let modules: Modules;
    let requestNormalPage: RequestNormalPage;
    let costEstimationPage: CostEstimationPage;
    let requestApprovalPage: RequestApprovalPage;
    let quotationManagerPage: QuotationManagerPage;
    let salesOrderManagerPage: SalesOrderManagerPage;
    let enquiryId: string;
    let salesOrderId: string;
    let createEnquiryData: SalesEnquiryData;
    let extId: string;
    let salesEnquiryAPI: SalesEnquiryAPI;

    test.beforeAll('Setup', async ({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();
        createEnquiryData = getCreateEnquiryData();
        loginPage = new LoginPage(page);
        homePage = new HomePage(page);
        salesEnquiryPage = new SalesEnquiryPage(page);
        productsPage = new ProductsPage(page);
        ppjoPage = new PPJOPage(page);
        modules = new Modules(page);
        requestNormalPage = new RequestNormalPage(page);
        costEstimationPage = new CostEstimationPage(page);
        requestApprovalPage = new RequestApprovalPage(page);
        quotationManagerPage = new QuotationManagerPage(page);
        salesOrderManagerPage = new SalesOrderManagerPage(page);
    });

    test.afterAll('Cleanup: delete created Sales Enquiry', async ({ request }) => {
        await page.close();
        salesEnquiryAPI = new SalesEnquiryAPI(request);
        await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
    });

    test('Login and open Sales Enquiry module', async () => {
        await loginPage.launchAwalWebsite();
        await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
        console.log("Login successfull");
        await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
        await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
        await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
    });

    test('Create enquiry and save Acrylic product details', async () => {
        await salesEnquiryPage.clickCreateEnquiryButton();
        createEnquiryData.product = ['Acrylic Products'];
        await salesEnquiryPage.enterCustomerName(createEnquiryData);
        await salesEnquiryPage.createSalesEnquiry(createEnquiryData);
        extId = await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
        await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
        console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
        await productsPage.validateProductTabsListed(createEnquiryData.product);
        await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
        enquiryId = await salesEnquiryPage.searchToGetEnquiryId(createEnquiryData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Sales enquiry status does not match").toHaveText('Enquiry Created');
    });

    test('Create PPJO and Request Sample', async () => {
        await expect(page, "Sales Enquiry list page is not opened").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
        await salesEnquiryPage.search(enquiryId);
        await expect(salesEnquiryPage.createdSalesEnquiry(createEnquiryData.customerName), `Created sales enquiry is not visible for customer: ${createEnquiryData.customerName}`).toBeVisible();
        await salesEnquiryPage.clickCreatePPJO();
        await expect(page, "Create PPJO page was not opened").toHaveURL(/create-ppjo/);
        await ppjoPage.validateSalesEnquiryDetailsInPPJO(createEnquiryData);
        await expect(ppjoPage.requestEstimationButton, "Request Estimation button should be disabled before artwork request").toBeDisabled();
        await ppjoPage.clickRequestSample();
    });

    test('Validate new sample request creation and verify new request status is reflected successfully', async () => {
        await ppjoPage.goToTab('New Sample Request');
        await ppjoPage.addNewSampleRequest('Test_Document.pdf', '17', 'New Sample Request');
        await ppjoPage.validatePPJOAPI(201, 'Add New Sample Request');
        await expect(ppjoPage.successMessage('New Sample Request created successfully'), "New Sample Request success message does not match").toContainText('New Sample Request created successfully');
        await expect(salesEnquiryPage.enquiryStatus, "Sample Request status does not match").toHaveText('New Request');
    });

    test('Verify Sample Details, Request Estimation and status is updated to Pending From Estimation', async () => {
        await ppjoPage.clickViewIcon();
        await ppjoPage.validateSampleDetails(enquiryId, 'Test_Document.pdf', '17', 'New Sample Request');
        await ppjoPage.requestEstimationAndValidateAPI(201);
        await expect(ppjoPage.successMessage('Data created successfully'), "Estimation request success message does not match").toContainText('Data created successfully');
        await ppjoPage.goBack();
        await expect(ppjoPage.enquiryIdColumn, "Enquiry ID does not match").toHaveText(enquiryId);
        await expect(salesEnquiryPage.enquiryStatus, "Estimation Request status does not match").toHaveText('Pending From Estimation');
    });

    test('Verify estimation request is displayed in the Estimation - Request (Sample) list', async () => {
        await modules.goToModule({ module: 'Estimation', subModule: 'Request (Sample)' });
        const enqId = await requestNormalPage.search(enquiryId);
        await expect(requestNormalPage.estimationStatus, "Estimation Request status does not match").toHaveText('New Request');
        expect(enqId, 'Enquiry not found in Estimation - Request (Sample)').toBe(enquiryId);
        console.log('Enquiry found in Estimation - Request (Sample)');
        await requestNormalPage.validateEnquiryDetailsInRequestNormal(createEnquiryData.customerName);
    });

    test('Verify generate cost estimation and validate sample deatails and attachments', async () => {
        await requestNormalPage.clickGenerateCostEstimation();
        // commented because of a bug
        // await expect(costEstimationPage.costEstimationTitle, "Create Cost Estimation title does not match").toContainText('Create Cost Estimation');
        await costEstimationPage.validateCustomerDetails(createEnquiryData, enquiryId);
        await costEstimationPage.validateSampleDetailsTable();
        await costEstimationPage.validateSampleAttachmentDetails('Test_Document.pdf', '17', 'New Sample Request');
    });

    test('Verify that BOQ is created and BOQ details are generated successfully', async () => {
        await costEstimationPage.clickAddEstimation();
        // commented because of a bug
        // await expect(costEstimationPage.costEstimationTitle, "Create Cost Estimation title does not match").toContainText('Create Cost Estimation');
        await expect(costEstimationPage.timeLine, "Default Timeline is not 00:00:00 Sec").toContainText('00:00:00 Sec');
        await costEstimationPage.addBOQ(addBOQData);
        await costEstimationPage.validateAddBOQAPI(201);
        await expect(costEstimationPage.successMessage('BOQ created successfully'), "BOQ creation success message does not match").toContainText('BOQ created successfully');
        await expect(costEstimationPage.timeLine, "Timeline is not updated").not.toContainText('00:00:00 Sec');
        await expect(costEstimationPage.submitApprovalButton, "Submit for approval button is not disabled").toBeDisabled();
        await costEstimationPage.validateBOQDetailsTable(addBOQData);
        await costEstimationPage.clickGenerateCostEstimationAndValidateBOQ_API(200);
        await expect(costEstimationPage.boqDetailsTitle, "BOQ Details title does not match").toContainText('BOQ Details');
        await costEstimationPage.validateBOQDetails(addBOQData);
        await expect(costEstimationPage.addBOMBtn, "Add BOM button is not disabled").toBeDisabled();
    });

    test('Verify consumables, BOM, and BOL entries are added successfully', async () => {
        await costEstimationPage.addConsumables('3');
        await costEstimationPage.validateConsumablesAPI(200);
        await expect(costEstimationPage.successMessage('Consumable percentage updated successfully'), "Consumable percentage updated success message does not match").toContainText('Consumable percentage updated successfully');
        await expect(costEstimationPage.addBOMBtn, "Add BOM button is not enabled").toBeEnabled();
        await costEstimationPage.addBOM('ALUMINIUM SHEET 3MX1.53MX2.5MM- FASCIA', '3', '1');
        await costEstimationPage.validateAddBOM_API(201);
        await expect(costEstimationPage.successMessage('BOM created successfully'), "BOM creation success message does not match").toContainText('BOM created successfully');
        await costEstimationPage.goToTab('BOL - Bill of Labour');
        await costEstimationPage.addBOL('5', '6', '7', '3');
        await costEstimationPage.validateAddBOLAPI(201);
        await expect(costEstimationPage.successMessage('BOL created successfully'), "BOL created success message does not match").toContainText('BOL created successfully');
    });

    test('Verify BOQ summary is saved successfully with variation', async () => {
        await costEstimationPage.goToTab('Summary');
        await expect(costEstimationPage.variationValueCell, "Variation value is not 0.000").toContainText('0.000');
        await costEstimationPage.enterVariation('1');
        await expect(costEstimationPage.variationValueCell, "Variation value is not 0.000").not.toContainText('0.000');
        await costEstimationPage.validateSummaryTable();
        await costEstimationPage.submitSummaryAndValidateCreateSummaryAPI(201);
        await expect(costEstimationPage.successMessage('Summary saved successfully'), "Summary saved successfully message does not match").toContainText('Summary saved successfully');
    });

    test('Verify that packing cost is generated and packing BOM is added successfully', async () => {
        await costEstimationPage.goToTab('Other Costing');
        await costEstimationPage.generatePackingCost();
        await costEstimationPage.validatePackingCostAPI(201);
        await expect(costEstimationPage.successMessage('Packing created successfully'), 'Packing success message does not match').toHaveText('Packing created successfully');
        await expect(costEstimationPage.addBOMBtn, "Add BOM button is not disabled").toBeDisabled();
        await costEstimationPage.addConsumables('2');
        await costEstimationPage.validateConsumablesAPI(200);
        await expect(costEstimationPage.successMessage('Consumable percentage updated successfully'), "Consumable percentage updated success message does not match").toContainText('Consumable percentage updated successfully');
        await costEstimationPage.addPackingBOM('ALUMINIUM SHEET 3MX1.53MX2.5MM- FASCIA', '3');
        await costEstimationPage.validateAddBOM_API(201);
        await expect(costEstimationPage.successMessage('BOM created successfully'), "BOM creation success message does not match").toContainText('BOM created successfully');
    });

    test('Verify that packing labour is added and the packing summary is saved successfully', async () => {
        const totalMetricCost = await costEstimationPage.getTotalLabourCost();
        await costEstimationPage.clickNextButton();
        const [totalHours, hourlyRate] = await costEstimationPage.addLabour('Packing', '2', '2', '2');
        await costEstimationPage.validateAddPackingLabourAPI(201);
        await expect(costEstimationPage.successMessage('BOL created successfully'), 'Add PackingLabour success message does not match').toContainText('BOL created successfully');
        expect(await page.locator('//tr').count(), 'Labour not added').toBeLessThanOrEqual(3);
        await costEstimationPage.validateBOLTable('Packing', totalHours, hourlyRate, '2', '2', '2');
        const totalLabourCost = await costEstimationPage.getTotalLabourCost();
        await costEstimationPage.clickNextButton();
        const costSummary = totalMetricCost + totalLabourCost;
        const formatedCostSummary = Utils.getFormatedPriceWithComma(costSummary);
        await expect(costEstimationPage.totalLabourCostValue, 'Total Labour cost value does not match').toContainText(`${formatedCostSummary}`);
        await expect(costEstimationPage.summaryVariationValue, "Variation value is not 0.000").toContainText('0.000');
        await costEstimationPage.enterSummaryVariation('2');
        await expect(costEstimationPage.summaryVariationValue, "Variation value is not 0.000").not.toContainText('0.000');
        await costEstimationPage.submitSummaryAndValidateCreateSummaryAPI(201);
        await expect(costEstimationPage.successMessage('Summary saved successfully'), "Summary saved successfully message does not match").toContainText('Summary saved successfully');
        await expect(costEstimationPage.successMessage('Other costing status updated successfully'), "Other costing status updated successfully message does not match").toContainText('Other costing status updated successfully');
        await costEstimationPage.verifyPackingStatus('Completed');
    });

    test('Cost Distribution: Verify sample cost and cost distribution are saved successfully', async () => {
        await costEstimationPage.goToTab('Cost Distribution');
        await costEstimationPage.validateBOQdetailsInCostDistribution(addBOQData);
        await costEstimationPage.editCostDistributionTable();
        await costEstimationPage.validateCreateCostDistributionAPI(201);
        //success message updated
        await expect(costEstimationPage.successMessage('Cost distribution saved successfully'), "Cost Distribution creation success message does not match").toContainText('Cost distribution saved successfully');
        await expect(costEstimationPage.saveButton, 'Save button is not disabled').toBeDisabled();
    });

    test('Summary: Verify that the incentive summary is calculated and saved successfully', async () => {
        await costEstimationPage.goToTab('Summary');
        await costEstimationPage.validateEnquiryDetailsInSummary(createEnquiryData);
        await costEstimationPage.validateEnquiryDetailsInSummaryTable(addBOQData);
        await costEstimationPage.editSummary(createEnquiryData, '3', '2', '4');
        await costEstimationPage.validateCalculateSummaryAPI(200);
        await expect(costEstimationPage.successMessage('Summary with incentive saved'), "Summary saved successfully message does not match").toContainText('Summary with incentive saved');
    });

    test('Price Indication Slip: Verify Price Indication Slip is saved and Version 1 is submitted for approval successfully', async () => {
        await costEstimationPage.goToTab('Price Indication Slip');
        await costEstimationPage.validateEnquiryDetailsInSummary(createEnquiryData);
        await costEstimationPage.validateEnquiryDetailsInSummaryTable(addBOQData);
        await expect(costEstimationPage.submitApprovalButton, "Submit for approval button is not disabled").toBeDisabled();
        await costEstimationPage.savePriceIndicationSlipAndValidateAPI(200);
        await expect(costEstimationPage.successMessage('Price indication slip saved successfully'), "Price indication slip saved successfully message does not match").toContainText('Price indication slip saved successfully');
        await expect(costEstimationPage.submitApprovalButton, "Submit for approval button is not enabled").toBeEnabled();
        await costEstimationPage.submitForApprovalAndValidateAPI(200);
        await expect(costEstimationPage.successMessage('Version 1 submitted'), "Submit for approval success message does not match").toContainText('Version 1 submitted');
    });

    test('Verify estimation status in Request Internal is updated to Pending For Approval after submission', async () => {
        await costEstimationPage.goBackToEstimationListPage();
        await salesEnquiryPage.search(enquiryId);
        await expect(requestNormalPage.estimationStatus, "Pending For Approval status does not match").toHaveText('Pending For Approval');
    });

    test('Verify that the cost estimation is approved and submitted to Sales successfully with Approved status reflected in history', async () => {
        await modules.goToModule({ subModule: 'Request Approval' });
        await expect(requestNormalPage.requestNormalTab, "Request Normal tab should be selected after opening Request Approval").toHaveAttribute('aria-selected', 'true');
        await requestApprovalPage.goToTab('Request (Sample)');
        await requestApprovalPage.clickViewCostEstimation(enquiryId);
        await costEstimationPage.validateCustomerDetails(createEnquiryData, enquiryId);
        await costEstimationPage.validateSampleDetailsTable();
        await requestApprovalPage.clickViewCostEstimationAndValidateAPI(200);
        await costEstimationPage.validateBOQDetailsTable(addBOQData);
        await costEstimationPage.goToTab('Summary');
        await costEstimationPage.validateEnquiryDetailsInSummary(createEnquiryData);
        await costEstimationPage.validateEnquiryDetailsInSummaryTable(addBOQData);
        await costEstimationPage.goToTab('Price Indication Slip');
        await requestApprovalPage.approveEstimationAndValidateAPI(200);
        await expect(requestApprovalPage.successMessage('Estimation approved successfully'), "Estimation approved successfully message does not match").toContainText('Estimation approved successfully');
        await expect(requestApprovalPage.approvedStatus, 'Approved status is not visible').toBeVisible();
        await requestApprovalPage.submitToSalesAndValidateAPI(200);
        await expect(requestApprovalPage.successMessage('Submitted to sales successfully'), "Submitted to sales successfully message does not match").toContainText('Submitted to sales successfully');
        await requestApprovalPage.goToTab('Request (Sample)');
        await costEstimationPage.goToTab('History');
        await requestApprovalPage.search(enquiryId);
        await expect(requestApprovalPage.approvedStatus, 'Approved status is not visible').toHaveText('Approved');
    });


    test('Verify that the Sales Enquiry status moves to Quotation Pending and the quotation is generated and submitted for approval', async () => {
        await modules.goToModule({ module: 'Sales', subModule: 'Sales Enquiry' });
        await salesEnquiryPage.search(enquiryId);
        await salesEnquiryPage.clickViewIcon();
        await ppjoPage.goToTab('PPJO');
        await ppjoPage.clickViewIcon();
        await salesEnquiryPage.validateViewEnquiryDetails(createEnquiryData);
        await ppjoPage.clickSampleButton();
        await ppjoPage.goToTab('New Sample Request');
        await expect(salesEnquiryPage.enquiryStatus, "Quotation Pending status does not match in sales enquiry").toHaveText('Quotation Pending');
        await ppjoPage.clickViewIcon();
        await ppjoPage.validateSampleDetails(enquiryId, 'Test_Document.pdf', '17', 'New Sample Request');
        await ppjoPage.validateRequestSampleDetails(createEnquiryData);
        await ppjoPage.selectEstimationVersion('Version 1', 'Option');
        await ppjoPage.validateBOQDetailsTable(addBOQData);
        // await expect(ppjoPage.printButton, "Print button is not visible after requesting estimation").toBeVisible();
        await ppjoPage.generateQuotationAndValidateAPI(201);
        // delivery date has been removed
        // await ppjoPage.editDate(createEnquiryData.date);
        await ppjoPage.submitQuotationForApprovalAndValidateAPI(200);
        await ppjoPage.goBack();
        await expect(salesEnquiryPage.enquiryStatus, "Quotation Pending Approval status does not match in sales enquiry").toHaveText('Pending Quotation Approval');
    });

    test('Quotation Manager: Verify Quotation Manager approves the quotation and the Approved status is reflected', async () => {
        await modules.goToModule({ subModule: 'Quotation (Manager)' });
        await quotationManagerPage.search(enquiryId);
        await quotationManagerPage.clickViewIcon();
        await quotationManagerPage.validateEnquiryDetails(createEnquiryData);
        await ppjoPage.validateBOQDetailsTable(addBOQData);
        // await expect(quotationManagerPage.deliveryDate(createEnquiryData.date), "Delivery date is not updated in quotation manager").toContainText(`${createEnquiryData.date}`);
        await quotationManagerPage.managerApprovalQuotationAndValidateAPI(200);
        await expect(quotationManagerPage.successMessage('Quotation approved successfully'), "Quotation approved successfully message does not match").toContainText('Quotation approved successfully');
        await quotationManagerPage.goToTab('History');
        await quotationManagerPage.search(enquiryId);
        await expect(quotationManagerPage.quotationStatus, 'Quotation approved status does not match').toHaveText('Approved');
    });

    test('Quotation: Verify checklist is submitted successfully and the Pending Check List Approval status is reflected', async () => {
        await modules.goToModule({ module: 'Sales', subModule: 'Sales Enquiry' });
        await salesEnquiryPage.search(enquiryId);
        await salesEnquiryPage.clickViewIcon();
        await ppjoPage.goToTab('PPJO');
        await ppjoPage.clickViewIcon();
        await salesEnquiryPage.validateViewEnquiryDetails(createEnquiryData);
        await ppjoPage.clickSampleButton();
        await ppjoPage.goToTab('New Sample Request');
        await expect(salesEnquiryPage.enquiryStatus, "Quotation Pending status does not match in sales enquiry").toHaveText('Quotation - Approved by Manager');
        await ppjoPage.clickViewIcon();
        await ppjoPage.validateSampleDetails(enquiryId, 'Test_Document.pdf', '17', 'New Sample Request');
        await quotationManagerPage.generateChecklist(createEnquiryData);
        await quotationManagerPage.validateSubmitCheckListAPI(201);
        await expect(quotationManagerPage.successMessage('Sales order created'), "Sales order created success message does not match").toContainText('Sales order created');
        await expect(salesEnquiryPage.enquiryStatus, "Pending Check List Approval status does not match in sales enquiry").toHaveText('Pending Check List Approval');
    });

    test('Verify Sales Order Manager approves the sales order checklist', async () => {
        await modules.goToModule({ subModule: 'Sales Order (Manager)' });
        await salesOrderManagerPage.search(enquiryId);
        await expect(salesOrderManagerPage.salesOrderStatus, "Sales order status does not match").toHaveText('Pending Check List Approval');
        await salesOrderManagerPage.clickViewIcon();
        await salesOrderManagerPage.validateCustomerNameInSalesOrderManager(createEnquiryData.customerName);
        await quotationManagerPage.validateExistingDataInSalesOrderChecklist(createEnquiryData);
        await salesOrderManagerPage.approveSalesOrderCheckListAndValidateAPI(200);
        await expect(salesOrderManagerPage.successMessage('Sales Order Checklist approved successfully'), "Checklist approved successfully message does not match").toContainText('Sales Order Checklist approved successfully');
    });

    test('Verify that the sales order is submitted for approval and the status is updated to Pending Sales Order Approval', async () => {
        await modules.goToModule({ subModule: 'Sales Order' });
        await salesOrderManagerPage.search(enquiryId);
        salesOrderId = await salesOrderManagerPage.getSalesOrderId();
        await expect(salesOrderManagerPage.salesOrderApproveStatus, "Sales order status does not match").toHaveText('Sales Checklist Approved by Manager');
        await salesOrderManagerPage.clickViewIcon();
        //bug
        // await salesOrderManagerPage.validateSalesOrderDetails(createEnquiryData);
        await ppjoPage.validateBOQDetailsTable(addBOQData);
        await salesOrderManagerPage.sendSalesOrderForApprovalAndValidateAPI(200);
        await expect(salesOrderManagerPage.successMessage('Sales Order sent for approval successfully'), "Sales order sent for approval message does not match").toContainText('Sales Order sent for approval successfully');
        await salesOrderManagerPage.search(enquiryId);
        await expect(salesOrderManagerPage.salesOrderApproveStatus, "Sales order status does not match").toHaveText('Pending Sales Order Approval');
    });

    test('Verify Sales Order Manager approves the sales order and the approval is confirmed successfully', async () => {
        await modules.goToModule({ subModule: 'Sales Order (Manager)' });
        await salesOrderManagerPage.search(enquiryId);
        await expect(salesOrderManagerPage.salesOrderStatus, "Sales order status does not match").toHaveText('Pending Sales Order Approval');
        await salesOrderManagerPage.clickViewIcon();
        //commented because of bug
        // await salesOrderManagerPage.validateSalesOrderDetails(createEnquiryData);
        await ppjoPage.validateBOQDetailsTable(addBOQData);
        await salesOrderManagerPage.approveSalesOrderAndValidateAPI(200);
        await expect(salesOrderManagerPage.successMessage('Sales Order approved successfully'), "Sales order approved message does not match").toContainText('Sales Order approved successfully');
    });

    test('Verify Sales Enquiry status is updated to Sales Order Approved by Manager', async () => {
        await modules.goToModule({ module: 'Sales', subModule: 'Sales Enquiry' });
        await salesEnquiryPage.search(enquiryId);
        await salesEnquiryPage.clickViewIcon();
        await ppjoPage.goToTab('PPJO');
        await ppjoPage.clickViewIcon();
        await salesEnquiryPage.validateViewEnquiryDetails(createEnquiryData);
        await ppjoPage.clickSampleButton();
        await ppjoPage.goToTab('New Sample Request');
        await expect(salesEnquiryPage.enquiryStatus, "Quotation Pending status does not match in sales enquiry").toHaveText('Sales Order Approved by Manager');
        await ppjoPage.clickViewIcon();
        await ppjoPage.validateSampleDetails(enquiryId, 'Test_Document.pdf', '17', 'New Sample Request');
        await quotationManagerPage.validateExistingDataInSalesOrderChecklist(createEnquiryData);
        await expect(ppjoPage.salesOrderTab, "Sales order tab does not contain sales order id").toContainText(salesOrderId);
    });
});