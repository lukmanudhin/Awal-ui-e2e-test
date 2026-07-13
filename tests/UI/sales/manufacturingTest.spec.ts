import { expect } from "@playwright/test";
import { test } from "../../../fixtures/baseFixtures";
import { ENV } from "../../../utils/ENV";
import { getCreateEnquiryData, type SalesEnquiryData } from "../../../testData/salesEnquiryData";
import { getManufacturingData, type ManufacturingData } from "../../../testData/manufacturingData";

test.describe('Create Manufacturing E2E Flow', () => {
    let createEnquiryData: SalesEnquiryData;
    let manufacturingData: ManufacturingData;
    let accessToken: string;
    let extId: string;
    test.setTimeout(160000);
    test.beforeEach('Login', async ({ page, loginPage, homePage, salesEnquiryPage, salesEnquiryAPI, stockViewAPI }) => {
        createEnquiryData = getCreateEnquiryData();
        manufacturingData = getManufacturingData();
        accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        manufacturingData.material = await stockViewAPI.getMaterialWithHighStock(accessToken);

        await test.step('Login', async () => {
            await loginPage.launchAwalWebsite();
            await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
            console.log("Login successfull");
            await homePage.goToMenuAndSubMenu("Sales", 'Sales Enquiry');
            await expect(page, "Sales Enquiry page not found").toHaveURL(`${ENV.BASE_URL}/sales/sales-enquiry`);
            await expect(salesEnquiryPage.salesEnquiryTitle, "Sales Enquiry title does not match").toHaveText('Sales Enquiry');
        });
    });

    test.afterEach('Delete Manufacturing', async ({ salesEnquiryAPI, page }) => {
        await page.close();
        const deleteAPIResponse = await salesEnquiryAPI.deleteSalesEnquiry(accessToken, extId);
        expect(deleteAPIResponse.message, 'Delete Sales Enquiry API Message Mismatch').toBe('Data deleted successfully');
        console.log('----------------------Delete Sales Enquiry API Response---------------------');
        console.log('API Response:', deleteAPIResponse);
    });

    test('Verify new Manufacturing enquiry is created successfully', async ({ ppjoPage, manufacturingPage, modules, salesEnquiryPage, productsPage }) => {
        await modules.goToModule({ module: "Sales", subModule: 'Counter Sales', nestedSubModule: 'Manufacturing' });
        await salesEnquiryPage.clickCreateEnquiryButton();
        createEnquiryData.product = ['Acrylic Products'];
        await salesEnquiryPage.enterCustomerName(createEnquiryData);
        await salesEnquiryPage.createSalesEnquiry(createEnquiryData);
        extId = await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
        await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
        console.log(`Sales enquiry created successfully for customer: ${createEnquiryData.customerName}`);
        await productsPage.validateProductTabsListed(createEnquiryData.product);
        await productsPage.enterAndSaveAllSelectedProductDetails(createEnquiryData.product);
        await salesEnquiryPage.search(createEnquiryData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Sales enquiry status does not match").toHaveText('Enquiry Created');
        await expect(salesEnquiryPage.createdSalesEnquiry(createEnquiryData.customerName), `Created sales enquiry is not visible for customer: ${createEnquiryData.customerName}`).toBeVisible();
        await manufacturingPage.clickManufacturing();
        await manufacturingPage.addManufacturingMaterial(manufacturingData);
        await expect(manufacturingPage.successMessage('Material added successfully'), "Manufacturing material added success message does not match").toHaveText('Material added successfully');
        await manufacturingPage.validateMaterialTable(manufacturingData);
        await manufacturingPage.createOrderAndValidateAPI(200);
        await expect(manufacturingPage.successMessage('Trading order created successfully'), "Trading order created success message does not match").toHaveText('Trading order created successfully');
        await ppjoPage.validateSampleDetails(createEnquiryData.customerName, createEnquiryData.city, createEnquiryData.country, createEnquiryData.telephoneNumber1);
        await manufacturingPage.requestApprovalAndValidateAPI(200);
        await expect(manufacturingPage.successMessage('Trading sent for approval'), "Trading sent for approval message does not match").toHaveText('Trading sent for approval');
        await manufacturingPage.search(createEnquiryData.customerName);
        await expect(salesEnquiryPage.socialMediaStatus, "Sales enquiry status does not match").toHaveText('Pending For Approval');
        await modules.goToModule({ nestedSubModule: 'Manufacturing Approval' });
        await manufacturingPage.search(createEnquiryData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Manufacturing approval status does not match").toHaveText('Pending For Approval');
        await manufacturingPage.clickManufacturing();
        await ppjoPage.validateSampleDetails(createEnquiryData.customerName, createEnquiryData.city, createEnquiryData.country, createEnquiryData.telephoneNumber1);
        await manufacturingPage.validateMaterialTable(manufacturingData);
        await manufacturingPage.approveInvoiceAndValidateAPI(200);
        await expect(manufacturingPage.successMessage('Trading approved successfully'), "Trading approved success message does not match").toHaveText('Trading approved successfully');
        await manufacturingPage.goToTab('History');
        await manufacturingPage.search(createEnquiryData.customerName);
        await expect(salesEnquiryPage.enquiryStatus, "Manufacturing approval status does not match").toHaveText('Approved');
        await modules.goToModule({ nestedSubModule: "Manufacturing" });
        await manufacturingPage.search(createEnquiryData.customerName);
        await expect(salesEnquiryPage.socialMediaStatus, "Manufacturing status does not match").toHaveText('Approved');
        await manufacturingPage.clickManufacturing();
        await manufacturingPage.validateMaterialTable(manufacturingData);
        await manufacturingPage.createOrderAndValidateAPI(200);
        await expect(manufacturingPage.successMessage('Trading order created successfully'), "Trading order created success message does not match").toHaveText('Trading order created successfully');
        await manufacturingPage.enterPaymentMethodAndCampaign(manufacturingData);
        await manufacturingPage.generateInvoiceAndValidateAPI(200);
        await expect(manufacturingPage.successMessage('Invoice generated successfully'), "Invoice generated success message does not match").toHaveText('Invoice generated successfully');
        await modules.goToModule({ nestedSubModule: "Manufacturing" });
        await manufacturingPage.search(createEnquiryData.customerName);
        await expect(salesEnquiryPage.socialMediaStatus, "Manufacturing status does not match").toHaveText('Completed');
        await manufacturingPage.clickViewInvoice();
        await ppjoPage.validateSampleDetails(createEnquiryData.customerName, createEnquiryData.city, createEnquiryData.country, createEnquiryData.telephoneNumber1);
        await manufacturingPage.validateMaterialTable(manufacturingData);
    });
});