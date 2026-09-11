import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { getVendorRegistrationData, type VendorRegistrationData } from "../../../testData/vendorRegistrationData";
import { getMaterialPayload } from "../../../API-payloads/createMaterialPayload";
import { test, expect } from "../../../fixtures/baseFixtures";

test.describe('Purchase Requisition Manager Rejects PR End-to-End Scenarios', () => {
    test.setTimeout(550000);
    let MIRDetails: CreateMIRData;
    let vendorData: VendorRegistrationData;
    let materialIndentRequestId: string;
    let materialIndentRequestExtId: string;
    let accessToken: string;
    let requestedBy: string;
    let createdMaterialId: string;

    test.beforeEach('Setup', async ({ page, loginPage, homePage, salesEnquiryAPI, createMaterialAPI }) => {
        MIRDetails = getMIRDetails();
        vendorData = getVendorRegistrationData();
        materialIndentRequestId = '';
        materialIndentRequestExtId = '';
        createdMaterialId = '';
        accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        vendorData.evaluatorName = await salesEnquiryAPI.getRandomEmployeeName();
        requestedBy = await salesEnquiryAPI.getLoggedInUserName(accessToken);
        vendorData.companyName = MIRDetails.tempVendorName;
        const materialPayload = getMaterialPayload();
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
        if (createdMaterialId) {
            await createMaterialAPI.deleteMaterial(accessToken, createdMaterialId);
        }
        await materialIndentRequestAPI.deleteMIRIfCreated(accessToken, materialIndentRequestExtId);
        await page.close();
        await salesEnquiryAPI.dispose();
    });

    test('Verify Purchase Requisition Manager Rejects PR', async ({ prRequestPage, modules, materialIndentRequestPage }) => {
        let prId: string;

        await test.step('Raise a Material Indent Request for the out of stock material', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Indent Request' });

            await materialIndentRequestPage.createMaterialIndentRequest(MIRDetails);
            await materialIndentRequestPage.addMaterial(MIRDetails);
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
            await materialIndentRequestPage.validateMIRDetails(materialIndentRequestId, MIRDetails.pjoNumber, requestedBy);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await expect(materialIndentRequestPage.status('Out Of Stock'), "Stock status text does not match").toBeVisible();
            await expect(materialIndentRequestPage.issuingQuantity, 'Issuing quantity field is not disabled for Out Of Stock materials').toBeDisabled();
        });

        await test.step('Raise a Purchase Requisition for the shortfall', async () => {
            await modules.goToModule({ subModule: 'PR Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await prRequestPage.createPRRequestAndValidateAPI(200);
            await expect(prRequestPage.successMessage('Purchase requisition created successfully'), 'Purchase requisition created successfully success message does not found').toHaveText('Purchase requisition created successfully');
        });

        await test.step('Reject the Purchase Requisition as the manager', async () => {
            await modules.goToModule({ subModule: 'PR Request Manager' });
            prId = await prRequestPage.searchPR(MIRDetails.material);
            console.log(`PR ID: ${prId}`);
            await prRequestPage.search(prId);
            await expect(prRequestPage.status('Out Of Stock'), 'Stock status does not match').toBeVisible();
            await expect(prRequestPage.status('PO Pending'), "PR status text does not match").toBeVisible();
            await prRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await prRequestPage.rejectPRRequestAndValidateAPI(200);
            await expect(prRequestPage.successMessage('Purchase requisition rejected successfully'), 'Purchase requisition rejected successfully success message does not found').toHaveText('Purchase requisition rejected successfully');        
        });
    });
});