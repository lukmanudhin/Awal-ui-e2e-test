import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { getMaterialPayload } from "../../../API-payloads/createMaterialPayload";
import { type SeededContractMaterial } from "../../../API/contractQuoteAPI";
import { test, expect } from "../../../fixtures/baseFixtures";

test.describe('Material Indent and Material Issue End-to-End Scenario For Spare Parts Out of Stock With Active Contract', () => {
    test.setTimeout(550000);
    let MIRDetails: CreateMIRData;
    let materialIndentRequestId: string;
    let materialIndentRequestExtId: string;
    let accessToken: string;
    let requestedBy: string;
    let createdMaterialId: string;
    let contractSeed: SeededContractMaterial | null;

    test.beforeEach('Setup', async ({ page, loginPage, homePage, salesEnquiryAPI, createMaterialAPI, contractQuoteAPI }) => {
        MIRDetails = getMIRDetails();
        MIRDetails.requisitionType = 'Spare Parts';
        materialIndentRequestId = '';
        materialIndentRequestExtId = '';
        createdMaterialId = '';
        contractSeed = null;

        await test.step('Create a spare part and put it under an active contract', async () => {
            accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            requestedBy = await salesEnquiryAPI.getLoggedInUserName(accessToken);

            const uomId = await contractQuoteAPI.getUomId(accessToken, MIRDetails.uom);
            const materialPayload = getMaterialPayload('sparePart', uomId);
            createdMaterialId = await createMaterialAPI.createMaterial(accessToken, materialPayload);
            MIRDetails.material = materialPayload.materialName;
            console.log(`Spare part created: "${materialPayload.materialName}"`);

            contractSeed = await contractQuoteAPI.createActiveContractForMaterial(accessToken, {
                materialName: materialPayload.materialName,
                requisitionType: MIRDetails.requisitionType,
                uomId,
                vendorName: MIRDetails.vendorQuotationVendor,
                pjoNumber: MIRDetails.pjoNumber,
                shipTo: MIRDetails.shipTo,
                quantity: MIRDetails.quantity,
                unitPrice: MIRDetails.unitPrice,
                paymentTerms: MIRDetails.paymentTerms,
                shipmentMode: MIRDetails.shipmentMode,
                breakdownType: MIRDetails.breakDownType,
            });
            MIRDetails.vendor = contractSeed.vendorName;
        });

        await test.step('Login and navigate to Sales Enquiry', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
        });
    });

    test.afterEach('Teardown', async ({ page, salesEnquiryAPI, materialIndentRequestAPI, createMaterialAPI, contractQuoteAPI }) => {
        await materialIndentRequestAPI.deleteMIRIfCreated(accessToken, materialIndentRequestExtId);
        await contractQuoteAPI.deleteSeededContractIfCreated(accessToken, contractSeed);
        if (createdMaterialId) {
            await createMaterialAPI.deleteMaterial(accessToken, createdMaterialId);
        }
        await page.close();
        await salesEnquiryAPI.dispose();
    });

    test('Verify Material Indent Request is successfully created, approved by manager, and material is issued with All Quantity', async ({ salesEnquiryAPI, stockViewAPI, putAwayPage, grnEntryPage, procurementPage, prRequestPage, modules, materialIndentRequestPage }) => {
        let prId: string;
        let poNumber: string;
        let grnNumber: string;

        await test.step('Create a material indent request for the out of stock material', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Indent Request' });
            await materialIndentRequestPage.createMaterialIndentRequest(MIRDetails);
            await materialIndentRequestPage.addSpareParts(MIRDetails);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            materialIndentRequestExtId = await materialIndentRequestPage.submitMaterialIndentRequestAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Indent created successfully'), 'Material Indent created successfully success message does not found').toHaveText('Material Indent created successfully');
        });

        await test.step('Verify the indent request is listed with Pending status', async () => {
            materialIndentRequestId = await materialIndentRequestPage.getMaterialIndentRequestNumber();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status(MIRDetails.priority), "Priority level text does not match").toBeVisible();
            await expect(materialIndentRequestPage.status('Pending'), "MIR status text does not match").toBeVisible();
        });

        await test.step('Manager approves the material indent request', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request (Manager)' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status(MIRDetails.priority), "Priority level text does not match").toBeVisible();
            await expect(materialIndentRequestPage.status('New Request'), "MIR status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(materialIndentRequestId, 'Sales', MIRDetails.priority, requestedBy);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.managerApprovesMaterialRequestAndValidateAPI(200);
            // improper status code
            await expect(materialIndentRequestPage.successMessage('Material Indent Requets approved successfully'), 'Material Indent Requets approved successfully success message does not found').toHaveText('Material Indent Requets approved successfully');
        });

        await test.step('Verify the approval is reflected in history and in the indent request list', async () => {
            await materialIndentRequestPage.goToHistory();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Approved'), "Priority level text does not match").toBeVisible();
            await modules.goToModule({ subModule: 'Material Indent Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Approved'), "MIR status text does not match").toBeVisible();
        });

        await test.step('Verify the material cannot be issued while it is out of stock', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('New Request'), "Status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(MIRDetails.requisitionType, 'Sales', requestedBy);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await expect(materialIndentRequestPage.status('Out Of Stock'), "Stock status text does not match").toBeVisible();
            await expect(materialIndentRequestPage.issuingQuantity, 'Issuing quantity field is not disabled for Out Of Stock materials').toBeDisabled();
        });

        await test.step('Raise a purchase requisition for the out of stock material', async () => {
            await modules.goToModule({ subModule: 'PR Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await prRequestPage.createPRRequestAndValidateAPI(200);
            await expect(prRequestPage.successMessage('Purchase requisition created successfully'), 'Purchase requisition created successfully success message does not found').toHaveText('Purchase requisition created successfully');
        });

        await test.step('PR manager approves the purchase requisition', async () => {
            await modules.goToModule({ subModule: 'PR Request Manager' });
            prId = await prRequestPage.searchPR(MIRDetails.material);
            console.log(`PR ID: ${prId}`);
            await prRequestPage.search(prId);
            await expect(prRequestPage.status('Out Of Stock'), 'Stock status does not match').toBeVisible();
            await expect(prRequestPage.status('PO Pending'), "PR status text does not match").toBeVisible();
            await prRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await prRequestPage.approvePRRequestAndValidateAPI(200);
            await expect(prRequestPage.successMessage('Purchase requisition approved successfully'), 'Purchase requisition approved successfully success message does not found').toHaveText('Purchase requisition approved successfully');
        });

        await test.step('Verify the purchase requisition in the Purchase Request Sheet', async () => {
            await modules.goToModule({ subModule: 'Purchase Request Sheet' });
            await prRequestPage.search(prId);
            await expect(prRequestPage.status('Out Of Stock'), 'Stock status does not match').toBeVisible();
            await expect(prRequestPage.status('PO Pending'), "PR status text does not match").toBeVisible();
            await prRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        });

        await test.step('Add purchase order remarks in PR to PO (Contract)', async () => {
            await modules.goToModule({ module: 'Procurement', subModule: 'PR to PO', nestedSubModule: 'PR to Po (Contract)' });
            await procurementPage.search(prId);
            await expect(procurementPage.status('New Request'), 'Stock status does not match').toBeVisible();
            await procurementPage.enterRemarks(MIRDetails.purchaseOrderRemarks);
            await expect(procurementPage.successMessage('Purchase order remark created successfully'), 'Purchase order remark created successfully success message does not found').toHaveText('Purchase order remark created successfully');
            await procurementPage.clickViewIcon();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        });

        await test.step('Create the purchase order against the contract vendor', async () => {
            await modules.goToModule({ nestedSubModule: 'PR to Po (Contract)' });
            await procurementPage.search(prId);
            await procurementPage.createPO(MIRDetails.orderType);
            await procurementPage.selectVendor(MIRDetails.vendor);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await procurementPage.confirmPurchaseOrder();
            await procurementPage.createPOAndValidateAPI(201);
            await expect(procurementPage.successMessage('Purchase order created successfully'), 'Purchase order created successfully success message does not match').toHaveText('Purchase order created successfully')
        });

        await test.step('Verify the created purchase order is Active', async () => {
            await modules.goToModule({ nestedSubModule: 'View PO' });
            poNumber = await procurementPage.getPONumber();
            await procurementPage.search(poNumber);
            await expect(materialIndentRequestPage.status('Active'), 'PO status does not match').toBeVisible();
            await procurementPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(prId, MIRDetails.vendor, MIRDetails.orderType);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        });

        await test.step('Create the GRN entry for the purchase order', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Management', nestedSubModule: 'GRN Entry' });
            await grnEntryPage.createGRNEntry(MIRDetails.vendor, poNumber, MIRDetails.quantity, MIRDetails.grnRemarks, MIRDetails.deliveryNote, MIRDetails.invoiceNumber);
            await expect(grnEntryPage.successMessage('GRN created successfully'), 'GRN created successfully message does not match').toHaveText('GRN created successfully');
            grnNumber = await grnEntryPage.getGRNNumber();
            await grnEntryPage.search(grnNumber);
            await expect(grnEntryPage.status('Not Started'), 'QC status does not match').toBeVisible();
            await expect(grnEntryPage.status('Submitted'), 'GRN status does not match').toBeVisible();
            await grnEntryPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(grnNumber, MIRDetails.vendor, poNumber, 'Not Started');
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        });

        await test.step('Complete QC on the received quantity using All Quantity', async () => {
            const employeeName = await salesEnquiryAPI.getRandomEmployeeName();
            await grnEntryPage.startQC('All Quantity', MIRDetails.quantity, MIRDetails.qcFailedQuantity, employeeName, 'Pass', 'Pass', 'Pass');
            await expect(grnEntryPage.successMessage('GRN QC created successfully'), 'GRN QC created successfully message does not match').toContainText('GRN QC created successfully');
            await expect(grnEntryPage.qcCheckButton, 'QC check button is not visible').toBeVisible();
        });

        await test.step('Put away the QC passed quantity', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Management', nestedSubModule: 'Put Away' });
            await putAwayPage.search(grnNumber);
            await expect(putAwayPage.status('Completed'), 'QC status does not match').toBeVisible();
            await putAwayPage.clickStart();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await putAwayPage.clickPutAway();
            await putAwayPage.enterPutAwayDetails(MIRDetails.warehouse, MIRDetails.conversionUnit, MIRDetails.row, MIRDetails.rack, MIRDetails.shelf, MIRDetails.putAwayQuantity);
            await putAwayPage.submitPutAwayAndValidateAPI(201);
            await expect(putAwayPage.successMessage('Data created successfully'), 'Data created succesfully success message does not match').toHaveText('Data created successfully');
        });

        await test.step('Verify the stock is updated after put away', async () => {
            const stockAfterPutAway = await stockViewAPI.getMaterialQuantityAndStatus(accessToken, MIRDetails.material, 'SpareParts');
            expect(stockAfterPutAway.currentQuantity, 'Stock quantity mismatch after put away').toBe(Number(MIRDetails.putAwayQuantity));
            expect(stockAfterPutAway.stockStatus, 'Material status does not match after put away').toBe('InStock');
        });

        await test.step('Issue the material against the indent request', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('New Request'), "Status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(MIRDetails.requisitionType, 'Sales', requestedBy);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await expect(materialIndentRequestPage.status('Partially Available'), "Stock status text does not match").toBeVisible();
            await materialIndentRequestPage.enterSparePartsIssueQuantity(MIRDetails.quantity, MIRDetails.putAwayQuantity);
            await materialIndentRequestPage.issueMaterialAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');
        });

        await test.step('Verify the stock is drained back to out of stock after the issue', async () => {
            // Issuing everything that was put away must drain the material back to its pre-test state
            const stockAfterIssue = await stockViewAPI.getMaterialQuantityAndStatus(accessToken, MIRDetails.material, 'SpareParts');
            expect(stockAfterIssue.currentQuantity, 'Stock quantity mismatch after material issue').toBe(0);
            expect(stockAfterIssue.stockStatus, 'Material status does not match after material issue').toBe('OutOfStock');
        });
    });
});
