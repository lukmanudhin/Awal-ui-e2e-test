import { test, expect } from "../../../fixtures/baseFixtures";

test('tmp smoke: mobile login and navigation', async ({ mobileLoginPage, mobileTaskManagementPage }) => {
    await mobileLoginPage.launchAwalApp();
    expect(await mobileLoginPage.isLoginScreenDisplayed(), 'Awal app login screen is not displayed after launching the app').toBe(true);
    await mobileLoginPage.login('karthick.m@colanonline.com', 'Karthick@123');
    expect(await mobileLoginPage.isLoggedIn(), 'Login to the Awal mobile app failed').toBe(true);
    console.log('Login successful in the Awal mobile app');
    await mobileLoginPage.goToModule('Production');
    expect(await mobileLoginPage.isScreenTextDisplayed('Production Management Tab'), 'Awal app production screen is not displayed after launching the app').toBe(true);
    await mobileLoginPage.goToModule('Task Management');
    expect(await mobileLoginPage.isScreenTextDisplayed('Task Management'), 'Awal app Task Management screen is not displayed after launching the app').toBe(true);

    await mobileTaskManagementPage.selectEmployee('Sanjay Preeth');
    await mobileTaskManagementPage.selectFaceRecognition();
    await mobileTaskManagementPage.startVerification();
    expect(await mobileTaskManagementPage.isAssignPJOScreenDisplayed(), 'Assign PJO screen is not displayed after the face verification').toBe(true);
    await mobileTaskManagementPage.selectPJOAndSubmit('802600868');
    expect(await mobileTaskManagementPage.isPopupDisplayed('Assigned'), 'PJO assigned pop up is not displayed').toBe(true);
    expect(await mobileTaskManagementPage.closePopup('Assigned'), 'PJO assigned pop up is not closed').toBe(true);
    expect(await mobileTaskManagementPage.isStatusDisplayed('NOTYETSTARTED'), 'Task status is not NOTYETSTARTED before starting the task').toBe(true);

    await mobileTaskManagementPage.startTask();
    expect(await mobileTaskManagementPage.isPopupDisplayed('Success'), 'Task started success pop up is not displayed').toBe(true);
    expect(await mobileTaskManagementPage.closePopup('Success'), 'Task started success pop up is not closed').toBe(true);
    expect(await mobileTaskManagementPage.isStatusDisplayed('INPROGRESS'), 'Task status is not INPROGRESS after starting the task').toBe(true);

    await mobileTaskManagementPage.endTask();
    expect(await mobileTaskManagementPage.isPopupDisplayed('Success'), 'Task ended success pop up is not displayed').toBe(true);
    expect(await mobileTaskManagementPage.closePopup('Success'), 'Task ended success pop up is not closed').toBe(true);
    expect(await mobileTaskManagementPage.isStatusDisplayed('COMPLETED'), 'Task status is not COMPLETED after ending the task').toBe(true);
    // console.log(`Design Studio task of PJO ${802600868} is completed in the Awal mobile app`);
});

// test('Mobile App: Verify the Quality Control task of the PJO is assigned, started and completed by the Quality Control employee', async ({ modules, loginPage, homePage, salesEnquiryPage, productionJobOrderPage, page }) => {
//     const productionData = getProductionData();
//     await loginPage.launchAwalWebsite();
//     await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
//     await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
//     console.log("Login successfull");
//     await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
//     await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
//     await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
//     await modules.goToModule({ module: 'Production', subModule: 'PJOs & Tasks', nestedSubModule: 'PJO Progress & Status Tracking' });
//     await productionJobOrderPage.search('802600867');
//     await productionJobOrderPage.clickViewIcon();
//     await productionJobOrderPage.expandDepartment('Design Studio');
//     await expect(productionJobOrderPage.status('Running'), 'PJO approved status does not match').toBeVisible();
//     await productionJobOrderPage.validateDepartmentTaskProgressTable(productionData.designStudioEmployee);
//     await productionJobOrderPage.expandDepartment('Design Studio');
// });