import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { test, expect } from "../../../fixtures/baseFixtures";

test.describe('Material Indent and Material Issue End-to-End Scenarios', () => {
    test.setTimeout(550000);
    let MIRDetails: CreateMIRData;
    let materialIndentRequestId: string;
    let accessToken: string;

    test.beforeEach('Setup', async ({ page, loginPage, homePage, salesEnquiryAPI, stockViewAPI }) => {
        MIRDetails = getMIRDetails();
        accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        const material = await stockViewAPI.getOutOfStockMaterialWithActiveContract(accessToken, 'RawMaterials');
        console.log(material);
        expect(material, 'No out-of-stock raw material with an active contract was found').not.toBeNull();
        MIRDetails.material = material!.materialName;
        MIRDetails.vendor = material!.vendorName;

        await loginPage.launchAwalWebsite();
        await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
        console.log("Login successfull");
        await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
        await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
    });

    test.afterEach('Teardown', async ({ page, salesEnquiryAPI }) => {
        await page.close();
        await salesEnquiryAPI.dispose();
    });

    test('Verify Material Indent Request is successfully created, approved by manager, and material is issued', async ({ page, putAwayPage, grnEntryPage, procurementPage, prRequestPage, modules, materialIndentRequestPage, ppjoPage }) => {
        await modules.goToModule({ module: 'Store', subModule: 'Material Management', nestedSubModule: 'Stock View' });
        await materialIndentRequestPage.search(MIRDetails.material);
        const currentStock = await materialIndentRequestPage.getMaterialCurrentQuatity();
        MIRDetails.quantity = `${currentStock === 0 ? currentStock + 1 : currentStock}`;

        await modules.goToModule({ module: 'Store', subModule: 'Material Indent Request' });

        await materialIndentRequestPage.createMaterialIndentRequest(MIRDetails);
        await materialIndentRequestPage.addMaterial(MIRDetails);
        await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);

        await materialIndentRequestPage.submitMaterialIndentRequestAndValidateAPI(201);
        await expect(materialIndentRequestPage.successMessage('Material Indent created successfully'), 'Material Indent created successfully success message does not found').toHaveText('Material Indent created successfully');
        materialIndentRequestId = await materialIndentRequestPage.getMaterialIndentRequestNumber();
        await materialIndentRequestPage.search(materialIndentRequestId);
        await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText(MIRDetails.priority);
        await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('Pending');

        await modules.goToModule({ subModule: 'Material Indent Request (Manager)' });
        await materialIndentRequestPage.search(materialIndentRequestId);
        await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText(MIRDetails.priority);
        await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('New Request');
        await materialIndentRequestPage.clickViewIcon();
        await ppjoPage.validateSampleDetails(materialIndentRequestId, MIRDetails.pjoNumber, MIRDetails.priority, 'Vigneshwaran');
        await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        await materialIndentRequestPage.managerApprovesMaterialRequestAndValidateAPI(200);

        // improper status code
        await expect(materialIndentRequestPage.successMessage('Material Indent Requets approved successfully'), 'Material Indent Requets approved successfully success message does not found').toHaveText('Material Indent Requets approved successfully');
        await materialIndentRequestPage.goToHistory();
        await materialIndentRequestPage.search(materialIndentRequestId);
        await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText('Approved');

        await modules.goToModule({ subModule: 'Material Indent Request' });
        await materialIndentRequestPage.search(materialIndentRequestId);
        await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('Approved');

        await modules.goToModule({ subModule: 'Material Issue Notes' });
        await materialIndentRequestPage.search(materialIndentRequestId);
        await expect(materialIndentRequestPage.status, "Status text does not match").toHaveText('New Request');
        await materialIndentRequestPage.clickViewIcon();
        await ppjoPage.validateSampleDetails(materialIndentRequestId, MIRDetails.pjoNumber, materialIndentRequestId, 'Vigneshwaran');
        await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        await expect(materialIndentRequestPage.stockStatus, "Stock status text does not match").toHaveText('Out Of Stock');
        await expect(materialIndentRequestPage.issuingQuantity, 'Issuing quantity field is not disabled for Out Of Stock materials').toBeDisabled();

        await modules.goToModule({ subModule: 'PR Request' });
        await materialIndentRequestPage.search(materialIndentRequestId);
        await prRequestPage.createPRRequestAndValidateAPI(200);
        await expect(prRequestPage.successMessage('Purchase requisition created successfully'), 'Purchase requisition created successfully success message does not found').toHaveText('Purchase requisition created successfully');

        await modules.goToModule({ subModule: 'PR Request Manager' });
        const prId = await prRequestPage.searchPR(MIRDetails.material);
        console.log(`PR ID: ${prId}`);
        await prRequestPage.search(prId);
        await expect(prRequestPage.stockStatus, 'Stock status does not match').toHaveText('Out Of Stock');
        await expect(prRequestPage.prStatus, "PR status text does not match").toHaveText('PO Pending');
        await prRequestPage.clickViewIcon();
        await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        await prRequestPage.approvePRRequestAndValidateAPI(200);
        await expect(prRequestPage.successMessage('Purchase requisition approved successfully'), 'Purchase requisition approved successfully success message does not found').toHaveText('Purchase requisition approved successfully');;

        await modules.goToModule({ subModule: 'Purchase Request Sheet' });
        await prRequestPage.search(prId);
        await expect(prRequestPage.stockStatus, 'Stock status does not match').toHaveText('Out Of Stock');
        await expect(prRequestPage.prStatus, "PR status text does not match").toHaveText('PO Pending');
        await prRequestPage.clickViewIcon();
        await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);

        await modules.goToModule({ module: 'Procurement', subModule: 'PR to PO', nestedSubModule: 'PR to Po (Contract)' });
        await procurementPage.search(prId);
        await expect(procurementPage.status, 'Stock status does not match').toHaveText('New Request');
        await procurementPage.enterRemarks('Purchase Order (Contract) Remarks');
        await expect(procurementPage.successMessage('Purchase order remark created successfully'), 'Purchase order remark created successfully success message does not found').toHaveText('Purchase order remark created successfully');
        await procurementPage.clickViewIcon();
        await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);

        await modules.goToModule({ nestedSubModule: 'PR to Po (Contract)' });
        await procurementPage.search(prId);
        await procurementPage.createPO(MIRDetails.orderType);
        await procurementPage.selectVendor(MIRDetails.vendor);
        await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        await procurementPage.confirmPurchaseOrder();
        await procurementPage.createPOAndValidateAPI(201);
        await expect(procurementPage.successMessage('Purchase order created successfully'), 'Purchase order created successfully success message does not match').toHaveText('Purchase order created successfully')

        await modules.goToModule({ nestedSubModule: 'View PO' });
        const poNumber = await procurementPage.getPONumber();
        await procurementPage.search(poNumber);
        await expect(materialIndentRequestPage.priorityLevel, 'PO status does not match').toHaveText('Active');
        await procurementPage.clickViewIcon();
        await ppjoPage.validateSampleDetails(prId, MIRDetails.vendor, MIRDetails.orderType, MIRDetails.vendor);
        await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);

        await modules.goToModule({ module: 'Store', subModule: 'Material Management', nestedSubModule: 'GRN Entry' });
        await grnEntryPage.createGRNEntry(MIRDetails.vendor, poNumber, '1', 'Create GRN Remarks', 'Delivery Note', '98765');
        await expect(grnEntryPage.successMessage('GRN created successfully'), 'GRN created successfully message does not match').toHaveText('GRN created successfully');
        const grnNumber = await grnEntryPage.getGRNNumber();
        await grnEntryPage.search(grnNumber);
        await expect(grnEntryPage.qcStatus, 'QC status does not match').toHaveText('Not Started');
        await expect(grnEntryPage.status, 'GRN status does not match').toHaveText('Submitted');
        await grnEntryPage.clickViewIcon();
        await ppjoPage.validateSampleDetails(grnNumber, MIRDetails.vendor, poNumber, 'Not Started');
        await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        await grnEntryPage.startQC('Random Quantity', '7', '1', 'EMP00287 - Neelamegam Subramani', 'Pass', 'Pass', 'Pass');
        await expect(grnEntryPage.successMessage('GRN QC created successfully'), 'GRN QC created successfully message does not match').toContainText('GRN QC created successfully');
        await expect(grnEntryPage.qcCheckButton, 'QC check button is not visible').toBeVisible();
        
        await modules.goToModule({ module: 'Store', subModule: 'Material Management', nestedSubModule: 'Put Away' });
        await putAwayPage.search(grnNumber);
        await expect(putAwayPage.qcStatus, 'QC status does not match').toHaveText('Completed');
        await putAwayPage.clickStart();
    });
});