import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { test, expect } from "../../../fixtures/baseFixtures";

test.describe('Purchase Order Rejection End-to-End Scenarios', () => {
    test.setTimeout(550000);
    let MIRDetails: CreateMIRData;
    let materialIndentRequestId: string;
    let accessToken: string;
    let requestedBy: string;
    let prId: string;
    let prExtId: string;
    let poNumber: string;
    let putAwayDone = false;

    test.beforeEach('Setup', async ({ page, loginPage, homePage, salesEnquiryAPI, stockViewAPI }) => {
        MIRDetails = getMIRDetails();
        materialIndentRequestId = '';
        prId = '';
        prExtId = '';
        poNumber = '';

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
        await materialIndentRequestAPI.deletePOIfCreated(accessToken, poNumber);
        await materialIndentRequestAPI.deletePRIfCreated(accessToken, prId, prExtId);
        await page.close();
        await salesEnquiryAPI.dispose();
    });

    test('Verify Purchase Order is Rejected Successfully', async ({ materialIndentRequestAPI, procurementPage, prRequestPage, modules, materialIndentRequestPage }) => {

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
            await expect(materialIndentRequestPage.status(MIRDetails.priority), "Priority level text does not match").toBeVisible();
            await expect(materialIndentRequestPage.status('Pending'), "MIR status text does not match").toBeVisible();
        });

        await test.step('Manager approves the material indent request', async () => {
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
            await materialIndentRequestPage.validateMIRDetails(materialIndentRequestId, MIRDetails.pjoNumber, requestedBy);
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
            prExtId = await materialIndentRequestAPI.getPurchaseRequisitionExtId(accessToken, prId);
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

        await test.step('Reject the purchase order against the contract vendor', async () => {
            await modules.goToModule({ nestedSubModule: 'PR to Po (Contract)' });
            await procurementPage.search(prId);
            await procurementPage.createPO(MIRDetails.orderType);
            await procurementPage.selectVendor(MIRDetails.vendor);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await procurementPage.rejectPurchaseOrder();
            // a invalid pop up is displayed
            // No success message or confirmation as PO rejected
        });
    });
});