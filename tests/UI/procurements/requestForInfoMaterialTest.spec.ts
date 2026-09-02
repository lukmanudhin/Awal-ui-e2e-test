import { test, expect } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";
import { addBOQData } from "../../../testData/addBoqData";
import { getMaterialPayload } from "../../../API-payloads/createMaterialPayload";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";


test.describe('Request For Info - Material End-to-End Scenarios', () => {
    let createEnquiryData: SalesEnquiryData;
    let MIRDetails: CreateMIRData;
    let extId: string;
    let enquiryId: string;
    let accessToken: string;
    let createdMaterialId: string;
    let material: string;
    test.setTimeout(360000);

    test.beforeEach('Create Sales Enquiry', async ({ salesEnquiryPage, productsPage, loginPage, page, homePage, createMaterialAPI, salesEnquiryAPI }) => {
        MIRDetails = getMIRDetails();
        createEnquiryData = getCreateEnquiryData();
        createEnquiryData.product = ['Acrylic Products'];

        await test.step('Create a raw material through API', async () => {
            accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            const materialPayload = getMaterialPayload();
            createdMaterialId = await createMaterialAPI.createMaterial(accessToken, materialPayload);
            material = materialPayload.materialName;
            MIRDetails.material = material;
            console.log(`Material created: "${materialPayload.materialName}"`);
        });

        await test.step('Login and navigate to Sales Enquiry', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
        });

        await test.step('Create a sales enquiry', async () => {
            await salesEnquiryPage.clickCreateEnquiryButton();
            await expect(salesEnquiryPage.createSalesEnquiryTitle, "Create Sales Enquiry title does not match").toHaveText('Create Sales Enquiry');
            await salesEnquiryPage.enterCustomerName(createEnquiryData);
            await salesEnquiryPage.createSalesEnquiry(createEnquiryData);
            extId = await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
            await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
            console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
        });

        await test.step('Enter and save the selected product details', async () => {
            await productsPage.validateProductTabsListed(createEnquiryData.product);
            await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
            await expect(page, "Sales Enquiry list page is not opened").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
        });
    });

    test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryAPI, page, createMaterialAPI }) => {
        await page.close();
        if (createdMaterialId) {
            await createMaterialAPI.deleteMaterial(accessToken, createdMaterialId);
        }
        await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
    });

    test('Verify an out of stock material in a cost estimation is procured through a vendor quote comparison and the awarded vendor price reflects in the BOQ unit cost', async ({ salesEnquiryPage, ppjoPage, page, modules, requestNormalPage, costEstimationPage, procurementPage }) => {

        await test.step('Create PPJO and raise procurement and estimation requests', async () => {
            await salesEnquiryPage.search(createEnquiryData.customerName);
            await expect(salesEnquiryPage.createdSalesEnquiry(createEnquiryData.customerName), `Created sales enquiry is not visible for customer: ${createEnquiryData.customerName}`).toBeVisible();
            await salesEnquiryPage.clickCreatePPJO();
            await expect(page, "Create PPJO page was not opened").toHaveURL(/create-ppjo/);
            await ppjoPage.validateSalesEnquiryDetailsInPPJO(createEnquiryData);
            await ppjoPage.requestProcurement();
            await ppjoPage.validatePPJOAPI(201, 'Request Procurement');
            await expect(ppjoPage.successMessage('Procurement request submitted successfully'), "Request Procurement success message does not match").toContainText('Procurement request submitted successfully');
            await ppjoPage.requestEstimation();
            await ppjoPage.validatePPJOAPI(201, 'Request Estimation');
            await expect(ppjoPage.successMessage('Estimation request submitted successfully'), "Request Estimation success message does not match").toContainText('Estimation request submitted successfully');
        });

        await test.step('Verify the enquiry moves to Pending From Estimation', async () => {
            await modules.goToModule({ subModule: 'Sales Enquiry' });
            await expect(page, "Sales Enquiry list page was not opened after going back from PPJO").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            enquiryId = await salesEnquiryPage.search(createEnquiryData.customerName);
            await salesEnquiryPage.validateCustomerStatus(createEnquiryData.customerName, 'Pending From Estimation');
        });

        await test.step('Open the cost estimation from Estimation - Request (Normal)', async () => {
            await modules.goToModule({ module: 'Estimation', subModule: 'Request (Normal)' });
            const enqId = await salesEnquiryPage.search(enquiryId);
            expect(enqId, 'Enquiry not found in Estimation - Request (Normal)').toBe(enquiryId);
            await requestNormalPage.clickGenerateCostEstimation();
            await expect(costEstimationPage.costEstimationTitle, "Create Cost Estimation title does not match").toContainText('Create Cost Estimation');
        });

        await test.step('Add a BOQ and verify the BOQ details', async () => {
            await costEstimationPage.clickAddEstimation();
            await costEstimationPage.addBOQ(addBOQData);
            await costEstimationPage.validateAddBOQAPI(201);
            await expect(costEstimationPage.successMessage('BOQ created successfully'), "BOQ creation success message does not match").toContainText('BOQ created successfully');
            await costEstimationPage.clickGenerateCostEstimationAndValidateBOQ_API(200);
            await expect(costEstimationPage.boqDetailsTitle, "BOQ Details title does not match").toContainText('BOQ Details');
            await costEstimationPage.validateBOQDetails(addBOQData);
        });

        await test.step('Add consumables percentage', async () => {
            await costEstimationPage.addConsumables('3');
            await costEstimationPage.validateConsumablesAPI(200);
            await expect(costEstimationPage.successMessage('Consumable percentage updated successfully'), "Consumable percentage updated success message does not match").toContainText('Consumable percentage updated successfully');
        });

        await test.step('Add the out of stock material to the BOM', async () => {
            await expect(costEstimationPage.addBOMBtn, "Add BOM button is not enabled").toBeEnabled();
            MIRDetails.quantity = '30';
            await costEstimationPage.addBOM(material, MIRDetails.quantity, '1');
            await costEstimationPage.validateAddBOM_API(201);
            await expect(costEstimationPage.successMessage('BOM created successfully'), "BOM creation success message does not match").toContainText('BOM created successfully');
            await expect(costEstimationPage.status('Out of Stock'), `Stock status of material "${material}" is not Out of Stock in the BOM table`).toBeVisible();
        });

        await test.step('Enter the Bill of Labour details', async () => {
            await costEstimationPage.goToTab('BOL - Bill of Labour');
            await costEstimationPage.editBOLDepartment('Design Studio', '4', '3', '2', '1');
            await costEstimationPage.validateLabourAndCostingAPI(200);
            await costEstimationPage.editBOLDepartment('Welding', '4', '3', '2', '1');
            await costEstimationPage.validateLabourAndCostingAPI(200);
            await costEstimationPage.editBOLDepartment('Vinyl Graphics & Application', '5', '6', '7', '3');
            await costEstimationPage.validateLabourAndCostingAPI(200);
            await costEstimationPage.editBOLDepartment('Plotter Cutting', '4', '3', '2', '1');
            await costEstimationPage.validateLabourAndCostingAPI(200);
        });

        await test.step('Enter variation and submit the summary', async () => {
            await costEstimationPage.goToTab('Summary');
            await expect(costEstimationPage.variationValueCell, "Variation value is not 0.000").toContainText('0.000');
            await costEstimationPage.enterVariation('1');
            await expect(costEstimationPage.variationValueCell, "Variation value did not change after entering a variation").not.toContainText('0.000');
            await costEstimationPage.submitSummaryAndValidateCreateSummaryAPI(201);
            await expect(costEstimationPage.successMessage('Summary saved successfully'), "Summary saved successfully message does not match").toContainText('Summary saved successfully');
        });

        await test.step('Send the out of stock material to procurement', async () => {
            await costEstimationPage.goToTab('Procurement Request');
            await costEstimationPage.addMaterialAndSendToProcurement();
            await expect(costEstimationPage.successMessage('Procurement request created successfully'), "Procurement request created successfully message does not match").toContainText('Procurement request created successfully');
            await expect(costEstimationPage.status('Pending'), "procurement status does not match").toBeVisible();
        });

        await test.step('Create a vendor quotation for an existing vendor and a new temp vendor', async () => {
            await modules.goToModule({ module: 'Procurement', subModule: 'Request for Info', nestedSubModule: 'View Quotation Request' });
            await procurementPage.search(enquiryId);
            await expect(costEstimationPage.status('New Request'), "procurement status does not match").toBeVisible();
            await procurementPage.createVendorQuotation(MIRDetails.shipTo, MIRDetails.vendorQuotationVendor, { name: MIRDetails.tempVendorName, email: MIRDetails.tempVendorEmail });
            await procurementPage.validateVendorQuotationMaterialTable(MIRDetails.material, MIRDetails.quantity);
            await procurementPage.prepareVendorQuotationAndValidateAPI(201);
            await expect(procurementPage.successMessage('Vendor Quotation created successfully'), 'Vendor Quotation created successfully message does not match').toHaveText('Vendor Quotation created successfully');
        });

        await test.step('Send the vendor quote email', async () => {
            await modules.goToModule({ nestedSubModule: 'Vendor Quote Email' });
            await procurementPage.sendVendorQuoteEmailAndValidateAPI(200, enquiryId);
            await expect(procurementPage.successMessage('Email sent successfully.'), 'Email sent successfully message does not match').toHaveText('Email sent successfully.');
        });

        await test.step('Enter the quote received from the temp vendor', async () => {
            await modules.goToModule({ nestedSubModule: 'Vendor Quote Comparison' });
            MIRDetails.unitPrice = '239';
            await procurementPage.openVendorQuote(enquiryId, MIRDetails.tempVendorName);
            await procurementPage.enterVendorQuoteDetails(MIRDetails);
            await procurementPage.updateVendorQuoteAndValidateAPI(200);
            await expect(procurementPage.successMessage('Data updated successfully'), 'Data updated successfully message does not match').toHaveText('Data updated successfully');
        });

        await test.step('Enter the lower quote received from the existing vendor', async () => {
            MIRDetails.unitPrice = '236';
            await procurementPage.openVendorQuote(enquiryId, MIRDetails.vendorQuotationVendor);
            await procurementPage.enterVendorQuoteDetails(MIRDetails);
            await procurementPage.updateVendorQuoteAndValidateAPI(200);
            await expect(procurementPage.successMessage('Data updated successfully'), 'Data updated successfully message does not match').toHaveText('Data updated successfully');
        });

        await test.step('Award the quotation to the existing vendor and submit for estimation', async () => {
            await procurementPage.selectVendorAndSubmitForEstimation(enquiryId, MIRDetails.vendorQuotationVendor);
            await expect(procurementPage.successMessage('Vendor quotation award updated successfully'), 'Vendor quotation award updated successfully message does not match').toHaveText('Vendor quotation award updated successfully');
            //navigation issue
        });

        await test.step('Reopen the cost estimation and include the awarded vendor price', async () => {
            await modules.goToModule({ module: 'Estimation', subModule: 'Request (Normal)' });
            await costEstimationPage.search(enquiryId);
            await requestNormalPage.clickGenerateCostEstimation();
            await expect(costEstimationPage.costEstimationTitle, "Create Cost Estimation title does not match").toContainText('Create Cost Estimation');
            await costEstimationPage.clickAddEstimation();
            await costEstimationPage.goToTab('Procurement Request');
            await expect(costEstimationPage.status('Completed'), "procurement status does not match").toBeVisible();
            await costEstimationPage.includePrice(MIRDetails.vendorQuotationVendor, MIRDetails.unitPrice);
            await expect(costEstimationPage.successMessage('Procurement price updated successfully'), "Procurement price updated successfully message does not match").toContainText('Procurement price updated successfully');
        });

        await test.step('Verify the awarded price reflects as the BOQ unit cost', async () => {
            await costEstimationPage.goBackToBOQTab();
            await costEstimationPage.clickGenerateCostEstimationAndValidateBOQ_API(200);
            await expect(costEstimationPage.unitCostValue, `BOQ unit cost does not reflect the awarded vendor price: ${MIRDetails.unitPrice}.000`).toHaveText(`${MIRDetails.unitPrice}.000`);
        });
    });
});
