import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { test, expect } from "../../../fixtures/baseFixtures";

test.describe('Material Indent Request Manager Rejects MIR End-to-End Scenarios', () => {
    test.setTimeout(550000);
    let MIRDetails: CreateMIRData;
    let materialIndentRequestId: string;
    let materialIndentRequestExtId: string;
    let accessToken: string;

    test.beforeEach('Setup', async ({ page, loginPage, homePage, salesEnquiryAPI, stockViewAPI }) => {
        MIRDetails = getMIRDetails();
        accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        MIRDetails.material = await stockViewAPI.getMaterialWithHighStock(accessToken, 'RawMaterials');
        MIRDetails.employeeName = await salesEnquiryAPI.getLoggedInUserName(accessToken);

        await loginPage.launchAwalWebsite();
        await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
        console.log("Login successfull");
        await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
        await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
    });

    test.afterEach('Teardown', async ({ page, salesEnquiryAPI, materialIndentRequestAPI }) => {
        await page.close();
        await materialIndentRequestAPI.deleteMaterialIndentRequestIfCreated(accessToken, materialIndentRequestExtId);
        await salesEnquiryAPI.dispose();
    });

    test('Verify Material Indent Request is successfully created and rejected by manager', async ({ modules, materialIndentRequestPage }) => {

        await test.step('Create a new material indent request', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Indent Request' });
            await materialIndentRequestPage.createMaterialIndentRequest(MIRDetails);
            await materialIndentRequestPage.addMaterial(MIRDetails);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
        });

        await test.step('Submit the request and confirm it is pending', async () => {
            materialIndentRequestExtId = await materialIndentRequestPage.submitMaterialIndentRequestAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Indent created successfully'), 'Material Indent created successfully success message does not found').toHaveText('Material Indent created successfully');
            materialIndentRequestId = await materialIndentRequestPage.getMaterialIndentRequestNumber();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status(MIRDetails.priority), "Priority level text does not match").toBeVisible();
            await expect(materialIndentRequestPage.status('Pending'), "MIR status text does not match").toBeVisible();
        });

        await test.step('Rejects the request from the manager queue', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request (Manager)' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status(MIRDetails.priority), "Priority level text does not match").toBeVisible();
            await expect(materialIndentRequestPage.status('New Request'), "MIR status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(materialIndentRequestId, MIRDetails.pjoNumber, MIRDetails.priority, MIRDetails.employeeName);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.managerRejectsMIRAndValidateAPI(200);
            await expect(materialIndentRequestPage.successMessage('Material Indent Requets rejected successfully'), 'Material Indent Requets rejected successfully success message does not found').toHaveText('Material Indent Requets rejected successfully');
            await materialIndentRequestPage.goToHistory();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Rejected'), "MIR status text does not match").toBeVisible();
        });

        await test.step('Verify the request is rejected for store users', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Rejected'), "MIR status text does not match").toBeVisible();
        });
    });
});