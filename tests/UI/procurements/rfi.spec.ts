import { test, expect } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";
import { addBOQData } from "../../../testData/addBoqData";
import { getMaterialPayload } from "../../../API-payloads/createMaterialPayload";
import { getMIRDetails, type CreateMIRData } from "../../../testData/createMIR";

test.describe('Request For Info - Subcontractor Service End-to-End Scenarios', () => {
  let createEnquiryData: SalesEnquiryData;
  let MIRDetails: CreateMIRData;
  let extId: string;
  let enquiryId: string;
  let accessToken: string;
  let createdMaterialId: string;
  let material: string;
  test.setTimeout(460000);

  test.beforeEach('Create Sales Enquiry', async ({ salesEnquiryPage, productsPage, loginPage, page, homePage, createMaterialAPI, salesEnquiryAPI }) => {
    MIRDetails = getMIRDetails();
    createEnquiryData = getCreateEnquiryData();
    createEnquiryData.product = ['Acrylic Products'];

    await test.step('Create a raw material through API', async () => {
      accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
      const materialPayload = getMaterialPayload();
      createdMaterialId = await createMaterialAPI.createMaterial(accessToken, materialPayload);
      material = materialPayload.materialName;
      MIRDetails.material = material;
      console.log(`Material created: "${materialPayload.materialName}"`);
    });

    await test.step('Login and navigate to Sales Enquiry', async () => {
      await loginPage.launchAwalWebsite();
      await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
      await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
      console.log("Login successfull");
      await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
      await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
      await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
    });

    await test.step('Create a sales enquiry', async () => {
      await salesEnquiryPage.clickCreateEnquiryButton();
      await expect(salesEnquiryPage.createSalesEnquiryTitle, "Create Sales Enquiry title does not match").toHaveText('Create Sales Enquiry');
      await salesEnquiryPage.enterCustomerName(createEnquiryData);
      await salesEnquiryPage.createSalesEnquiry(createEnquiryData);
      extId = await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
      await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
      console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
    });

    await test.step('Enter and save the selected product details', async () => {
      await productsPage.validateProductTabsListed(createEnquiryData.product);
      await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
      await expect(page, "Sales Enquiry list page is not opened").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
    });
  });

  test.afterEach('Delete Sales Enquiry', async ({ salesEnquiryAPI, page, createMaterialAPI }) => {
    await page.close();
    if (createdMaterialId) {
      await createMaterialAPI.deleteMaterial(accessToken, createdMaterialId);
    }
    await salesEnquiryAPI.deleteSalesEnquiryIfCreated(extId);
  });

  test('Verify a subcontractor service in a cost estimation is procured through a vendor quote comparison and the awarded vendor price reflects in the cost distribution', async ({ salesEnquiryPage, ppjoPage, page, modules, requestNormalPage, costEstimationPage, procurementPage }) => {

    await test.step('Create PPJO and raise procurement and estimation requests', async () => {
      await salesEnquiryPage.search(createEnquiryData.customerName);
      await expect(salesEnquiryPage.createdSalesEnquiry(createEnquiryData.customerName), `Created sales enquiry is not visible for customer: ${createEnquiryData.customerName}`).toBeVisible();
      await salesEnquiryPage.clickCreatePPJO();
      await expect(page, "Create PPJO page was not opened").toHaveURL(/create-ppjo/);
      await ppjoPage.validateSalesEnquiryDetailsInPPJO(createEnquiryData);
      await ppjoPage.requestProcurement();
      await ppjoPage.validatePPJOAPI(201, 'Request Procurement');
      await expect(ppjoPage.successMessage('Procurement request submitted successfully'), "Request Procurement success message does not match").toContainText('Procurement request submitted successfully');
      await ppjoPage.requestEstimation();
      await ppjoPage.validatePPJOAPI(201, 'Request Estimation');
      await expect(ppjoPage.successMessage('Estimation request submitted successfully'), "Request Estimation success message does not match").toContainText('Estimation request submitted successfully');
    });

    await test.step('Verify the enquiry moves to Pending From Estimation', async () => {
      await modules.goToModule({ subModule: 'Sales Enquiry' });
      await expect(page, "Sales Enquiry list page was not opened after going back from PPJO").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
      enquiryId = await salesEnquiryPage.search(createEnquiryData.customerName);
      await salesEnquiryPage.validateCustomerStatus(createEnquiryData.customerName, 'Pending From Estimation');
    });

    await test.step('Open the cost estimation from Estimation - Request (Normal)', async () => {
      await modules.goToModule({ module: 'Estimation', subModule: 'Request (Normal)' });
      const enqId = await salesEnquiryPage.search(enquiryId);
      expect(enqId, 'Enquiry not found in Estimation - Request (Normal)').toBe(enquiryId);
      await requestNormalPage.clickGenerateCostEstimation();
      await expect(costEstimationPage.costEstimationTitle, "Create Cost Estimation title does not match").toContainText('Create Cost Estimation');
    });

    await test.step('Add a BOQ and verify the BOQ details', async () => {
      await costEstimationPage.clickAddEstimation();
      await costEstimationPage.addBOQ(addBOQData);
      await costEstimationPage.validateAddBOQAPI(201);
      await expect(costEstimationPage.successMessage('BOQ created successfully'), "BOQ creation success message does not match").toContainText('BOQ created successfully');
      await costEstimationPage.clickGenerateCostEstimationAndValidateBOQ_API(200);
      await expect(costEstimationPage.boqDetailsTitle, "BOQ Details title does not match").toContainText('BOQ Details');
      await costEstimationPage.validateBOQDetails(addBOQData);
    });

    await test.step('Add consumables percentage', async () => {
      await costEstimationPage.addConsumables('3');
      await costEstimationPage.validateConsumablesAPI(200);
      await expect(costEstimationPage.successMessage('Consumable percentage updated successfully'), "Consumable percentage updated success message does not match").toContainText('Consumable percentage updated successfully');
    });

    await test.step('Add the out of stock material to the BOM', async () => {
      await expect(costEstimationPage.addBOMBtn, "Add BOM button is not enabled").toBeEnabled();
      MIRDetails.quantity = '30';
      await costEstimationPage.addBOM(material, MIRDetails.quantity, '1');
      await costEstimationPage.validateAddBOM_API(201);
      await expect(costEstimationPage.successMessage('BOM created successfully'), "BOM creation success message does not match").toContainText('BOM created successfully');
      await expect(costEstimationPage.status('Out of Stock'), `Stock status of material "${material}" is not Out of Stock in the BOM table`).toBeVisible();
    });

    await costEstimationPage.goToTab('BOL - Bill of Labour');
    await costEstimationPage.editBOLDepartment('Design Studio', '4', '3', '2', '1');
    await costEstimationPage.validateLabourAndCostingAPI(200);
    await costEstimationPage.editBOLDepartment('Welding', '4', '3', '2', '1');
    await costEstimationPage.validateLabourAndCostingAPI(200);
    await costEstimationPage.editBOLDepartment('Vinyl Graphics & Application', '5', '6', '7', '3');
    await costEstimationPage.validateLabourAndCostingAPI(200);
    await costEstimationPage.editBOLDepartment('Plotter Cutting', '4', '3', '2', '1');
    await costEstimationPage.validateLabourAndCostingAPI(200);

    await costEstimationPage.goToTab('BOM - Bill of Material');
    await costEstimationPage.addBOL('4', '3', '2', '1');
    await costEstimationPage.validateAddBOLAPI(200);
    await costEstimationPage.editBOLDepartment('Design Studio', '4', '3', '2', '1');
    await costEstimationPage.validateAddBOLAPI(200);
    await costEstimationPage.editBOLDepartment('Welding', '4', '3', '1', '9');
    await costEstimationPage.validateAddBOLAPI(200);
    await costEstimationPage.editBOLDepartment('Vinyl Graphics & Application', '5', '6', '7', '3');
    await costEstimationPage.validateAddBOLAPI(200);
    await costEstimationPage.editBOLDepartment('Plotter Cutting', '4', '3', '2', '1');
    await costEstimationPage.validateAddBOLAPI(200);

    await costEstimationPage.goToTab('Cost Estimation Page');
    await costEstimationPage.validateAddBOLAPI(200);
    await costEstimationPage.validateLabourAndCostingAPI(200);

    await costEstimationPage.goToTab('Cost Distribution');
    await costEstimationPage.validateAddBOLAPI(200);
  });
});

test('test', async ({ page }) => {
  await page.locator('div').filter({ hasText: /^Sales$/ }).locator('img').click();
  await page.locator('#root').getByText('Sales Enquiry').click();
  await page.locator('.flex.items-center.justify-between.w-full').first().click();
  await page.getByRole('button', { name: 'Sales Enquiry' }).click();
  await page.getByRole('textbox', { name: 'Customer Name*' }).click();
  await page.getByRole('textbox', { name: 'Customer Name*' }).fill('Tester user ');
  await page.getByRole('textbox', { name: 'Flat / Villa' }).click();
  await page.getByRole('textbox', { name: 'Flat / Villa' }).fill('flat 2');
  await page.getByRole('textbox', { name: 'Building' }).click();
  await page.getByRole('textbox', { name: 'Building' }).fill('building 2');
  await page.getByRole('textbox', { name: 'Block' }).click();
  await page.getByRole('textbox', { name: 'Road' }).click();
  await page.getByRole('textbox', { name: 'Road' }).fill('road 2');
  await page.getByRole('textbox', { name: 'Block' }).click();
  await page.getByRole('textbox', { name: 'Block' }).fill('block 2');
  await page.getByRole('textbox', { name: 'Area' }).click();
  await page.getByRole('textbox', { name: 'Area' }).fill('area 2');
  await page.locator('div:nth-child(6) > .flex > .MuiInputBase-root').first().click();
  await page.getByRole('spinbutton', { name: 'Telephone Number 1' }).fill('987654321');
  await page.getByPlaceholder('Enter Mobile Number 1').click();
  await page.getByPlaceholder('Enter Mobile Number 1').fill('987654321');
  await page.getByRole('spinbutton', { name: 'Fax' }).click();
  await page.getByRole('spinbutton', { name: 'Fax' }).fill('2');
  await page.getByRole('spinbutton', { name: 'Telephone Number 2' }).click();
  await page.getByRole('spinbutton', { name: 'Telephone Number 2' }).fill('896745321');
  await page.getByRole('textbox', { name: 'Email 1' }).click();
  await page.getByRole('textbox', { name: 'Email 1' }).fill('xyz@gmail.com');
  await page.getByRole('textbox', { name: 'Email 2' }).click();
  await page.getByRole('textbox', { name: 'P.O. Box' }).click();
  await page.getByRole('combobox', { name: 'Country' }).click();
  await page.getByRole('option', { name: 'China' }).click();
  await page.getByRole('combobox', { name: 'State' }).click();
  await page.getByText('Guangdong Province').click();
  await page.getByRole('combobox', { name: 'City' }).click();
  await page.getByRole('option', { name: 'Guangdong' }).click();
  await page.getByRole('textbox', { name: 'Project Name' }).click();
  await page.getByRole('textbox', { name: 'Project Name' }).fill('Sales Enquiry Test');
  await page.locator('div').filter({ hasText: /^NormalUrgent$/ }).locator('div').first().click();
  await page.locator('div').filter({ hasText: /^IndoorOutdoor$/ }).locator('div').nth(1).click();
  await page.locator('div').filter({ hasText: /^Promotional \(3 to 6 Month\)Long term \(1 to 2 Year\)$/ }).locator('div').nth(1).click();
  await page.locator('div:nth-child(4) > .p-\\[18px\\].undefined > .grid > div > .flex.flex-col > .flex.\\!gap-8 > label > .w-4').first().click();
  await page.getByRole('textbox', { name: 'Material Thickness' }).click();
  await page.getByRole('textbox', { name: 'Material Thickness' }).fill('54');
  await page.getByRole('textbox', { name: 'Size (Dimension)' }).click();
  await page.getByRole('textbox', { name: 'Size (Dimension)' }).fill('2');
  await page.getByRole('textbox', { name: 'Color/Finish' }).click();
  await page.getByRole('textbox', { name: 'Color/Finish' }).fill('red');
  await page.locator('div').filter({ hasText: /^Supply OnlyInstallation OnlySupply & Installation$/ }).locator('div').first().click();
  await page.getByRole('textbox', { name: 'Wall finishing Details' }).click();
  await page.getByRole('textbox', { name: 'Wall finishing Details' }).fill('glass');
  await page.getByRole('combobox', { name: 'Type Of Equipment Required' }).click();
  await page.getByRole('option', { name: 'Cradle' }).click();
  await page.locator('section').filter({ hasText: 'Is the Permission required:' }).click();
  await page.getByRole('textbox', { name: 'Equipment Provided by' }).click();
  await page.getByRole('textbox', { name: 'Equipment Provided by' }).fill('iron');
  await page.locator('section').filter({ hasText: 'Is the Permission required:' }).locator('div').nth(3).click();
  await page.getByRole('textbox', { name: 'Power Supply' }).click();
  await page.getByRole('textbox', { name: 'Power Supply' }).fill('yes');
  await page.getByRole('combobox', { name: 'Select products*' }).click();
  await page.getByRole('option', { name: 'Embroidery & Tailoring' }).click();
  await page.getByRole('option', { name: 'ATM Products' }).click();
  await page.getByRole('button', { name: 'Choose date' }).first().click();
  await page.getByText('19').click();
  await page.getByRole('combobox', { name: 'Payment Terms*' }).click();
  await page.getByText('% Advance Full Payment').click();
  await page.getByRole('combobox', { name: 'Supply Type*' }).click();
  await page.getByRole('option', { name: 'Local' }).click();
  await page.getByRole('button', { name: 'Choose date', exact: true }).click();
  await page.getByText('19').click();
  await page.getByRole('button', { name: 'Create Enquiry' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Sales enquiry upserted' }).click();
  await page.getByRole('combobox', { name: 'Category' }).click();
  await page.getByRole('option', { name: 'Badges' }).click();
  await page.locator('.grid').first().click();
  await page.getByRole('combobox', { name: 'Material / Finish' }).click();
  await page.getByRole('option', { name: 'Back Stiff' }).click();
  await page.locator('.grid').first().click();
  await page.getByRole('combobox', { name: 'Tailoring Options' }).click();
  await page.getByRole('option', { name: 'Flags' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Embroidery tailoring created' }).click();
  await page.getByRole('combobox', { name: 'Aluminium' }).click();
  await page.getByRole('option', { name: 'Painted' }).click();
  await page.getByRole('combobox', { name: 'Stainless Steel' }).click();
  await page.getByRole('option', { name: 'Mirror Finish' }).click();
  await page.getByRole('combobox', { name: 'Brass' }).click();
  await page.getByRole('option', { name: 'Gold Plated' }).click();
  await page.getByRole('combobox', { name: 'Titanium Steel' }).click();
  await page.getByRole('option', { name: 'Gold Mirror' }).click();
  await page.getByRole('combobox', { name: 'Copper' }).click();
  await page.getByRole('option', { name: 'Brush' }).click();
  await page.locator('div:nth-child(2) > .p-0 > div:nth-child(3) > .grid.grid-cols-4').click();
  await page.getByRole('combobox', { name: 'Illumination Options' }).click();
  await page.getByRole('option', { name: 'Led Module' }).click();
  await page.locator('div:nth-child(2) > .p-0 > div:nth-child(3) > .grid.grid-cols-4').click();
  await page.getByRole('combobox', { name: 'Mounting Options' }).click();
  await page.getByRole('option', { name: 'Panel Mount' }).click();
  await page.getByRole('combobox', { name: 'Mounting Options' }).click();
  await page.getByRole('option', { name: 'Spacers' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Atm products created' }).click();
});