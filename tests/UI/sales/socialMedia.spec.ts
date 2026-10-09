import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";
import { addBOQData } from "../../../testData/addBoqData";
import { Utils } from "../../../utils/utils";

test.describe('Verify E2E flow of Social Media', () => {
    let createEnquiryData: SalesEnquiryData;
    let extId: string;
    let enquiryId: string;
    test.setTimeout(600000);
    test.beforeEach('Login', async ({ page, loginPage, homePage, salesEnquiryPage, modules }) => {
        createEnquiryData = getCreateEnquiryData();
        await test.step('Login', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await modules.goToModule({ subModule: 'Social Media' });
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/leads/social-media/`);
            await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Social Media');
        });
    });

    test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryAPI, page }) => {
        await page.close();
        await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
    });

    test('Verify new sales enquiry is created successfully', async ({ salesEnquiryPage, productsPage, costEstimationPage, ppjoPage, page, modules, salesEnquiryAPI, requestApprovalPage, requestNormalPage, quotationManagerPage, invoiceRequestPage, salesOrderManagerPage }) => {
        await salesEnquiryPage.clickEnquiryButton();
        await salesEnquiryPage.enterCustomerName(createEnquiryData);
        await salesEnquiryPage.enterSocialMedia(createEnquiryData.socialMedia);
        await salesEnquiryPage.createSalesEnquiry(createEnquiryData);
        extId = await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
        await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
        console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
        await productsPage.validateProductTabsListed(createEnquiryData.product);
        await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
        await salesEnquiryPage.search(createEnquiryData.customerName);
        await expect(salesEnquiryPage.socialMediaImage(createEnquiryData.socialMedia === 'Instagram' ? 'Insta' : createEnquiryData.socialMedia), 'Social media image is not visible').toBeVisible();
        await expect(salesEnquiryPage.status('Enquiry Created'), "Sales enquiry status does not match").toBeVisible();

        // await expect(page, "Sales Enquiry list page is not opened").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
        // await salesEnquiryPage.search(createEnquiryData.customerName);
        // await expect(salesEnquiryPage.createdSalesEnquiry(createEnquiryData.customerName), `Created sales enquiry is not visible for customer: ${createEnquiryData.cust omerName}`).toBeVisible();
        await salesEnquiryPage.clickCreatePPJO();
        await expect(page, "Create PPJO page was not opened").toHaveURL(/create-ppjo/);
        await ppjoPage.validateSalesEnquiryDetailsInPPJO(createEnquiryData);
        await expect(ppjoPage.requestEstimationButton, "Request Estimation button should be disabled before artwork request").toBeDisabled();
        await ppjoPage.requestArtwork();
        await ppjoPage.validatePPJOAPI(201, 'Request Artwork');
        await expect(ppjoPage.successMessage('Artwork request submitted successfully'), "Request Artwork success message does not match").toContainText('Artwork request submitted successfully');
        await expect(ppjoPage.requestEstimationButton, "Request Estimation button should be enabled after artwork request").toBeEnabled();
        await ppjoPage.requestAutoCAD();
        await ppjoPage.validatePPJOAPI(201, 'Request AutoCAD');
        await expect(ppjoPage.successMessage('Autocad request submitted successfully'), "Request AutoCAD success message does not match").toContainText('Autocad request submitted successfully');
        const siteVisitor = await salesEnquiryAPI.getRandomEmployeeName();
        await ppjoPage.requestSiteVisit(siteVisitor);
        await ppjoPage.validatePPJOAPI(201, 'Request Site Visit');
        await expect(ppjoPage.successMessage('Site-visit request submitted successfully'), "Request Site Visit success message does not match").toContainText('Site-visit request submitted successfully');
        await ppjoPage.requestProcurement();
        await ppjoPage.validatePPJOAPI(201, 'Request Procurement');
        await expect(ppjoPage.successMessage('Procurement request submitted successfully'), "Request Procurement success message does not match").toContainText('Procurement request submitted successfully');
        await ppjoPage.requestEstimation();
        await ppjoPage.validatePPJOAPI(201, 'Request Estimation');
        await expect(ppjoPage.successMessage('Estimation request submitted successfully'), "Request Estimation success message does not match").toContainText('Estimation request submitted successfully');
        await ppjoPage.validatePPJOTableDetails();

        await modules.goToModule({ subModule: 'Social Media' });
        // await expect(page, "Sales Enquiry list page was not opened after going back from PPJO").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
        enquiryId = await salesEnquiryPage.search(createEnquiryData.customerName);
        await salesEnquiryPage.validateCustomerStatus(createEnquiryData.customerName, 'Pending From Estimation');
        await salesEnquiryPage.validateCustomerPPJOColumn(createEnquiryData.customerName, ['Artwork', 'Auto Cad', 'Estimation', 'Procurement', 'Site Visit']);

        await modules.goToModule({ module: 'Estimation', subModule: 'Request (Normal)' });
        const enqId = await salesEnquiryPage.search(enquiryId);
        expect(enqId, 'Enquiry not found in Estimation - Request (Normal)').toBe(enquiryId);
        console.log('Enquiry found in Estimation - Request (Normal)');
        await requestNormalPage.validateEnquiryDetailsInRequestNormal(createEnquiryData.customerName);

        await requestNormalPage.clickGenerateCostEstimation();
        await expect(costEstimationPage.costEstimationTitle, "Create Cost Estimation title does not match").toContainText('Create Cost Estimation');
        await costEstimationPage.validateEstimationDetailsTable();
        await costEstimationPage.validateCustomerDetails(createEnquiryData, enquiryId);
        await costEstimationPage.validateArtworkAttachmentDetails('Test_Document.pdf', '11', 'Artwork requirement details');
        await costEstimationPage.validateAutoCADAttachmentDetails('Test_Document.pdf', '12', 'AutoCAD requirement details');
        await costEstimationPage.validateEstimationAttachmentDetails('Test_Document.pdf', '14', 'Estimation requirement details');
        await costEstimationPage.validateProcurementAttachmentDetails('Test_Document.pdf', '13', 'Procurement requirement details');

        await costEstimationPage.clickAddEstimation();
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

        await costEstimationPage.addConsumables('3');
        await costEstimationPage.validateConsumablesAPI(200);
        await expect(costEstimationPage.successMessage('Consumable percentage updated successfully'), "Consumable percentage updated success message does not match").toContainText('Consumable percentage updated successfully');
        await expect(costEstimationPage.addBOMBtn, "Add BOM button is not enabled").toBeEnabled();
        await costEstimationPage.addBOM('ALUMINIUM SHEET 3MX1.53MX2.5MM- FASCIA', '3', '1');
        await costEstimationPage.validateAddBOM_API(201);
        await expect(costEstimationPage.successMessage('BOM created successfully'), "BOM creation success message does not match").toContainText('BOM created successfully');
        await costEstimationPage.goToTab('BOL - Bill of Labour');
        await costEstimationPage.editBOLDepartment('Design Studio', '4', '3', '2', '1');
        await costEstimationPage.validateLabourAndCostingAPI(200);
        await costEstimationPage.editBOLDepartment('Welding', '4', '3', '2', '1');
        await costEstimationPage.validateLabourAndCostingAPI(200);
        await costEstimationPage.editBOLDepartment('Vinyl Graphics & Application', '5', '6', '7', '3');
        await costEstimationPage.validateLabourAndCostingAPI(200);
        await costEstimationPage.editBOLDepartment('Plotter Cutting', '4', '3', '2', '1');
        await costEstimationPage.validateLabourAndCostingAPI(200);

        await costEstimationPage.goToTab('Summary');
        await expect(costEstimationPage.variationValueCell, "Variation value is not 0.000").toContainText('0.000');
        await costEstimationPage.enterVariation('1');
        await expect(costEstimationPage.variationValueCell, "Variation value is not 0.000").not.toContainText('0.000');
        await costEstimationPage.validateSummaryTable();
        await costEstimationPage.submitSummaryAndValidateCreateSummaryAPI(201);
        await expect(costEstimationPage.successMessage('Summary saved successfully'), "Summary saved successfully message does not match").toContainText('Summary saved successfully');

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

        const totalMetricCost = await costEstimationPage.getTotalLabourCost();
        await costEstimationPage.clickNextButton();
        const [totalHours, hourlyRate] = await costEstimationPage.addLabour('Packaging', '2', '2', '2');
        await costEstimationPage.validateAddPackingLabourAPI(201);
        await expect(costEstimationPage.successMessage('BOL created successfully'), 'Add PackingLabour success message does not match').toContainText('BOL created successfully');
        expect(await page.locator('//tr').count(), 'Labour not added').toBeLessThanOrEqual(3);
        await costEstimationPage.validateBOLTable('Packaging', totalHours, hourlyRate, '2', '2', '2');
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

        await costEstimationPage.goToTab('Cost Distribution');
        await costEstimationPage.validateBOQdetailsInCostDistribution(addBOQData);
        await costEstimationPage.enterSampleCost('3');
        await costEstimationPage.editCostDistributionTable();
        await costEstimationPage.validateCreateCostDistributionAPI(201);
        await expect(costEstimationPage.successMessage('Cost update packing saved'), "Cost Distribution creation success message does not match").toContainText('Cost update packing saved');
        await expect(costEstimationPage.saveButton, 'Save button is not disabled').toBeDisabled();

        await costEstimationPage.goToTab('Summary');
        await costEstimationPage.validateEnquiryDetailsInSummary(createEnquiryData);
        await costEstimationPage.validateEnquiryDetailsInSummaryTable(addBOQData);
        await costEstimationPage.editSummary(createEnquiryData, 'VAT ZERO SALES', 'VAT 10% (Sales)', '4');
        await costEstimationPage.validateCalculateSummaryAPI(200);
        await expect(costEstimationPage.successMessage('Summary with incentive saved'), "Summary saved successfully message does not match").toContainText('Summary with incentive saved');

        await costEstimationPage.goToTab('Price Indication Slip');
        await costEstimationPage.validateEnquiryDetailsInSummary(createEnquiryData);
        await costEstimationPage.validateEnquiryDetailsInSummaryTable(addBOQData);
        await expect(costEstimationPage.submitApprovalButton, "Submit for approval button is not disabled").toBeDisabled();
        await costEstimationPage.savePriceIndicationSlipAndValidateAPI(200);
        await expect(costEstimationPage.successMessage('Price indication slip saved successfully'), "Price indication slip saved successfully message does not match").toContainText('Price indication slip saved successfully');
        await expect(costEstimationPage.submitApprovalButton, "Submit for approval button is not enabled").toBeEnabled();
        await costEstimationPage.submitForApprovalAndValidateAPI(200);
        await expect(costEstimationPage.successMessage('Version 1 submitted'), "Submit for approval success message does not match").toContainText('Version 1 submitted');

        await modules.goToModule({ subModule: 'Request (Normal)' });
        await salesEnquiryPage.search(enquiryId);
        await expect(requestNormalPage.status('Pending For Approval'), "Pending For Approval status does not match").toBeVisible();

        await modules.goToModule({ subModule: 'Request Approval' });
        await expect(requestNormalPage.requestNormalTab, "Request Normal tab should be selected after opening Request Approval").toHaveAttribute('aria-selected', 'true');
        await requestApprovalPage.clickViewCostEstimation(enquiryId);
        await costEstimationPage.validateCustomerDetails(createEnquiryData, enquiryId);
        await costEstimationPage.validateEstimationDetailsTable();
        await costEstimationPage.validateArtworkAttachmentDetails('Test_Document.pdf', '11', 'Artwork requirement details');
        await costEstimationPage.validateAutoCADAttachmentDetails('Test_Document.pdf', '12', 'AutoCAD requirement details');
        await costEstimationPage.validateEstimationAttachmentDetails('Test_Document.pdf', '14', 'Estimation requirement details');
        await costEstimationPage.validateProcurementAttachmentDetails('Test_Document.pdf', '13', 'Procurement requirement details');
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
        await costEstimationPage.goToTab('History');
        await requestApprovalPage.search(enquiryId);
        await expect(requestApprovalPage.approvedStatus, 'Approved status is not visible').toHaveText('Approved');


        await modules.goToModule({ module: 'Sales', subModule: 'Social Media' });
        await salesEnquiryPage.search(enquiryId);
        await expect(salesEnquiryPage.status('Quotation Pending'), "Quotation Pending status does not match in sales enquiry").toBeVisible();
        await salesEnquiryPage.clickViewIcon();
        await expect(salesEnquiryPage.viewEnquiryTitle, "View Enquiry Title is does not contain View Enquiry").toContainText('View Enquiry');
        await salesEnquiryPage.validateViewEnquiryDetails(createEnquiryData);
        await salesEnquiryPage.goToTab('PPJO');
        await salesEnquiryPage.clickViewIcon();
        await salesEnquiryPage.validateViewEnquiryDetails(createEnquiryData);
        await expect(ppjoPage.viewEstimationBtn, "View Estimation button should be enabled in PPJO view").toBeEnabled();
        await ppjoPage.selectEstimationVersion('Version 1', 'Option');
        await salesEnquiryPage.validateViewEnquiryDetails(createEnquiryData);
        await ppjoPage.validateBOQDetailsTable(addBOQData);
        await ppjoPage.generateQuotationAndValidateAPI(201);
        // delivery date has been removed
        // await ppjoPage.editDate(createEnquiryData.date);
        // await expect(ppjoPage.printButton, "Print button is not visible after requesting estimation").toBeVisible();
        await ppjoPage.submitQuotationForApprovalAndValidateAPI(200);

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
        await expect(quotationManagerPage.status('Approved'), 'Quotation approved status does not match').toBeVisible();

        await modules.goToModule({ subModule: 'Quotation' });
        await quotationManagerPage.search(enquiryId);
        await expect(quotationManagerPage.status('Quotation Approved By Manager'), 'Quotation status does not match').toBeVisible();
        await quotationManagerPage.clickViewIcon();
        await quotationManagerPage.validateEnquiryDetails(createEnquiryData);
        await ppjoPage.validateBOQDetailsTable(addBOQData);
        // await expect(quotationManagerPage.deliveryDate(createEnquiryData.date), "Delivery date is not updated in quotation manager").toContainText(`${createEnquiryData.date}`);
        await quotationManagerPage.sendToCustomerAndValidateAPI(200);
        await expect(quotationManagerPage.successMessage('Quotation sent to customer successfully'), "Quotation sent to customer success message does not match").toContainText('Quotation sent to customer successfully');
        await quotationManagerPage.setQuotationStatus('Approved');
        await expect(quotationManagerPage.successMessage('Approval submitted successfully'), "Approval submitted successfully message does not match").toContainText('Approval submitted successfully');
        await expect(quotationManagerPage.customerApprovalTable, "Customer approval attachment is not visible").toHaveCount(2);
        await quotationManagerPage.sendAdvanceInvoiceAndValidateAPI(201);

        await modules.goToModule({ module: 'Finance', subModule: 'Accounts Receivable', nestedSubModule: 'Invoice Request' });
        await invoiceRequestPage.search(createEnquiryData.customerName);
        await expect(invoiceRequestPage.status('New Request'), "Invoice status does not match").toBeVisible();
        await invoiceRequestPage.clickCreateInvoiceBtn();
        await invoiceRequestPage.validateEnquiryDetails(createEnquiryData);
        await invoiceRequestPage.validateBOQTableDetails(addBOQData);
        await invoiceRequestPage.selectInvoiceDate(createEnquiryData.date);
        await invoiceRequestPage.createInvoiceAndValidateAPI(200);
        await expect(invoiceRequestPage.successMessage('Invoice created successfully'), "Invoice created successfully message does not match").toContainText('Invoice created successfully');
        await invoiceRequestPage.validateEnquiryDetails(createEnquiryData);
        await invoiceRequestPage.validateBOQTableDetails(addBOQData);
        await modules.goToModule({ nestedSubModule: 'Invoice Request' });
        await invoiceRequestPage.search(createEnquiryData.customerName);
        await expect(invoiceRequestPage.status('Pending For Approval'), "Invoice status does not match").toBeVisible();
        await expect(invoiceRequestPage.viewInvoiceBtn, "View invoice button is not visible").toBeVisible();

        await modules.goToModule({ nestedSubModule: 'Invoice Request (Manager)' });
        await invoiceRequestPage.search(createEnquiryData.customerName);
        await expect(invoiceRequestPage.status('No'), "Invoice status does not match").toBeVisible();
        await invoiceRequestPage.clickViewIcon();
        await invoiceRequestPage.validateEnquiryDetails(createEnquiryData);
        await invoiceRequestPage.validateBOQTableDetails(addBOQData);
        await invoiceRequestPage.approveInvoiceRequestAndValidateAPI(200);
        await expect(invoiceRequestPage.successMessage('Data created successfully'), "Invoice approval success message does not match").toContainText('Data created successfully');
        await modules.goToModule({ nestedSubModule: 'Invoice Register' });
        await invoiceRequestPage.search(createEnquiryData.customerName);
        await expect(invoiceRequestPage.status('Approved'), "Invoice status does not match").toBeVisible();
        await invoiceRequestPage.acknowledgeInvoiceRequest();
        await invoiceRequestPage.validateAcknowledgementAPI(200);
        await expect(invoiceRequestPage.successMessage('Invoice register upload file'), "Invoice acknowledgement success message does not match").toContainText('Invoice register upload file');
        await expect(invoiceRequestPage.status('Yes'), "Invoice status does not match").toBeVisible();

        await modules.goToModule({ module: 'Sales', subModule: 'Quotation' });
        await quotationManagerPage.search(enquiryId);
        await expect(quotationManagerPage.status('Customer Approved'), 'Quotation status does not match').toBeVisible();
        await quotationManagerPage.clickViewIcon();
        await quotationManagerPage.validateEnquiryDetails(createEnquiryData);
        await ppjoPage.validateBOQDetailsTable(addBOQData);
        // await expect(quotationManagerPage.deliveryDate(createEnquiryData.date), "Delivery date is not updated in quotation manager").toContainText(`${createEnquiryData.date}`);
        await quotationManagerPage.validateViewAdvanceInvoiceAPI(200);
        await quotationManagerPage.generateChecklist(createEnquiryData);
        await quotationManagerPage.validateSubmitCheckListAPI(201);
        await expect(quotationManagerPage.successMessage('Sales order created'), "Sales order created success message does not match").toContainText('Sales order created');

        await modules.goToModule({ subModule: 'Sales Order (Manager)' });
        await salesOrderManagerPage.search(enquiryId);
        await salesOrderManagerPage.verifySalesOrderStatus('Pending Check List Approval');
        await salesOrderManagerPage.clickViewIcon();
        await salesOrderManagerPage.validateCustomerNameInSalesOrderManager(createEnquiryData.customerName);
        await quotationManagerPage.validateExistingDataInSalesOrderChecklist(createEnquiryData);
        await costEstimationPage.validateArtworkAttachmentDetails('Test_Document.pdf', '11', 'Artwork requirement details');
        await costEstimationPage.validateAutoCADAttachmentDetails('Test_Document.pdf', '12', 'AutoCAD requirement details');
        await costEstimationPage.validateEstimationAttachmentDetails('Test_Document.pdf', '14', 'Estimation requirement details');
        await costEstimationPage.validateProcurementAttachmentDetails('Test_Document.pdf', '13', 'Procurement requirement details');
        await salesOrderManagerPage.approveSalesOrderCheckListAndValidateAPI(200);
        await expect(salesOrderManagerPage.successMessage('Sales Order Checklist approved successfully'), "Checklist approved successfully message does not match").toContainText('Sales Order Checklist approved successfully');

        await modules.goToModule({ subModule: 'Sales Order' });
        await salesOrderManagerPage.search(enquiryId);
        await expect(salesOrderManagerPage.status('Sales Checklist Approved By Manager'), "Sales order status does not match").toBeVisible();
        await salesOrderManagerPage.clickViewIcon();
        await salesOrderManagerPage.validateSalesOrderDetails(createEnquiryData);
        await ppjoPage.validateBOQDetailsTable(addBOQData);
        await salesOrderManagerPage.sendSalesOrderForApprovalAndValidateAPI(200);
        await expect(salesOrderManagerPage.successMessage('Sales Order sent for approval successfully'), "Sales order sent for approval message does not match").toContainText('Sales Order sent for approval successfully');
        await salesOrderManagerPage.search(enquiryId);
        await expect(salesOrderManagerPage.status('Pending Sales Order Approval'), "Sales order status does not match").toBeVisible();

        await modules.goToModule({ subModule: 'Sales Order (Manager)' });
        await salesOrderManagerPage.search(enquiryId);
        await expect(salesOrderManagerPage.salesOrderStatus, "Sales order status does not match").toHaveText('Pending Sales Order Approval');
        await salesOrderManagerPage.clickViewIcon();
        await salesOrderManagerPage.validateSalesOrderDetails(createEnquiryData);
        await ppjoPage.validateBOQDetailsTable(addBOQData);
        await salesOrderManagerPage.approveSalesOrderAndValidateAPI(200);
        await expect(salesOrderManagerPage.successMessage('Sales Order approved successfully'), "Sales order approved message does not match").toContainText('Sales Order approved successfully');

        await modules.goToModule({ subModule: 'Social Media' });
        await salesEnquiryPage.search(enquiryId);
        await expect(salesEnquiryPage.status('Sales Order Approved By Manager'), "Sales order approved status does not match in sales enquiry").toBeVisible();
        await salesEnquiryPage.clickViewIcon();
        await salesEnquiryPage.goToTab('Quotation');
        await expect(salesEnquiryPage.enquiryId, "Enquiry ID does not match").toHaveText(enquiryId);
        await salesEnquiryPage.goToTab('Sales Order');
        await expect(salesEnquiryPage.enquiryId, "Enquiry ID does not match").toHaveText(enquiryId);
    });
});