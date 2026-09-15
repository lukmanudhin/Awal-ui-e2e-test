import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { getVendorRegistrationData, type VendorRegistrationData } from "../../../testData/vendorRegistrationData";
import { getMaterialPayload } from "../../../API-payloads/createMaterialPayload";
import { test, expect } from "../../../fixtures/baseFixtures";

test.describe('Material Indent and Material Issue For Out of Stock Consumables With out Contract End-to-End Scenarios', () => {
    test.setTimeout(550000);
    let MIRDetails: CreateMIRData;
    let vendorData: VendorRegistrationData;
    let materialIndentRequestId: string;
    let materialIndentRequestExtId: string;
    let accessToken: string;
    let requestedBy: string;
    let createdMaterialId: string;
    let vendorExtId: string;
    let putAwayDone = false;

    test.beforeEach('Setup', async ({ page, loginPage, homePage, salesEnquiryAPI, createMaterialAPI }) => {
        MIRDetails = getMIRDetails();
        vendorData = getVendorRegistrationData();
        materialIndentRequestId = '';
        materialIndentRequestExtId = '';
        createdMaterialId = '';
        accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        vendorData.evaluatorName = await salesEnquiryAPI.getRandomEmployeeName();
        MIRDetails.employeeName = 'EMP00330-anatoly Vladimir'
        requestedBy = await salesEnquiryAPI.getLoggedInUserName(accessToken);
        vendorData.companyName = MIRDetails.tempVendorName;
        MIRDetails.requisitionType = 'Consumables';
        const materialPayload = getMaterialPayload('consumable');
        createdMaterialId = await createMaterialAPI.createMaterial(accessToken, materialPayload);
        MIRDetails.material = materialPayload.materialName;
        console.log(`Material created: "${materialPayload.materialName}"`);

        await loginPage.launchAwalWebsite();
        await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
        console.log("Login successfull");
        await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
        await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
    });

    test.afterEach('Teardown', async ({ page, salesEnquiryAPI, materialIndentRequestAPI, createMaterialAPI }, testInfo) => {
        if (testInfo.status !== 'passed' && putAwayDone) {
            await materialIndentRequestAPI.issueAvailableMaterialForMIR(accessToken, materialIndentRequestId);
        }
        await materialIndentRequestAPI.deleteMIRIfCreated(accessToken, materialIndentRequestExtId);
        if (createdMaterialId) {
            await createMaterialAPI.deleteMaterial(accessToken, createdMaterialId);
        }
        await createMaterialAPI.deleteVendorIfCreated(accessToken, vendorExtId);
        await page.close();
        await salesEnquiryAPI.dispose();
    });

    test('Verify an out of stock material with no contract is procured through a vendor quotation and issued after put away', async ({ salesEnquiryAPI, stockViewAPI, putAwayPage, grnEntryPage, procurementPage, prRequestPage, modules, materialIndentRequestPage, vendorRegistrationPage }) => {
        let prId: string;
        let poNumber: string;
        let grnNumber: string;

        await test.step('Raise a Material Indent Request for the out of stock material', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Indent Request' });
            await materialIndentRequestPage.createMaterialIndentRequest(MIRDetails);
            await materialIndentRequestPage.addConsumables(MIRDetails);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            materialIndentRequestExtId = await materialIndentRequestPage.submitMaterialIndentRequestAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Indent created successfully'), 'Material Indent created successfully success message does not found').toHaveText('Material Indent created successfully');
            materialIndentRequestId = await materialIndentRequestPage.getMaterialIndentRequestNumber();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status(MIRDetails.priority), "Priority level text does not match").toBeVisible();
            await expect(materialIndentRequestPage.status('Pending'), "MIR status text does not match").toBeVisible();
        });

        await test.step('Approve the Material Indent Request as the manager', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request (Manager)' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status(MIRDetails.priority), "Priority level text does not match").toBeVisible();
            await expect(materialIndentRequestPage.status('New Request'), "MIR status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(materialIndentRequestId, MIRDetails.pjoNumber, MIRDetails.priority, requestedBy);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.managerApprovesMaterialRequestAndValidateAPI(200);

            // improper status code
            await expect(materialIndentRequestPage.successMessage('Material Indent Requets approved successfully'), 'Material Indent Requets approved successfully success message does not found').toHaveText('Material Indent Requets approved successfully');
            await materialIndentRequestPage.goToHistory();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Approved'), "Priority level text does not match").toBeVisible();
        });

        await test.step('Verify the Material Indent Request shows as Approved in the requester list', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Approved'), "MIR status text does not match").toBeVisible();
        });

        await test.step('Verify the material cannot be issued while it is out of stock', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('New Request'), "Status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(MIRDetails.pjoNumber, 'Sales', requestedBy);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        });

        await test.step('Raise a Purchase Requisition for the shortfall', async () => {
            await modules.goToModule({ subModule: 'PR Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await prRequestPage.createPRRequestAndValidateAPI(200);
            await expect(prRequestPage.successMessage('Purchase requisition created successfully'), 'Purchase requisition created successfully success message does not found').toHaveText('Purchase requisition created successfully');
        });

        await test.step('Approve the Purchase Requisition as the manager', async () => {
            await modules.goToModule({ subModule: 'PR Request Manager' });
            prId = await prRequestPage.searchPR(MIRDetails.material);
            console.log(`PR ID: ${prId}`);
            await prRequestPage.search(prId);
            await expect(prRequestPage.status('Out Of Stock'), 'Stock status does not match').toBeVisible();
            await expect(prRequestPage.status('PO Pending'), "PR status text does not match").toBeVisible();
            await prRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await prRequestPage.approvePRRequestAndValidateAPI(200);
            await expect(prRequestPage.successMessage('Purchase requisition approved successfully'), 'Purchase requisition approved successfully success message does not found').toHaveText('Purchase requisition approved successfully');;
        });

        await test.step('Verify the approved Purchase Requisition in the Purchase Request Sheet', async () => {
            await modules.goToModule({ subModule: 'Purchase Request Sheet' });
            await prRequestPage.search(prId);
            await expect(prRequestPage.status('Out Of Stock'), 'Stock status does not match').toBeVisible();
            await expect(prRequestPage.status('PO Pending'), "PR status text does not match").toBeVisible();
            await prRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        });

        await test.step('Create a Vendor Quotation assigning an existing and a temporary vendor', async () => {
            await modules.goToModule({ module: 'Procurement', subModule: 'PR to PO', nestedSubModule: 'PR to Po (Contract)' });
            await procurementPage.goToTab('Vendor Quotation');
            await procurementPage.search(prId);
            await procurementPage.createVendorQuotation(MIRDetails.shipTo, MIRDetails.vendorQuotationVendor, { name: MIRDetails.tempVendorName, email: MIRDetails.tempVendorEmail });
            await procurementPage.validateVendorQuotationMaterialTable(MIRDetails.material, MIRDetails.quantity);
            await procurementPage.prepareVendorQuotationAndValidateAPI(201);
            await expect(procurementPage.successMessage('Vendor Quotation created successfully'), 'Vendor Quotation created successfully message does not match').toHaveText('Vendor Quotation created successfully');
        });

        await test.step('Send the Vendor Quotation to the assigned vendors', async () => {
            await modules.goToModule({ nestedSubModule: 'Vendor Quote Email' });
            await procurementPage.sendVendorQuoteEmailAndValidateAPI(200, prId);
            await expect(procurementPage.successMessage('Email sent successfully.'), 'Email sent successfully message does not match').toHaveText('Email sent successfully.');
        });

        await test.step('Record the quote received from each vendor', async () => {
            await modules.goToModule({ subModule: 'Vendor Management', nestedSubModule: 'Vendor Quote Comparison' });
            await procurementPage.openVendorQuote(prId, MIRDetails.vendorQuotationVendor);
            await procurementPage.enterVendorQuoteDetails(MIRDetails);
            await procurementPage.updateVendorQuoteAndValidateAPI(200);
            await expect(procurementPage.successMessage('Data updated successfully'), 'Data updated successfully message does not match').toHaveText('Data updated successfully');

            await procurementPage.openVendorQuote(prId, MIRDetails.tempVendorName);
            await procurementPage.enterVendorQuoteDetails(MIRDetails);
            await procurementPage.updateVendorQuoteAndValidateAPI(200);
            await expect(procurementPage.successMessage('Data updated successfully'), 'Data updated successfully message does not match').toHaveText('Data updated successfully');
        });

        await test.step('Onboard the temporary vendor into the vendor directory', async () => {
            await procurementPage.awardVendor(prId, MIRDetails.tempVendorName);
            await vendorRegistrationPage.enterGeneralInformation(vendorData);
            vendorExtId = await vendorRegistrationPage.saveAndValidateAPI(201);
            await expect(vendorRegistrationPage.successMessage('Vendor general information saved successfully'), 'Vendor general information saved successfully message does not match').toHaveText('Vendor general information saved successfully');
            await vendorRegistrationPage.enterCompanyInformation(vendorData);
            await expect(vendorRegistrationPage.successMessage('Vendor company information saved successfully'), 'Vendor company information saved successfully message does not match').toHaveText('Vendor company information saved successfully');
            await vendorRegistrationPage.enterGoodsAndServices(vendorData);
            await expect(vendorRegistrationPage.successMessage('Vendor goods/services information saved successfully'), 'Vendor goods/services information saved successfully message does not match').toHaveText('Vendor goods/services information saved successfully');
            await vendorRegistrationPage.enterBankInformation(vendorData);
            await expect(vendorRegistrationPage.successMessage('Vendor bank information saved successfully'), 'Vendor bank information saved successfully message does not match').toHaveText('Vendor bank information saved successfully');
            await vendorRegistrationPage.enterEvaluation(vendorData);
            await expect(vendorRegistrationPage.successMessage('Vendor evaluation information saved successfully'), 'Vendor evaluation information saved successfully message does not match').toHaveText('Vendor evaluation information saved successfully');
            await expect(vendorRegistrationPage.successMessage('Temporary vendor added to vendor directory'), 'Temporary vendor added to vendor directory message does not match').toHaveText('Temporary vendor added to vendor directory');
            await expect(vendorRegistrationPage.successMessage('Vendor added to the directory successfully. Please click "Award Vendor" to restart the comparison process.'), 'Vendor added to the directory successfully message does not match').toContainText('Vendor added to the directory successfully. Please click "Award Vendor" to restart the comparison process.');
        });

        await test.step('Award the onboarded vendor and submit the quote for final approval', async () => {
            await procurementPage.awardVendor(prId, MIRDetails.tempVendorName);
            await procurementPage.submitForFinalApprovalAndValidateAPI(200);
            await expect(procurementPage.successMessage('Vendor quotation award updated successfully'), 'Vendor quotation award updated successfully message does not match').toHaveText('Vendor quotation award updated successfully');
        });

        await test.step('Approve the awarded vendor quote as the manager', async () => {
            await modules.goToModule({ nestedSubModule: 'Vendor Quote Comparison (Manager)' });
            await procurementPage.search(prId);
            await procurementPage.clickViewIcon();
            await procurementPage.approveVendorQuoteAndValidateAPI(200);
            await expect(procurementPage.successMessage('Data updated successfully'), 'Data updated successfully message does not match').toHaveText('Data updated successfully');
        });

        await test.step('Verify the Purchase Order raised for the awarded vendor', async () => {
            await modules.goToModule({ nestedSubModule: 'View PO' });
            poNumber = await procurementPage.getPONumber();
            await procurementPage.search(poNumber);
            await expect(materialIndentRequestPage.status('Active'), 'View PO status does not match').toBeVisible();
            await procurementPage.clickViewIcon();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await procurementPage.validatePODetails(MIRDetails.tempVendorName, MIRDetails.orderType);
        });

        await test.step('Receive the material against the Purchase Order and complete QC', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Management', nestedSubModule: 'GRN Entry' });
            await grnEntryPage.createGRNEntry(MIRDetails.tempVendorName, poNumber, MIRDetails.quantity, MIRDetails.grnRemarks, MIRDetails.deliveryNote, MIRDetails.invoiceNumber);
            await expect(grnEntryPage.successMessage('GRN created successfully'), 'GRN created successfully message does not match').toHaveText('GRN created successfully');
            grnNumber = await grnEntryPage.getGRNNumber();
            await grnEntryPage.search(grnNumber);
            await expect(grnEntryPage.status('Not Started'), 'QC status does not match').toBeVisible();
            await expect(grnEntryPage.status('Submitted'), 'GRN status does not match').toBeVisible();
            await grnEntryPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(grnNumber, MIRDetails.tempVendorName, poNumber, 'Not Started');
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            const employeeName = await salesEnquiryAPI.getRandomEmployeeName();
            await grnEntryPage.startQC('All Quantity', MIRDetails.quantity, MIRDetails.qcFailedQuantity, employeeName, 'Pass', 'Pass', 'Pass');
            await expect(grnEntryPage.successMessage('GRN QC created successfully'), 'GRN QC created successfully message does not match').toContainText('GRN QC created successfully');
            await expect(grnEntryPage.qcCheckButton, 'QC check button is not visible').toBeVisible();
        });

        await test.step('Put away the QC passed quantity and verify the material is In Stock', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Management', nestedSubModule: 'Put Away' });
            await putAwayPage.search(grnNumber);
            await expect(putAwayPage.status('Completed'), 'QC status does not match').toBeVisible();
            await putAwayPage.clickStart();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await putAwayPage.clickPutAway();
            await putAwayPage.enterPutAwayDetails(MIRDetails.warehouse, MIRDetails.conversionUnit, MIRDetails.row, MIRDetails.rack, MIRDetails.shelf, MIRDetails.putAwayQuantity);
            await putAwayPage.submitPutAwayAndValidateAPI(201);
            await expect(putAwayPage.successMessage('Data created successfully'), 'Data created succesfully success message does not match').toHaveText('Data created successfully');
            putAwayDone = true;
            const stockAfterPutAway = await stockViewAPI.getMaterialQuantityAndStatus(accessToken, MIRDetails.material, 'Consumables');
            expect(stockAfterPutAway.currentQuantity, 'Stock quantity mismatch after put away').toBe(Number(MIRDetails.putAwayQuantity));
            expect(stockAfterPutAway.stockStatus, 'Material status does not match after put away').toBe('InStock');
        });

        await test.step('Issue the material and verify the stock returns to Out Of Stock', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('New Request'), "Status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails('Sales', MIRDetails.pjoNumber, requestedBy);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.issueMaterialAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');
            const stockAfterIssue = await stockViewAPI.getMaterialQuantityAndStatus(accessToken, MIRDetails.material, 'RawMaterials');
            expect(stockAfterIssue.currentQuantity, 'Stock quantity mismatch after material issue').toBe(0);
            expect(stockAfterIssue.stockStatus, 'Material status does not match after material issue').toBe('OutOfStock');  
        });
    });
});