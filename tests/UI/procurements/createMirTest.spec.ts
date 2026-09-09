import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { test, expect } from "../../../fixtures/baseFixtures";

test.describe('Material Indent and Material Issue End-to-End Scenarios', () => {
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

    test('Verify Material Indent Request is successfully created, approved by manager, and material is issued', async ({ modules, materialIndentRequestPage }) => {
        await modules.goToModule({ module: 'Store', subModule: 'Material Management', nestedSubModule: 'Stock View' });
        await materialIndentRequestPage.search(MIRDetails.material);
        const currentStock = await materialIndentRequestPage.getMaterialCurrentQuatity();

        await test.step('Open the Material Indent Request module', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Indent Request' });
        });

        await test.step('Create a new material indent request', async () => {
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

        await test.step('Approve the request from the manager queue', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request (Manager)' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status(MIRDetails.priority), "Priority level text does not match").toBeVisible();
            await expect(materialIndentRequestPage.status('New Request'), "MIR status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(materialIndentRequestId, MIRDetails.pjoNumber, MIRDetails.priority, MIRDetails.employeeName);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.managerApprovesMaterialRequestAndValidateAPI(200);
            // improper status code
            await expect(materialIndentRequestPage.successMessage('Material Indent Requets approved successfully'), 'Material Indent Requets approved successfully success message does not found').toHaveText('Material Indent Requets approved successfully');
            await materialIndentRequestPage.goToHistory();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Approved'), "Priority level text does not match").toBeVisible();
        });

        await test.step('Verify the request is approved for store users', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Approved'), "MIR status text does not match").toBeVisible();
        });

        await test.step('Issue the approved material from the issue notes screen', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('New Request'), "Status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(materialIndentRequestId, MIRDetails.pjoNumber, MIRDetails.employeeName);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await expect(materialIndentRequestPage.status('In Stock'), "Stock status text does not match").toBeVisible();
            await materialIndentRequestPage.enterIssueQuantity(MIRDetails.quantity, MIRDetails.quantity);
            await materialIndentRequestPage.issueMaterialAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');
        });

        await test.step('Confirm the material is fully issued', async () => {
            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Material Issued'), 'Material status does not match').toBeVisible();
            await expect(materialIndentRequestPage.status('Pending'), 'Acknowledgement status does not match').toBeVisible();
        });

        await test.step('Validate stock quantity after material issue', async () => {
            await modules.goToModule({ subModule: 'Material Management', nestedSubModule: 'Stock View' });
            await materialIndentRequestPage.search(MIRDetails.material);
            const updatedStock = await materialIndentRequestPage.getMaterialCurrentQuatity();
            expect(updatedStock, 'Stock quantity mismatch after material issue').toBe(currentStock - parseFloat(MIRDetails.quantity));
        });
    });

    test('Verify Material Indent Request is partially issued when issued quantity is less than requested quantity', async ({ modules, materialIndentRequestPage, ppjoPage }) => {
        await test.step('Open the Material Indent Request module', async () => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Indent Request' });
        });

        await test.step('Create a new material indent request', async () => {
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

        await test.step('Approve the request from the manager queue', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request (Manager)' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status(MIRDetails.priority), "Priority level text does not match").toBeVisible();
            await expect(materialIndentRequestPage.status('New Request'), "MIR status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(materialIndentRequestId, MIRDetails.pjoNumber, MIRDetails.priority, MIRDetails.employeeName);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.managerApprovesMaterialRequestAndValidateAPI(200);
            // improper status code
            await expect(materialIndentRequestPage.successMessage('Material Indent Requets approved successfully'), 'Material Indent Requets approved successfully success message does not found').toHaveText('Material Indent Requets approved successfully');
            await materialIndentRequestPage.goToHistory();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Approved'), "Priority level text does not match").toBeVisible();
        });

        await test.step('Verify the request is approved for store users', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Approved'), "MIR status text does not match").toBeVisible();
        });

        await test.step('Issue a partial quantity from the issue notes screen', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('New Request'), "Status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await materialIndentRequestPage.validateMIRDetails(materialIndentRequestId, MIRDetails.pjoNumber, MIRDetails.employeeName);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await expect(materialIndentRequestPage.status('In Stock'), "Stock status text does not match").toBeVisible();
            await materialIndentRequestPage.enterIssueQuantity(MIRDetails.quantity, '6');
            await materialIndentRequestPage.issueMaterialAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');
        });

        await test.step('Confirm the material is partially issued', async () => {
            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Partially Issued'), 'Material status does not match').toBeVisible();
            await expect(materialIndentRequestPage.status('Pending'), 'Acknowledgement status does not match').toBeVisible();
        });
    });
});