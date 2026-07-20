import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";
import { addBOQData } from "../../../testData/addBoqData";
import { Utils } from "../../../utils/utils";

test.describe.serial('Verify Sales Order Manager rejects the sales order', () => {
    test.setTimeout(550000);
    let enquiryId: string;
    let createEnquiryData: SalesEnquiryData;
    let extId: string;

    test.beforeEach('Login, Create Sales Enquiry and create PPJO', async ({ loginPage, homePage, salesEnquiryPage, productsPage, ppjoPage, page }) => {
        createEnquiryData = getCreateEnquiryData();
        await test.step('Login and open Sales Enquiry module', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
        });

        await test.step('Create enquiry and save Acrylic product details', async () => {
            await salesEnquiryPage.clickCreateEnquiryButton();
            await expect(salesEnquiryPage.createSalesEnquiryTitle, "Create Sales Enquiry title does not match").toHaveText('Create Sales Enquiry');
            createEnquiryData.product = ['Acrylic Products'];
            await salesEnquiryPage.enterCustomerName(createEnquiryData);
            await salesEnquiryPage.createSalesEnquiry(createEnquiryData);
            extId = await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
            await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
            console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
            await productsPage.validateProductTabsListed(createEnquiryData.product);
            await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
            await salesEnquiryPage.search(createEnquiryData.customerName);
            await expect(salesEnquiryPage.enquiryStatus, "Sales enquiry status does not match").toHaveText('Enquiry Created');
        });

        await test.step('Create PPJO and submit Artwork, AutoCAD, Site Visit, Procurement, and Estimation requests', async () => {
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
            await ppjoPage.requestSiteVisit('EMP00287 - Neelamegam Subramani');
            await ppjoPage.validatePPJOAPI(201, 'Request Site Visit');
            await expect(ppjoPage.successMessage('Site-visit request submitted successfully'), "Request Site Visit success message does not match").toContainText('Site-visit request submitted successfully');
            await ppjoPage.requestProcurement();
            await ppjoPage.validatePPJOAPI(201, 'Request Procurement');
            await expect(ppjoPage.successMessage('Procurement request submitted successfully'), "Request Procurement success message does not match").toContainText('Procurement request submitted successfully');
            await ppjoPage.requestEstimation();
            await ppjoPage.validatePPJOAPI(201, 'Request Estimation');
            await expect(ppjoPage.successMessage('Estimation request submitted successfully'), "Request Estimation success message does not match").toContainText('Estimation request submitted successfully');
        });
    });

    test.afterEach('Cleanup: delete created Sales Enquiry', async ({ page, salesEnquiryAPI }) => {
        await test.step('Cleanup: delete created Sales Enquiry', async () => {
            await page.close();
            await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
        });
    });

    test('Verify Sales Order Manager rejects the sales order and the rejection is confirmed successfully', async ({ page, ppjoPage, modules, salesEnquiryPage, salesOrderManagerPage, costEstimationPage, invoiceRequestPage, quotationManagerPage, requestNormalPage, requestApprovalPage }) => {
        await test.step('Return to Sales Enquiry and Validate Sales Enquiry status', async () => {
            await ppjoPage.goBackFromPPJO();
            await expect(page, "Sales Enquiry list page was not opened after going back from PPJO").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            enquiryId = await salesEnquiryPage.search(createEnquiryData.customerName);
        });

        await test.step('Verify that the estimation request is displayed in the Estimation - Request (Normal) list', async () => {
            await modules.goToModule({ module: 'Estimation', subModule: 'Request (Normal)' });
            const enqId = await salesEnquiryPage.search(enquiryId);
            expect(enqId, 'Enquiry not found in Estimation - Request (Normal)').toBe(enquiryId);
            console.log('Enquiry found in Estimation - Request (Normal)');
        });

        await test.step('Verify generate cost estimation and validate request attachments', async () => {
            await requestNormalPage.clickGenerateCostEstimation();
            // commented because of a bug
            // await expect(costEstimationPage.costEstimationTitle, "Create Cost Estimation title does not match").toContainText('Create Cost Estimation');
        });

        await test.step('Verify that BOQ is created and BOQ details are generated successfully', async () => {
            await costEstimationPage.clickAddEstimation();
            // commented because of a bug
            // await expect(costEstimationPage.costEstimationTitle, "Create Cost Estimation title does not match").toContainText('Create Cost Estimation');
            await expect(costEstimationPage.timeLine, "Default Timeline is not 00:00:00 Sec").toContainText('00:00:00 Sec');
            await costEstimationPage.addBOQ(addBOQData);
            await costEstimationPage.validateAddBOQAPI(201);
            await expect(costEstimationPage.successMessage('BOQ created successfully'), "BOQ creation success message does not match").toContainText('BOQ created successfully');
            await expect(costEstimationPage.timeLine, "Timeline is not updated").not.toContainText('00:00:00 Sec');
            await expect(costEstimationPage.submitApprovalButton, "Submit for approval button is not disabled").toBeDisabled();
            await costEstimationPage.clickGenerateCostEstimationAndValidateBOQ_API(200);
            await expect(costEstimationPage.boqDetailsTitle, "BOQ Details title does not match").toContainText('BOQ Details');
            await expect(costEstimationPage.addBOMBtn, "Add BOM button is not disabled").toBeDisabled();
        });

        await test.step('Verify consumables, BOM, and BOL entries are added successfully', async () => {
            await costEstimationPage.addConsumables('3');
            await costEstimationPage.validateConsumablesAPI(200);
            await expect(costEstimationPage.successMessage('Consumable percentage updated successfully'), "Consumable percentage updated success message does not match").toContainText('Consumable percentage updated successfully');
            await expect(costEstimationPage.addBOMBtn, "Add BOM button is not enabled").toBeEnabled();
            await costEstimationPage.addBOM('ALUMINIUM SHEET 3MX1.53MX2.5MM- FASCIA', '3', '1');
            await costEstimationPage.validateAddBOM_API(201);
            await expect(costEstimationPage.successMessage('BOM created successfully'), "BOM creation success message does not match").toContainText('BOM created successfully');
            await costEstimationPage.goToTab('BOL - Bill of Labour');
            await costEstimationPage.editDesignStudio('5', '6', '7', '3');
            await costEstimationPage.validateLabourAndCostingAPI(200);
            await costEstimationPage.editMetalFabrication('4', '3', '2', '1');
            await costEstimationPage.validateLabourAndCostingAPI(200);
            await costEstimationPage.editElectrical('5', '6', '7', '3');
            await costEstimationPage.validateLabourAndCostingAPI(200);
            await costEstimationPage.editCutting('4', '3', '2', '1');
            await costEstimationPage.validateLabourAndCostingAPI(200);
        });

        await test.step('Verify BOQ summary is saved successfully with variation', async () => {
            await costEstimationPage.goToTab('Summary');
            await expect(costEstimationPage.variationValueCell, "Variation value is not 0.000").toContainText('0.000');
            await costEstimationPage.enterVariation('1');
            await expect(costEstimationPage.variationValueCell, "Variation value is not 0.000").not.toContainText('0.000');
            await costEstimationPage.submitSummaryAndValidateCreateSummaryAPI(201);
            await expect(costEstimationPage.successMessage('Summary saved successfully'), "Summary saved successfully message does not match").toContainText('Summary saved successfully');
        });

        await test.step('Verify that packing cost is generated and packing BOM is added successfully', async () => {
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

        await test.step('Verify that packing labour is added and the packing summary is saved successfully', async () => {
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

        await test.step('Cost Distribution: Verify sample cost and cost distribution are saved successfully', async () => {
            await costEstimationPage.goToTab('Cost Distribution');
            await costEstimationPage.enterSampleCost('3');
            await costEstimationPage.editCostDistributionTable();
            await costEstimationPage.validateCreateCostDistributionAPI(201);
            await expect(costEstimationPage.successMessage('Cost update packing saved'), "Cost Distribution creation success message does not match").toContainText('Cost update packing saved');
            await expect(costEstimationPage.saveButton, 'Save button is not disabled').toBeDisabled();
        });

        await test.step('Summary: Verify that the incentive summary is calculated and saved successfully', async () => {
            await costEstimationPage.goToTab('Summary');
            await costEstimationPage.editSummary(createEnquiryData, '3', '2', '4');
            await costEstimationPage.validateCalculateSummaryAPI(200);
            await expect(costEstimationPage.successMessage('Summary with incentive saved'), "Summary saved successfully message does not match").toContainText('Summary with incentive saved');
        });

        await test.step('Price Indication Slip: Verify Price Indication Slip is saved and Version 1 is submitted for approval successfully', async () => {
            await costEstimationPage.goToTab('Price Indication Slip');
            await expect(costEstimationPage.submitApprovalButton, "Submit for approval button is not disabled").toBeDisabled();
            await costEstimationPage.savePriceIndicationSlipAndValidateAPI(200);
            await expect(costEstimationPage.successMessage('Price indication slip saved successfully'), "Price indication slip saved successfully message does not match").toContainText('Price indication slip saved successfully');
            await expect(costEstimationPage.submitApprovalButton, "Submit for approval button is not enabled").toBeEnabled();
            await costEstimationPage.submitForApprovalAndValidateAPI(200);
            await expect(costEstimationPage.successMessage('Version 1 submitted'), "Submit for approval success message does not match").toContainText('Version 1 submitted');
        });

        await test.step('Verify estimation status in Request Normal is updated to Pending For Approval after submission', async () => {
            await costEstimationPage.goBackToEstimationListPage();
            await salesEnquiryPage.search(enquiryId);
            await expect(requestNormalPage.estimationStatus, "Pending For Approval status does not match").toHaveText('Pending For Approval');
        });

        await test.step('Verify that the cost estimation is approved and submitted to Sales successfully with Approved status reflected in history', async () => {
            await modules.goToModule({ subModule: 'Request Approval' });
            await expect(requestNormalPage.requestNormalTab, "Request Normal tab should be selected after opening Request Approval").toHaveAttribute('aria-selected', 'true');
            await requestApprovalPage.clickViewCostEstimation(enquiryId);
            await requestApprovalPage.clickViewCostEstimationAndValidateAPI(200);
            await costEstimationPage.goToTab('Summary');
            await costEstimationPage.goToTab('Price Indication Slip');
            await requestApprovalPage.approveEstimationAndValidateAPI(200);
            await expect(requestApprovalPage.successMessage('Estimation approved successfully'), "Estimation approved successfully message does not match").toContainText('Estimation approved successfully');
            await expect(requestApprovalPage.approvedStatus, 'Approved status is not visible').toBeVisible();
            await requestApprovalPage.submitToSalesAndValidateAPI(200);
            await expect(requestApprovalPage.successMessage('Submitted to sales successfully'), "Submitted to sales successfully message does not match").toContainText('Submitted to sales successfully');
            await costEstimationPage.goToTab('History');
            await requestApprovalPage.search(enquiryId);
            await expect(requestApprovalPage.approvedStatus, 'Approved status is not visible').toHaveText('Approved');
        });


        await test.step('Verify that the Sales Enquiry status moves to Quotation Pending and the quotation is generated and submitted for approval', async () => {
            await modules.goToModule({ module: 'Sales', subModule: 'Sales Enquiry' });
            await salesEnquiryPage.search(enquiryId);
            await expect(salesEnquiryPage.enquiryStatus, "Quotation Pending status does not match in sales enquiry").toHaveText('Quotation Pending');
            await salesEnquiryPage.clickViewIcon();
            await expect(salesEnquiryPage.viewEnquiryTitle, "View Enquiry Title is does not contain View Enquiry").toContainText('View Enquiry');
            await salesEnquiryPage.goToTab('PPJO');
            await salesEnquiryPage.clickViewIcon();
            await expect(ppjoPage.viewEstimationBtn, "View Estimation button should be enabled in PPJO view").toBeEnabled();
            await ppjoPage.selectEstimationVersion('Version 1', 'Option');
            await ppjoPage.generateQuotationAndValidateAPI(201);
            // delivery date has been removed
            // await ppjoPage.editDate(createEnquiryData.date);
            // await expect(ppjoPage.printButton, "Print button is not visible after requesting estimation").toBeVisible();
            await ppjoPage.submitQuotationForApprovalAndValidateAPI(200);
        });

        await test.step('Quotation Manager: Verify Quotation Manager approves the quotation and the Approved status is reflected', async () => {
            await modules.goToModule({ subModule: 'Quotation (Manager)' });
            await quotationManagerPage.search(enquiryId);
            await quotationManagerPage.clickViewIcon();
            await ppjoPage.validateBOQDetailsTable(addBOQData);
            // await expect(quotationManagerPage.deliveryDate(createEnquiryData.date), "Delivery date is not updated in quotation manager").toContainText(`${createEnquiryData.date}`);
            await quotationManagerPage.managerApprovalQuotationAndValidateAPI(200);
            await expect(quotationManagerPage.successMessage('Quotation approved successfully'), "Quotation approved successfully message does not match").toContainText('Quotation approved successfully');
            await quotationManagerPage.goToTab('History');
            await quotationManagerPage.search(enquiryId);
            await expect(quotationManagerPage.quotationStatus, 'Quotation approved status does not match').toHaveText('Approved');
        });

        await test.step('Quotation: Verify send quotation to customer and advance invoice request is submitted successfully', async () => {
            await modules.goToModule({ subModule: 'Quotation' });
            await quotationManagerPage.search(enquiryId);
            await expect(quotationManagerPage.quotationStatus, 'Quotation status does not match').toContainText('Quotation - Approved by Manager');
            await quotationManagerPage.clickViewIcon();
            await ppjoPage.validateBOQDetailsTable(addBOQData);
            // await expect(quotationManagerPage.deliveryDate(createEnquiryData.date), "Delivery date is not updated in quotation manager").toContainText(`${createEnquiryData.date}`);
            await quotationManagerPage.sendToCustomerAndValidateAPI(200);
            await expect(quotationManagerPage.successMessage('Quotation sent to customer successfully'), "Quotation sent to customer success message does not match").toContainText('Quotation sent to customer successfully');
            await quotationManagerPage.setQuotationStatus('Approved');
            await expect(quotationManagerPage.successMessage('Approval submitted successfully'), "Approval submitted successfully message does not match").toContainText('Approval submitted successfully');
            await expect(quotationManagerPage.customerApprovalTable, "Customer approval attachment is not visible").toHaveCount(2);
            await quotationManagerPage.sendAdvanceInvoiceAndValidateAPI(201);
        });

        await test.step('Invoice Request: Verify advance invoice is created from Invoice Request and the status is updated to Completed', async () => {
            await modules.goToModule({ module: 'Finance', subModule: 'Accounts Receivable', nestedSubModule: 'Invoice Request' });
            await invoiceRequestPage.search(createEnquiryData.customerName);
            await expect(invoiceRequestPage.invoiceStatus, "Invoice status does not match").toContainText('New Request');
            await invoiceRequestPage.clickCreateInvoiceBtn();
            await invoiceRequestPage.selectInvoiceDate(createEnquiryData.date);
            await invoiceRequestPage.createInvoiceAndValidateAPI(200);
            await expect(invoiceRequestPage.successMessage('Invoice created successfully'), "Invoice created successfully message does not match").toContainText('Invoice created successfully');
            await modules.goToModule({ nestedSubModule: 'Invoice Request' });
            await invoiceRequestPage.search(createEnquiryData.customerName);
            //commented because of a bug 
            // await expect(invoiceRequestPage.invoiceStatus, "Invoice status does not match").toContainText('Completed');
            await expect(invoiceRequestPage.viewInvoiceBtn, "View invoice button is not visible").toBeVisible();
        });

        await test.step('Invoice Register: Verify Invoice Register is approved by the Manager and acknowledged with the acknowledgement status updated to Yes', async () => {
            await modules.goToModule({ nestedSubModule: 'Invoice Request (Manager)' });
            await invoiceRequestPage.search(createEnquiryData.customerName);
            await expect(invoiceRequestPage.acknowledgementStatus, "Invoice status does not match").toContainText('No');
            await invoiceRequestPage.clickViewIcon();
            await invoiceRequestPage.approveInvoiceRequestAndValidateAPI(200);
            await expect(invoiceRequestPage.successMessage('Data created successfully'), "Invoice approval success message does not match").toContainText('Data created successfully');
            await modules.goToModule({ nestedSubModule: 'Invoice Register' });
            await invoiceRequestPage.search(createEnquiryData.customerName);
            await expect(invoiceRequestPage.invoiceStatus, "Invoice status does not match").toContainText('Approved');
            await invoiceRequestPage.acknowledgeInvoiceRequest();
            await invoiceRequestPage.validateAcknowledgementAPI(200);
            await expect(invoiceRequestPage.successMessage('Invoice register upload file'), "Invoice acknowledgement success message does not match").toContainText('Invoice register upload file');
            await expect(invoiceRequestPage.acknowledgementStatus, "Invoice status does not match").toContainText('Yes');
        });

        await test.step('Verify sales order checklist is generated from customer approved quotation and sales order is created successfully', async () => {
            await modules.goToModule({ module: 'Sales', subModule: 'Quotation' });
            await quotationManagerPage.search(enquiryId);
            await expect(quotationManagerPage.quotationStatus, 'Quotation status does not match').toContainText('Customer Approved');
            await quotationManagerPage.clickViewIcon();
            // await expect(quotationManagerPage.deliveryDate(createEnquiryData.date), "Delivery date is not updated in quotation manager").toContainText(`${createEnquiryData.date}`);
            await quotationManagerPage.validateViewAdvanceInvoiceAPI(200);
            await quotationManagerPage.generateChecklist(createEnquiryData);
            await quotationManagerPage.validateSubmitCheckListAPI(201);
            await expect(quotationManagerPage.successMessage('Sales order created'), "Sales order created success message does not match").toContainText('Sales order created');
        });

        await test.step('Verify Sales Order Manager approves the checklist', async () => {
            await modules.goToModule({ subModule: 'Sales Order (Manager)' });
            await salesOrderManagerPage.search(enquiryId);
            await salesOrderManagerPage.verifySalesOrderStatus('Pending Check List Approval');
            await salesOrderManagerPage.clickViewIcon();
            await salesOrderManagerPage.approveSalesOrderCheckListAndValidateAPI(200);
            await expect(salesOrderManagerPage.successMessage('Sales Order Checklist approved successfully'), "Checklist approved successfully message does not match").toContainText('Sales Order Checklist approved successfully');
        });

        await test.step('Verify that the sales order is submitted for approval and the status is updated to Pending Sales Order Approval', async () => {
            await modules.goToModule({ subModule: 'Sales Order' });
            await salesOrderManagerPage.search(enquiryId);
            await expect(salesOrderManagerPage.salesOrderApproveStatus, "Sales order status does not match").toHaveText('Sales Checklist Approved by Manager');
            await salesOrderManagerPage.clickViewIcon();
            await salesOrderManagerPage.sendSalesOrderForApprovalAndValidateAPI(200);
            await expect(salesOrderManagerPage.successMessage('Sales Order sent for approval successfully'), "Sales order sent for approval message does not match").toContainText('Sales Order sent for approval successfully');
            await salesOrderManagerPage.search(enquiryId);
            await expect(salesOrderManagerPage.salesOrderApproveStatus, "Sales order status does not match").toHaveText('Pending Sales Order Approval');
        });

        await test.step('Verify Sales Order Manager rejects the sales order and the rejection is confirmed successfully', async () => {
            await modules.goToModule({ subModule: 'Sales Order (Manager)' });
            await salesOrderManagerPage.search(enquiryId);
            await expect(salesOrderManagerPage.salesOrderStatus, "Sales order status does not match").toHaveText('Pending Sales Order Approval');
            await salesOrderManagerPage.clickViewIcon();
            await salesOrderManagerPage.rejectSalesOrderAndValidateAPI(200);
            await expect(salesOrderManagerPage.successMessage('Sales Order rejected successfully'), "Sales order rejected message does not match").toContainText('Sales Order rejected successfully');
            await salesOrderManagerPage.goToTab('History');
            await salesOrderManagerPage.search(enquiryId);
            await expect(salesOrderManagerPage.salesOrderStatus, 'Sales order status does not match').toContainText('Reject');
        });

        await test.step('Verify Sales Checklist Rejected by Manager status is reflected in sales enquiry', async () => {
            await modules.goToModule({ module: 'Sales', subModule: 'Sales Enquiry' });
            await salesEnquiryPage.search(enquiryId);
            await expect(salesEnquiryPage.enquiryStatus, "Sales order rejected status does not match in sales enquiry").toContainText('Sales Order Rejected by Manager');
        });
    });
});