import { test, expect } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getProductionData } from "../../../testData/productionData";

// test('tmp smoke: mobile login and navigation', async ({ mobileLoginPage }) => {
//     test.setTimeout(400000);
//     await mobileLoginPage.launchAwalApp();
//     expect(await mobileLoginPage.isLoginScreenDisplayed(), 'login screen not displayed').toBe(true);
//     await mobileLoginPage.login("karthick.m@colanonline.com", "Karthick@123");
//     expect(await mobileLoginPage.isLoggedIn(), 'login failed').toBe(true);
//     await mobileLoginPage.goToModule('Production');
//     expect(await mobileLoginPage.isScreenTextDisplayed('Production Management Tab'), 'production screen not displayed').toBe(true);
//     await mobileLoginPage.goToModule('Task Management');
//     expect(await mobileLoginPage.isScreenTextDisplayed('Task Management'), 'task management screen not displayed').toBe(true);
//     console.log('SMOKE OK');
// });

test('Mobile App: Verify the Quality Control task of the PJO is assigned, started and completed by the Quality Control employee', async ({ modules, loginPage, homePage, salesEnquiryPage, productionJobOrderPage, page }) => {
    const productionData = getProductionData();
    await loginPage.launchAwalWebsite();
    await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
    await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
    console.log("Login successfull");
    await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
    await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
    await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
    await modules.goToModule({ module: 'Production', subModule: 'PJOs & Tasks', nestedSubModule: 'PJO Progress & Status Tracking' });
    await productionJobOrderPage.search('802600867');
    await productionJobOrderPage.clickViewIcon();
    await productionJobOrderPage.expandDepartment('Design Studio');
    await expect(productionJobOrderPage.status('Running'), 'PJO approved status does not match').toBeVisible();
    await productionJobOrderPage.validateDepartmentTaskProgressTable(productionData.designStudioEmployee);
    await productionJobOrderPage.expandDepartment('Design Studio');
});

