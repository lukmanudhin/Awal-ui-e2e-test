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
        MIRDetails.material = await stockViewAPI.getMaterialWithHighStock(accessToken);

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

    test('Verify Material Indent Request is successfully created, approved by manager, and material is issued', async ({ modules, materialIndentRequestPage, ppjoPage }) => {
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
            await materialIndentRequestPage.submitMaterialIndentRequestAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Indent created successfully'), 'Material Indent created successfully success message does not found').toHaveText('Material Indent created successfully');
            materialIndentRequestId = await materialIndentRequestPage.getMaterialIndentRequestNumber();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText(MIRDetails.priority);
            await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('Pending');
        });

        await test.step('Approve the request from the manager queue', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request (Manager)' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText(MIRDetails.priority);
            await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('New Request');
            await materialIndentRequestPage.clickViewIcon();
            await ppjoPage.validateSampleDetails(materialIndentRequestId, 'PJO483', MIRDetails.priority, 'Vigneshwaran');
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.managerApprovesMaterialRequestAndValidateAPI(200);
            // improper status code
            await expect(materialIndentRequestPage.successMessage('Material Indent Requets approved successfully'), 'Material Indent Requets approved successfully success message does not found').toHaveText('Material Indent Requets approved successfully');
            await materialIndentRequestPage.goToHistory();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText('Approved');
        });

        await test.step('Verify the request is approved for store users', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('Approved');
        });

        await test.step('Issue the approved material from the issue notes screen', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status, "Status text does not match").toHaveText('New Request');
            await materialIndentRequestPage.clickViewIcon();
            await ppjoPage.validateSampleDetails(materialIndentRequestId, 'PJO483', materialIndentRequestId, 'Vigneshwaran');
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await expect(materialIndentRequestPage.stockStatus, "Stock status text does not match").toHaveText('In Stock');
            await materialIndentRequestPage.enterIssueQuantity(MIRDetails.quantity, MIRDetails.quantity);
            await materialIndentRequestPage.issueMaterialAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');
        });

        await test.step('Confirm the material is fully issued', async () => {
            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.materialStatus, 'Material status does not match').toHaveText('Material Issued');
            await expect(materialIndentRequestPage.priorityLevel, 'Acknowledgement status does not match').toHaveText('Pending');
        });

        await modules.goToModule({ subModule: 'Material Management', nestedSubModule: 'Stock View' });
        await materialIndentRequestPage.search(MIRDetails.material);
        const updatedStock = await materialIndentRequestPage.getMaterialCurrentQuatity();
        expect(updatedStock, 'Stock quantity mismatch after material issue').toBe(currentStock - parseFloat(MIRDetails.quantity));
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
            await materialIndentRequestPage.submitMaterialIndentRequestAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Indent created successfully'), 'Material Indent created successfully success message does not found').toHaveText('Material Indent created successfully');
            materialIndentRequestId = await materialIndentRequestPage.getMaterialIndentRequestNumber();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText(MIRDetails.priority);
            await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('Pending');
        });

        await test.step('Approve the request from the manager queue', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request (Manager)' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText(MIRDetails.priority);
            await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('New Request');
            await materialIndentRequestPage.clickViewIcon();
            await ppjoPage.validateSampleDetails(materialIndentRequestId, 'PJO483', MIRDetails.priority, 'Vigneshwaran');
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.managerApprovesMaterialRequestAndValidateAPI(200);
            // improper status code
            await expect(materialIndentRequestPage.successMessage('Material Indent Requets approved successfully'), 'Material Indent Requets approved successfully success message does not found').toHaveText('Material Indent Requets approved successfully');
            await materialIndentRequestPage.goToHistory();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel, "Priority level text does not match").toHaveText('Approved');
        });

        await test.step('Verify the request is approved for store users', async () => {
            await modules.goToModule({ subModule: 'Material Indent Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.mirStatus, "MIR status text does not match").toHaveText('Approved');
        });

        await test.step('Issue a partial quantity from the issue notes screen', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status, "Status text does not match").toHaveText('New Request');
            await materialIndentRequestPage.clickViewIcon();
            await ppjoPage.validateSampleDetails(materialIndentRequestId, 'PJO483', materialIndentRequestId, 'Vigneshwaran');
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await expect(materialIndentRequestPage.stockStatus, "Stock status text does not match").toHaveText('In Stock');
            await materialIndentRequestPage.enterIssueQuantity(MIRDetails.quantity, '6');
            await materialIndentRequestPage.issueMaterialAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');
        });

        await test.step('Confirm the material is partially issued', async () => {
            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.materialStatus, 'Material status does not match').toHaveText('Partially Issued');
            await expect(materialIndentRequestPage.priorityLevel, 'Acknowledgement status does not match').toHaveText('Pending');
        });
    });
});