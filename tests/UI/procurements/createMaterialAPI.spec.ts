import { ENV } from "../../../utils/ENV";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";
import { test, expect } from "../../../fixtures/baseFixtures";
import { mirPayload } from "../../../API-payloads/createMaterialPayload";

test.describe.skip('Material Indent and Material Issue End-to-End Scenarios', () => {
    test.setTimeout(550000);
    let MIRDetails: CreateMIRData;
    let materialIndentRequestId: string;
    let accessToken: string;
    let materialId: string;

    test.beforeEach('Setup', async ({ salesEnquiryAPI, createMaterialAPI }) => {
        MIRDetails = getMIRDetails();
        accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        materialId = await createMaterialAPI.createMaterial(accessToken, mirPayload);

        // await loginPage.launchAwalWebsite();
        // await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        // await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
        // console.log("Login successfull");
        // await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
        // await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
    });

    test.afterEach('Teardown', async ({ page, salesEnquiryAPI, createMaterialAPI }) => {
        // await page.close();
        await createMaterialAPI.deleteMaterial(accessToken, materialId);
        await salesEnquiryAPI.dispose();
    });

    test('Verify Material Indent Request is successfully created, approved by manager, and material is issued', async ({ salesEnquiryAPI, createMaterialAPI }) => {
        // MIRDetails = getMIRDetails();
        // accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        // await createMaterialAPI.createMaterial(accessToken, mirPayload);
    });

});
