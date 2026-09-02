import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { test, expect } from "../../../fixtures/baseFixtures";

test.describe('Verify Material Indent Life Cycle With Multiple Partial Issues E2E Test', () => {
    test.setTimeout(550000);
    let MIRDetails: CreateMIRData;
    let materialIndentRequestId: string;
    let accessToken: string;
    let requestedBy: string;

    test.beforeEach('Setup', async ({ page, loginPage, homePage, salesEnquiryAPI, stockViewAPI }) => {
        MIRDetails = getMIRDetails();

        await test.step('Find a material that holds enough stock to cover the whole request', async () => {
            accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            MIRDetails.material = await stockViewAPI.getMaterialWithHighStock(accessToken, 'RawMaterials');
            requestedBy = await salesEnquiryAPI.getLoggedInUserName(accessToken);
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

    test.afterEach('Teardown', async ({ page, salesEnquiryAPI }) => {
        await page.close();
        await salesEnquiryAPI.dispose();
    });


    test('Verify Material Indent Request is partially issued when issued quantity is less than requested quantity', async ({ modules, materialIndentRequestPage, ppjoPage }) => {

        await test.step('Create a material indent request for the in stock material', async () => {
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
            await ppjoPage.validateSampleDetails(materialIndentRequestId, MIRDetails.pjoNumber, MIRDetails.priority, requestedBy);
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

        await test.step('First partial issue: issue 20 of the 50 requested units', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('New Request'), "Status text does not match").toBeVisible();
            await materialIndentRequestPage.clickViewIcon();
            await ppjoPage.validateSampleDetails(materialIndentRequestId, MIRDetails.pjoNumber, materialIndentRequestId, requestedBy);
            await materialIndentRequestPage.validateMaterialInformationTable(MIRDetails);
            await expect(materialIndentRequestPage.status('In Stock'), "Stock status text does not match").toBeVisible();
            await materialIndentRequestPage.enterIssueQuantity(MIRDetails.quantity, '20');
            await materialIndentRequestPage.issueMaterialAndValidateAPI(201);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');
        });

        await test.step('Verify the request is Partially Issued after the first issue', async () => {
            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Partially Issued'), 'Material status does not match').toBeVisible();
            await expect(materialIndentRequestPage.status('Pending'), 'Acknowledgement status does not match').toBeVisible();
        });

        await test.step('Second partial issue: issue 15 of the remaining 30 units', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await materialIndentRequestPage.clickViewIcon();
            await expect(materialIndentRequestPage.status('In Stock'), "Stock status text does not match").toBeVisible();
            await materialIndentRequestPage.enterIssueQuantity('30', '15');
            await materialIndentRequestPage.issueMaterialAndValidateAPI(200);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');
        });

        await test.step('Verify the request is still Partially Issued after the second issue', async () => {
            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Partially Issued'), 'Material status does not match').toBeVisible();
            await expect(materialIndentRequestPage.status('Pending'), 'Acknowledgement status does not match').toBeVisible();
        });

        await test.step('Third partial issue: issue 7 of the remaining 15 units', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            //no search result
            await materialIndentRequestPage.search(materialIndentRequestId);
            await materialIndentRequestPage.clickViewIcon();
            await expect(materialIndentRequestPage.status('In Stock'), "Stock status text does not match").toBeVisible();
            await materialIndentRequestPage.enterIssueQuantity('15', '7');
            await materialIndentRequestPage.issueMaterialAndValidateAPI(200);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');
        });

        await test.step('Verify the request is still Partially Issued after the third issue', async () => {
            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Partially Issued'), 'Material status does not match').toBeVisible();
            await expect(materialIndentRequestPage.status('Pending'), 'Acknowledgement status does not match').toBeVisible();
        });

        await test.step('Final issue: issue the remaining 8 units', async () => {
            await modules.goToModule({ subModule: 'Material Issue Notes' });
            await materialIndentRequestPage.search(materialIndentRequestId);
            await materialIndentRequestPage.clickViewIcon();
            await expect(materialIndentRequestPage.status('In Stock'), "Stock status text does not match").toBeVisible();
            await materialIndentRequestPage.enterIssueQuantity('8', '8');
            await materialIndentRequestPage.issueMaterialAndValidateAPI(200);
            await expect(materialIndentRequestPage.successMessage('Material Issue Notes created successfully'), 'Material Issue Notes created successfully success message does not found').toHaveText('Material Issue Notes created successfully');
        });

        await test.step('Verify the request is fully Material Issued once the last unit is issued', async () => {
            await materialIndentRequestPage.goToTab('Issued');
            await materialIndentRequestPage.search(materialIndentRequestId);
            await expect(materialIndentRequestPage.status('Material Issued'), 'Material status does not match').toBeVisible();
            await expect(materialIndentRequestPage.status('Pending'), 'Acknowledgement status does not match').toBeVisible();
        });
    });
});
