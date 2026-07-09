import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { test, expect } from "../../../fixtures/baseFixtures";

test.describe('Verify Material Indent Life Cycle With Multiple Partial Issues E2E Test', () => {
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


    test('Verify Material Indent Request is partially issued when issued quantity is less than requested quantity', async ({ modules, materialIndentRequestPage, ppjoPage }) => {
            await modules.goToModule({ module: 'Store', subModule: 'Material Indent Request' });

            await materialIndentRequestPage.createMaterialIndentRequest(MIRDetails);
            await materialIndentRequestPage.addMaterial(MIRDetails);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);

            await materialIndentRequestPage.submitMaterialIndentRequestAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Indent created successfully'), 'Material Indent created successfully success message does not found').toHaveText('Material Indent created successfully');
            materialIndentRequestId = await materialIndentRequestPage.getMaterialIndentRequestNumber();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel).toHaveText(MIRDetails.priority);
            await expect(materialIndentRequestPage.mirStatus).toHaveText('Pending');


            await modules.goToModule({ subModule: 'Material Indent Request (Manager)' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel).toHaveText(MIRDetails.priority);
            await expect(materialIndentRequestPage.mirStatus).toHaveText('New Request');
            await materialIndentRequestPage.clickViewIcon();
            await ppjoPage.validateSampleDetails(materialIndentRequestId, 'PJO483', MIRDetails.priority, 'Vigneshwaran');
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await materialIndentRequestPage.managerApprovesMaterialRequestAndValidateAPI(200);
            
            // improper status code
            await expect(materialIndentRequestPage.successMessage('Material Indent Requets approved successfully'), 'Material Indent Requets approved successfully success message does not found').toHaveText('Material Indent Requets approved successfully');
            await materialIndentRequestPage.goToHistory();
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.priorityLevel).toHaveText('Approved');


            await modules.goToModule({ subModule: 'Material Indent Request' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.mirStatus).toHaveText('Approved');


            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status).toHaveText('New Request');
            await materialIndentRequestPage.clickViewIcon();
            await ppjoPage.validateSampleDetails(materialIndentRequestId, 'PJO483', materialIndentRequestId, 'Vigneshwaran');
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await expect(materialIndentRequestPage.stockStatus).toHaveText('In Stock');
            await materialIndentRequestPage.enterIssueQuantity(MIRDetails.quantity, '20');
            await materialIndentRequestPage.issueMaterialAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');

            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.materialStatus, 'Material status does not match').toHaveText('Partially Issued');
            await expect(materialIndentRequestPage.priorityLevel, 'Acknowledgement status does not match').toHaveText('Pending');

            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await materialIndentRequestPage.clickViewIcon();
            await expect(materialIndentRequestPage.stockStatus).toHaveText('In Stock');
            await materialIndentRequestPage.enterIssueQuantity('30', '15');
            await materialIndentRequestPage.issueMaterialAndValidateAPI(200);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');

            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.materialStatus, 'Material status does not match').toHaveText('Partially Issued');
            await expect(materialIndentRequestPage.priorityLevel, 'Acknowledgement status does not match').toHaveText('Pending');

            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await materialIndentRequestPage.clickViewIcon();
            await expect(materialIndentRequestPage.stockStatus).toHaveText('In Stock');
            await materialIndentRequestPage.enterIssueQuantity('15', '7');
            await materialIndentRequestPage.issueMaterialAndValidateAPI(200);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');

            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.materialStatus, 'Material status does not match').toHaveText('Partially Issued');
            await expect(materialIndentRequestPage.priorityLevel, 'Acknowledgement status does not match').toHaveText('Pending');

            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await materialIndentRequestPage.clickViewIcon();
            await expect(materialIndentRequestPage.stockStatus).toHaveText('In Stock');
            await materialIndentRequestPage.enterIssueQuantity('8', '8');
            await materialIndentRequestPage.issueMaterialAndValidateAPI(200);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');

            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.materialStatus, 'Material status does not match').toHaveText('Material Issued');
            await expect(materialIndentRequestPage.priorityLevel, 'Acknowledgement status does not match').toHaveText('Pending');
    });
});