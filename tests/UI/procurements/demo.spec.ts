import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { test, expect } from "../../../fixtures/baseFixtures";

test.describe('Material Indent and Material Issue End-to-End Scenarios', () => {
    test.setTimeout(550000);
    let MIRDetails: CreateMIRData;
    let materialIndentRequestId: string;
    let accessToken: string;
    let requestedBy: string;
    let putAwayDone = false;

    test.beforeEach('Setup', async ({ page, loginPage, homePage, salesEnquiryAPI, stockViewAPI }) => {
        MIRDetails = getMIRDetails();
        materialIndentRequestId = '';

        await test.step('Find an out of stock raw material that has an active contract', async () => {
            accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            requestedBy = await salesEnquiryAPI.getLoggedInUserName(accessToken);
            const material = await stockViewAPI.getOutOfStockMaterialWithActiveContract(accessToken, 'RawMaterials');
            console.log(material);
            expect(material, 'No out-of-stock raw material with an active contract was found').not.toBeNull();
            MIRDetails.material = material!.materialName;
            MIRDetails.vendor = material!.vendorName;
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

    test.afterEach('Teardown', async ({ page, salesEnquiryAPI, materialIndentRequestAPI }, testInfo) => {
        if (testInfo.status !== 'passed' && putAwayDone) {
            await materialIndentRequestAPI.issueAvailableMaterialForMIR(accessToken, materialIndentRequestId);
        }
        await page.close();
        await salesEnquiryAPI.dispose();
    });

    test('Verify Material Indent Request is successfully created, approved by manager, and material is issued with Random Quantity', async ({ salesEnquiryAPI, stockViewAPI, putAwayPage, grnEntryPage, procurementPage, prRequestPage, modules, materialIndentRequestPage, ppjoPage }) => {
        let prId: string;
        let poNumber: string;
        let grnNumber: string;

        await test.step('Create a material indent request for the out of stock material', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Indent Request' });
            await materialIndentRequestPage.createMaterialIndentRequest(MIRDetails);
            await materialIndentRequestPage.addMaterial(MIRDetails);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.submitMaterialIndentRequestAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Indent created successfully'), 'Material Indent created successfully success message does not found').toHaveText('Material Indent created successfully');
        });

        await test.step('Verify the indent request is listed with Pending status', async () => {
            materialIndentRequestId = await materialIndentRequestPage.getMaterialIndentRequestNumber();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText(MIRDetails.priority);
            await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('Pending');
        });

        await test.step('Manager approves the material indent request', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request (Manager)' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText(MIRDetails.priority);
            await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('New Request');
            await materialIndentRequestPage.clickViewIcon();
            await ppjoPage.validateSampleDetails(materialIndentRequestId, MIRDetails.pjoNumber, MIRDetails.priority, requestedBy);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.managerApprovesMaterialRequestAndValidateAPI(200);
            // improper status code
            await expect(materialIndentRequestPage.successMessage('Material Indent Requets approved successfully'), 'Material Indent Requets approved successfully success message does not found').toHaveText('Material Indent Requets approved successfully');
        });

        await test.step('Verify the approval is reflected in history and in the indent request list', async () => {
            await materialIndentRequestPage.goToHistory();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText('Approved');
            await modules.goToModule({ subModule: 'Material Indent Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('Approved');
        });

        await test.step('Verify the material cannot be issued while it is out of stock', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status, "Status text does not match").toHaveText('New Request');
            await materialIndentRequestPage.clickViewIcon();
            await ppjoPage.validateSampleDetails(materialIndentRequestId, MIRDetails.pjoNumber, materialIndentRequestId, requestedBy);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await expect(materialIndentRequestPage.stockStatus, "Stock status text does not match").toHaveText('Out Of Stock');
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
            await expect(prRequestPage.stockStatus, 'Stock status does not match').toHaveText('Out Of Stock');
            await expect(prRequestPage.prStatus, "PR status text does not match").toHaveText('PO Pending');
            await prRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await prRequestPage.approvePRRequestAndValidateAPI(200);
            await expect(prRequestPage.successMessage('Purchase requisition approved successfully'), 'Purchase requisition approved successfully success message does not found').toHaveText('Purchase requisition approved successfully');
        });

        await test.step('Verify the purchase requisition in the Purchase Request Sheet', async () => {
            await modules.goToModule({ subModule: 'Purchase Request Sheet' });
            await prRequestPage.search(prId);
            await expect(prRequestPage.stockStatus, 'Stock status does not match').toHaveText('Out Of Stock');
            await expect(prRequestPage.prStatus, "PR status text does not match").toHaveText('PO Pending');
            await prRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        });

        await test.step('Add purchase order remarks in PR to PO (Contract)', async () => {
            await modules.goToModule({ module: 'Procurement', subModule: 'PR to PO', nestedSubModule: 'PR to Po (Contract)' });
            await procurementPage.search(prId);
            await expect(procurementPage.status, 'Stock status does not match').toHaveText('New Request');
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

        await modules.goToModule({ nestedSubModule: 'View PO' });
        poNumber = await procurementPage.getPONumber();
        await procurementPage.search(poNumber);
        await expect(materialIndentRequestPage.priorityLevel, 'PO status does not match').toHaveText('Active');
        await procurementPage.clickViewIcon();
        await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        await ppjoPage.validateSampleDetails(materialIndentRequestId, MIRDetails.vendor, MIRDetails.orderType, MIRDetails.vendor);

        await modules.goToModule({ subModule: 'Material Issue Notes' });
    });
});
