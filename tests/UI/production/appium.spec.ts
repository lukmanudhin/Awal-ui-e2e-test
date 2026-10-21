import { test, expect } from "../../../fixtures/baseFixtures";
import { request as playwrightRequest } from "@playwright/test";
import { SalesEnquiryAPI } from "../../../API/salesEnquiryAPI";
import { CreateMaterialAPI } from "../../../API/createMaterialAPI";
import type { EstimationAPI } from "../../../API/estimationAPI";
import { salesEnquiryNormalPayload } from "../../../API-payloads/salesEnquiryNormalPayload";
import { getMaterialPayload } from "../../../API-payloads/createMaterialPayload";
import { addBOQData } from "../../../testData/addBoqData";
import { getCreateEnquiryData } from "../../../testData/salesEnquiryData";
import { getProductionData } from "../../../testData/productionData";
import { ENV } from "../../../utils/ENV";
import { Utils } from "../../../utils/utils";
import { ApiLogger } from "../../../utils/apiLogger";

test.describe.serial('Verify E2E flow of Sales Enquiry (Request Normal) through API and return the Sales Order Id', () => {
    test.setTimeout(600000);
    let accessToken: string;
    let enquiryId: string;
    let ppjoId: number;
    let ppjoNumber: string;
    let salesEnquiryNumericId: number;
    let enquiryNumber: string;
    let requestNormalExtId: string;
    let estimationVerOptExtId: string;
    let estimationDetailExtId: string;
    let quotationExtId: string;
    let invoiceExtId: string;
    let salesOrderExtId: string;
    // Sales order number (e.g. 152601354) as shown in the Sales Order list - prerequisite for the production tests that follow
    let salesOrderId: string;
    let createdMaterialExtId: string;
    let materialWithoutStock: string;
    let materialWithStock: string;
    let estimatorName: string;
    let projectManagerName: string;

    const customerName = salesEnquiryNormalPayload.customerName;
    const mobileNumber = salesEnquiryNormalPayload.addresses[0].mobile;
    const createEnquiryData = getCreateEnquiryData();
    const productionData = getProductionData();
    addBOQData.finishedProduct = 'Digital Banner';

    // Builds a BOM line the same way the Add BOM form does: id, price, UOM and description come from the selected material
    const buildBomLine = async (estimationAPI: EstimationAPI, materialName: string) => {
        const materialId = await estimationAPI.getMaterialIdByName(accessToken, materialName);
        const details = await estimationAPI.getMaterialDetailsById(accessToken, materialId);
        return {
            consumablePercentage: 3,
            materialId,
            quantity: Number(createEnquiryData.quantity),
            price: details.result.price,
            isAncillary: false,
            ancillaryName: '',
            ancillaryCode: '',
            ancillaryUomId: details.result.uomId,
            ancillarySize: '',
            ancillaryDescription: details.result.description,
            isExistingAncillary: false,
            warrantyTypeId: 1,
            warrantyPercentage: 1,
            warrantyValue: 0,
        };
    };

    // Values entered in the BOL tab of the UI flow for the departments that belong to the Digital Banner BOQ
    const digitalBannerBolData: Record<string, { estHours: number; machineUtilizationHours: number; otHoursPercentage: number; warrantyPercentage: number }> = {
        'Design Studio': { estHours: 4, machineUtilizationHours: 3, otHoursPercentage: 2, warrantyPercentage: 1 },
        'Vinyl Graphics & Application': { estHours: 5, machineUtilizationHours: 6, otHoursPercentage: 7, warrantyPercentage: 3 },
    };

    test.beforeAll('Setup', async () => {
        console.log('Test Start Time: ', Utils.getCurrentTime());
    });

    test.afterAll('Teardown', async () => {
        const request = ApiLogger(await playwrightRequest.newContext());
        if (enquiryId) {
            const salesEnquiryAPI = new SalesEnquiryAPI(request);
            await salesEnquiryAPI.deleteSalesEnquiry(accessToken, enquiryId);
        }
        if (createdMaterialExtId) {
            const createMaterialAPI = new CreateMaterialAPI(request);
            await createMaterialAPI.deleteMaterial(accessToken, createdMaterialExtId);
        }
        await request.dispose();
    });

    // The whole sales order creation flow runs here so the test body only receives the ready-to-use salesOrderId
    test.beforeEach(async ({ createMaterialAPI, stockViewAPI, salesEnquiryAPI, ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI, loginPage, homePage, page, salesEnquiryPage }) => {
        await test.step('Get access token', async () => {
            accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        });

        await test.step('Verify Create Material API and pick the material with stock', async () => {
            const materialPayload = getMaterialPayload();
            createdMaterialExtId = await createMaterialAPI.createMaterial(accessToken, materialPayload);
            expect(createdMaterialExtId, 'Created material extId was not returned').toBeTruthy();
            materialWithoutStock = materialPayload.materialName;
            materialWithStock = await stockViewAPI.getMaterialWithHighStock(accessToken, 'RawMaterials');
            console.log(`Material created: "${materialWithoutStock}", material with stock: "${materialWithStock}"`);
        });

        await test.step('Verify Create Sales Enquiry API', async () => {
            const response = await salesEnquiryAPI.createSalesEnquiryAPI(accessToken, salesEnquiryNormalPayload);
            expect(response.message, 'Create Sales Enquiry API Message Mismatch').toBe('Data created successfully');
            enquiryId = response.result.extId;
            console.log('Created Sales Enquiry extId:', enquiryId);
        });

        await test.step('Verify Create Acrylic Products API', async () => {
            const response = await salesEnquiryAPI.createAcrylicProducts(accessToken, enquiryId);
            expect(response.message, 'Create Acrylic Products API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Request Artwork PPJO API', async () => {
            const response = await ppjoAPI.requestArtwork(accessToken, enquiryId, '5', 'Artwork requirement details');
            expect(response.message, 'Request Artwork PPJO API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Request AutoCAD PPJO API', async () => {
            const response = await ppjoAPI.requestAutoCAD(accessToken, enquiryId, '5', 'AutoCAD requirement details');
            expect(response.message, 'Request AutoCAD PPJO API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Request Site Visit PPJO API', async () => {
            const today = new Date();
            const siteVisitDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
            const response = await ppjoAPI.requestSiteVisit(accessToken, enquiryId, '287', siteVisitDate);
            expect(response.message, 'Request Site Visit PPJO API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Request Procurement PPJO API', async () => {
            const response = await ppjoAPI.requestProcurement(accessToken, enquiryId, '5', 'Procurement requirement details');
            expect(response.message, 'Request Procurement PPJO API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Request Estimation PPJO API', async () => {
            const response = await ppjoAPI.requestEstimation(accessToken, enquiryId, '5', 'Estimation requirement details');
            expect(response.message, 'Request Estimation PPJO API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Get PPJO By Reference Id API', async () => {
            const response = await ppjoAPI.getPpjoByReferenceId(accessToken, enquiryId);
            expect(response.message, 'Get PPJO By Reference Id API Message Mismatch').toBe('Data fetched successfully');
            ppjoId = response.result.ppjoId;
            ppjoNumber = response.result.ppjoCode;
            salesEnquiryNumericId = response.result.salesEnquiryId;
            enquiryNumber = response.result.referenceNumber;
            expect(ppjoId, 'PPJO Id was not resolved after creating job requests').toBeGreaterThan(0);
            expect(ppjoNumber, 'PPJO Number/Code was not resolved after creating job requests').toBeTruthy();
            console.log('Resolved ppjoId:', ppjoId, 'ppjoNumber:', ppjoNumber, 'salesEnquiryId:', salesEnquiryNumericId);
        });

        await test.step('Verify Estimation Request (Normal) is available for the enquiry', async () => {
            requestNormalExtId = await estimationAPI.getRequestNormalExtId(accessToken, enquiryId, enquiryNumber);
            expect(requestNormalExtId, 'Request Normal extId was not resolved').toBeTruthy();
            console.log('Resolved requestNormalExtId:', requestNormalExtId);
        });

        await test.step('Verify Assign Estimator API', async () => {
            const estimator = await estimationAPI.getRandomEstimator(accessToken);
            estimatorName = estimator.name;
            const response = await estimationAPI.assignEstimator(accessToken, requestNormalExtId, estimator.id);
            expect(response.success, `Assign Estimator API did not report success for ${estimator.name}`).toBe(true);
        });

        await test.step('Verify Assign Project Manager API', async () => {
            const projectManager = await estimationAPI.getRandomProjectManager(accessToken);
            projectManagerName = projectManager.name;
            const response = await estimationAPI.assignProjectManager(accessToken, requestNormalExtId, projectManager.id);
            expect(response.success, `Assign Project Manager API did not report success for ${projectManager.name}`).toBe(true);
        });

        await test.step('Verify Create BOQ API', async () => {
            const fgProductId = await estimationAPI.getFinishedProductId(accessToken, addBOQData.finishedProduct);
            const response = await estimationAPI.createBoq(accessToken, ppjoNumber, {
                signCode: addBOQData.signCode,
                signType: addBOQData.signType,
                signName: addBOQData.signName,
                description: addBOQData.description,
                size: addBOQData.size,
                quantity: Number(addBOQData.quantity),
                deliveryTypeId: 1232,
                deliveryPeriod: Number(addBOQData.deliveryPeriod),
                warrantyTypeId: 1233,
                warrantyPeriod: Number(addBOQData.warrantyPeriod),
                fgProductId,
            });
            expect(response.message, 'Create BOQ API Message Mismatch').toBe('Data created successfully');
            estimationVerOptExtId = response.result;
            console.log('Created estimationVerOptExtId:', estimationVerOptExtId);
        });

        await test.step('Verify Get All BOQ API', async () => {
            const response = await estimationAPI.getAllBoq(accessToken, estimationVerOptExtId);
            expect(response.message, 'Get All BOQ API Message Mismatch').toBe('Data fetched successfully');
            estimationDetailExtId = response.result[0].boqDetailExtId;
            expect(estimationDetailExtId, 'BOQ detail extId was not resolved').toBeTruthy();
            console.log('Resolved estimationDetailExtId:', estimationDetailExtId);
        });

        await test.step('Verify Update Consumable Percentage API', async () => {
            const response = await estimationAPI.updateConsumableByEstimationDetailId(accessToken, estimationDetailExtId, false, 3);
            expect(response.message, 'Update Consumable Percentage API Message Mismatch').toBe('Data updated successfully');
        });

        await test.step('Verify Create Estimation BOM API for the material with stock', async () => {
            const bomLine = await buildBomLine(estimationAPI, materialWithStock);
            const response = await estimationAPI.createEstimationBom(accessToken, estimationDetailExtId, false, [bomLine]);
            expect(response.message, 'Create Estimation BOM (material with stock) API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Create Estimation BOM API for the newly created material', async () => {
            const bomLine = await buildBomLine(estimationAPI, materialWithoutStock);
            const response = await estimationAPI.createEstimationBom(accessToken, estimationDetailExtId, false, [bomLine]);
            expect(response.message, 'Create Estimation BOM (new material) API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Update Estimation BOL API for the Digital Banner departments', async () => {
            const bolResponse = await estimationAPI.getAllBolById(accessToken, estimationDetailExtId, false);
            expect(bolResponse.message, 'Get All BOL By Id API Message Mismatch').toBe('Data fetched successfully');
            const bolList = bolResponse.result.bol;
            expect(bolList.map((bol: { departmentName: string }) => bol.departmentName).sort(), 'Digital Banner BOL departments do not match').toEqual(Object.keys(digitalBannerBolData).sort());

            for (const bol of bolList) {
                const data = digitalBannerBolData[bol.departmentName];
                const response = await estimationAPI.updateEstimationBolById(accessToken, {
                    departmentId: bol.departmentId,
                    description: bol.description,
                    machineUtilizationHours: data.machineUtilizationHours,
                    hourlyRate: bol.hourlyRate,
                    estHours: data.estHours,
                    otHoursPercentage: data.otHoursPercentage,
                    warrantyTypeId: 1,
                    warrantyPercentage: data.warrantyPercentage,
                    warrantyValue: null,
                    bolExtId: bol.bolExtId,
                    isVariation: false,
                });
                expect(response.message, `Update Estimation BOL API Message Mismatch for department ${bol.departmentName}`).toBe('Data updated successfully');
            }
        });

        await test.step('Verify Create Summary API with variation', async () => {
            const response = await estimationAPI.createSummary(accessToken, estimationDetailExtId, false, 1);
            expect(response.message, 'Create Summary API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Create Cost Distribution API', async () => {
            const response = await estimationAPI.createCostDistribution(accessToken, estimationDetailExtId);
            expect(response.message, 'Create Cost Distribution API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Calculate Summary With Incentive API', async () => {
            const response = await estimationAPI.calculateSummaryWithIncentive(accessToken, estimationVerOptExtId, estimationDetailExtId);
            expect(response.statusCode, 'Calculate Summary With Incentive API status code mismatch').toBe(200);
        });

        await test.step('Verify Generate Quotation API', async () => {
            const response = await quotationAPI.generateQuotation(accessToken, ppjoId, salesEnquiryNumericId, customerName, 61, estimationVerOptExtId);
            expect(response.message, 'Generate Quotation API Message Mismatch').toBe('Data created successfully');
            quotationExtId = response.result;
            console.log('Created quotationExtId:', quotationExtId);
        });

        await test.step('Verify Submit Quotation For Approval API', async () => {
            const response = await quotationAPI.submitForApproval(accessToken, quotationExtId);
            expect(response.status(), 'Submit Quotation For Approval API status code mismatch').toBe(200);
        });

        await test.step('Verify Quotation Manager Approve API', async () => {
            const response = await quotationAPI.quotationManagerApprove(accessToken, quotationExtId, true, '');
            expect(response.message, 'Quotation Manager Approve API Message Mismatch').toBe('Data updated successfully');
        });

        await test.step('Verify Send To Customer API', async () => {
            const response = await quotationAPI.sendToCustomer(accessToken, quotationExtId);
            expect(response.message, 'Send To Customer API Message Mismatch').toBe('Data updated successfully');
        });

        await test.step('Verify Quotation Approval (Customer Approved) API', async () => {
            const response = await quotationAPI.quotationApproval(accessToken, quotationExtId, '123', 144);
            expect(response.message, 'Quotation Approval API Message Mismatch').toBe('Data created successfully');
        });

        await test.step('Verify Send Advance Invoice API', async () => {
            const response = await quotationAPI.sendAdvanceInvoice(accessToken, quotationExtId, '123');
            expect(response.status(), 'Send Advance Invoice API status code mismatch').toBe(201);
        });

        await test.step('Verify Create Invoice Request API', async () => {
            const listResponse = await invoiceRequestAPI.getAllInvoiceRequest(accessToken, customerName);
            expect(listResponse.result.data.length, 'Auto-created invoice request was not found by customer name').toBeGreaterThan(0);
            invoiceExtId = listResponse.result.data[0].extId;

            const invoiceDate = new Date();
            invoiceDate.setDate(invoiceDate.getDate() + 2);
            const netDueDate = new Date();
            const response = await invoiceRequestAPI.createInvoiceRequest(accessToken, invoiceExtId, invoiceDate.toISOString(), netDueDate.toISOString());
            expect(response.message, 'Create Invoice Request API Message Mismatch').toBe('Data updated successfully');
            console.log('Resolved invoiceExtId:', invoiceExtId);
        });

        await test.step('Verify Invoice Manager Approval API', async () => {
            const response = await invoiceRequestAPI.updateManagerApproval(accessToken, invoiceExtId, true);
            expect(response.message, 'Invoice Manager Approval API Message Mismatch').toBe('Data Approved successfully');
        });

        await test.step('Verify Acknowledge Invoice File Upload API', async () => {
            const response = await invoiceRequestAPI.acknowledgeFileUpload(accessToken, invoiceExtId);
            expect(response.message, 'Acknowledge Invoice File Upload API Message Mismatch').toBe('Data updated successfully');
        });

        await test.step('Verify Create Sales Order API', async () => {
            const prepopulateResponse = await salesOrderAPI.getPrepopulateValues(accessToken, quotationExtId);
            const customerId = prepopulateResponse.result.customerId;

            const dateIso = new Date();
            dateIso.setDate(dateIso.getDate() - 1);
            dateIso.setUTCHours(18, 30, 0, 0);

            const response = await salesOrderAPI.createSalesOrder(accessToken, quotationExtId, customerId, customerName, mobileNumber, productionData.deliveryLocation, dateIso.toISOString());
            expect(response.message, 'Create Sales Order API Message Mismatch').toBe('Data created successfully');
            salesOrderExtId = response.result;
            console.log('Created salesOrderExtId:', salesOrderExtId);
        });

        await test.step('Verify Sales Order Id is returned for the created sales order', async () => {
            const response = await salesOrderAPI.getAllSalesOrder(accessToken, customerName);
            expect(response.message, 'Get All Sales Order API Message Mismatch').toBe('Data fetched successfully');
            const salesOrder = response.result.data.find((row: { salesOrderExtId: string }) => row.salesOrderExtId === salesOrderExtId);
            expect(salesOrder, `Created sales order ${salesOrderExtId} was not found in the sales order list`).toBeDefined();
            salesOrderId = salesOrder.salesOrderNumber;
            expect(salesOrderId, 'Sales Order Id (sales order number) was not resolved').toBeTruthy();
            console.log('Resolved salesOrderId:', salesOrderId);
        });

        await test.step('Verify Update Sales Checklist Status API', async () => {
            const response = await salesOrderAPI.updateSalesChecklistStatus(accessToken, salesOrderExtId, true, 'Approved');
            expect(response.message, 'Update Sales Checklist Status API Message Mismatch').toBe('Data updated successfully');
        });

        await test.step('Verify Sales Order Pending Approval API', async () => {
            const response = await salesOrderAPI.salesOrderPendingApproval(accessToken, salesOrderExtId);
            expect(response.message, 'Sales Order Pending Approval API Message Mismatch').toBe('Data updated successfully');
        });

        await test.step('Verify Update Sales Order Status API', async () => {
            const response = await salesOrderAPI.updateSalesOrderStatus(accessToken, salesOrderExtId, true, 'Approved');
            expect(response.message, 'Update Sales Order Status API Message Mismatch').toBe('Data updated successfully');
            console.log(`Sales order ${salesOrderId} is approved and ready for the production tests`);
        });

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

    test('Verify the sales order is processed in Production through MRP, PJO creation and PJO approval', async ({ modules, productionSalesOrderPage, mrpPage, productionJobOrderPage, salesOrderManagerPage, quotationManagerPage, invoiceRequestPage, mobileLoginPage }) => {
        expect(salesOrderId, 'Sales Order Id was not created in the beforeEach hook').toBeTruthy();
        console.log('Sales Order Id:', salesOrderId);
        const projectManagerDisplayName = projectManagerName.split(' - ').pop() || projectManagerName;
        const materials = [materialWithStock, materialWithoutStock];
        let productionEngineer: string;
        let mrpNumber: string;
        let pjoNumber: string;

        await test.step('Pending Sales Orders List: Verify sales order check list, sales order details, BOM and estimation', async () => {
            await modules.goToModule({ module: 'Production', subModule: 'Sales order Management', nestedSubModule: 'Pending Sales Orders List' });
            await productionJobOrderPage.search(salesOrderId);
            await productionJobOrderPage.clickViewIcon();
            await productionSalesOrderPage.validateCheckListHeader([
                `Customer Name-${customerName}`,
                `Sales Order No-${salesOrderId}`,
                `Currency-${productionData.currency}`,
            ]);
            await productionSalesOrderPage.validatePrefilledCheckList(productionData, customerName, mobileNumber);
            await productionSalesOrderPage.goToTab(`Sales Order #${salesOrderId}`);
            await productionSalesOrderPage.validateSalesOrderDetails([
                `Sales Enquiry Number-${enquiryNumber}`,
                `Project Name-${salesEnquiryNormalPayload.projectName}`,
                `Customer Name-${customerName}`,
                `Status-${productionData.salesOrderStatus}`,
                `Project Manager-${projectManagerDisplayName}`,
            ]);
            await invoiceRequestPage.validateBOQTableDetails(addBOQData);
            await productionSalesOrderPage.clickBackArrow();
            await productionSalesOrderPage.search(salesOrderId);
            await productionSalesOrderPage.viewBOM();
            await productionSalesOrderPage.validateBOQDetails(addBOQData);
            await productionSalesOrderPage.validateBOMDetails(materials);
            await productionSalesOrderPage.clickBackArrow();
            await productionSalesOrderPage.viewEstimation(salesOrderId);
            await productionSalesOrderPage.validateEstimationDetails([
                `Name of the Customer-${customerName}`,
                `Name of the Estimator-${estimatorName}`,
                `Name of the Project Manager-${projectManagerDisplayName}`,
                `Project Name-${salesEnquiryNormalPayload.projectName}`,
            ]);
            await productionSalesOrderPage.clickBackArrow();
        });

        await test.step('Assign SO to Production Engineer: Verify production engineer is assigned to the sales order', async () => {
            await modules.goToModule({ nestedSubModule: 'Assign SO to Production Engineer' });
            await productionSalesOrderPage.search(salesOrderId);
            await productionSalesOrderPage.expandSalesOrder(salesOrderId);
            await productionSalesOrderPage.validateSalesOrderDetails([
                salesOrderId,
                customerName,
                salesEnquiryNormalPayload.projectName,
                addBOQData.finishedProduct,
                addBOQData.description,
                'View BOM',
            ]);
            productionEngineer = await productionSalesOrderPage.selectProductionEngineer();
            await productionSalesOrderPage.validateAssignProductionEngineerAPI(200);
            await expect(productionSalesOrderPage.successMessage('Production Engineer assigned successfully'), 'Production engineer assigned success message does not match').toContainText('Production Engineer assigned successfully');
            console.log(`Production engineer ${productionEngineer} assigned to sales order ${salesOrderId}`);
        });

        await test.step('Material Requirement Planning: Verify MRP is run and PJO is created for the sales order', async () => {
            await modules.goToModule({ module: 'Material & Inventory', subModule: 'Production Management', nestedSubModule: 'Material Requirement Planning' });
            await mrpPage.clickCreateMRP();
            await mrpPage.search(salesOrderId);
            await expect(mrpPage.mainContent, 'Assigned production engineer is not displayed in the pending sales order list').toContainText(productionEngineer);
            await mrpPage.submitPendingSalesOrderAndValidateAPI(200);
            await expect(mrpPage.successMessage('MRP process started'), 'MRP process started success message does not match').toContainText('MRP process started');
            await mrpPage.validateSelectedSalesOrderDetails([
                salesOrderId,
                customerName,
                productionEngineer,
                addBOQData.description,
                'View BOM',
            ]);
            await mrpPage.enterPJOQuantity(productionData.pjoQuantity);
            await mrpPage.viewStockDetails();
            await mrpPage.validateStockHighlight(materialWithoutStock, materialWithStock);
            await expect(mrpPage.mainContent, 'Available materials list does not contain the BOM materials').toContainText(materialWithStock);
            await mrpPage.runMRPAndValidateAPI(201);
            await mrpPage.validateMRPCompleted();
            await mrpPage.validatePRRaisedLink();
            const prSheet = await mrpPage.openRaisedPRSheet();
            await expect(prSheet.purchaseRequestSheetTitle, 'Purchase Request Sheet title does not match').toBeVisible();
            // await expect(mrpPage.status('PO Pending'), 'PR status is not PO Pending').toBeVisible(); 
            await prSheet.validateRaisedMaterial(materialWithoutStock);
            await prSheet.page.close();

            await mrpPage.viewReport();
            await mrpPage.validateMRPResultsSummary(materialWithStock, materialWithoutStock);
            await mrpPage.startAllocationProcess();
            await mrpPage.validateAllocationProcessCompleted(materials.length);
            await mrpPage.viewReport();
            await mrpPage.validateAllocatedMaterialsReport([salesOrderId, customerName], materialWithStock, materialWithoutStock);
            await mrpPage.createPJOAndAssignDepartmentAndValidateAPI(201);
            await expect(mrpPage.mrpCreatedMessage, 'PJO created message does not match').toContainText('1 PJO & 1 Indents created under MRP No.');
            mrpNumber = await mrpPage.getMRPNumber();
            expect(mrpNumber, 'MRP number was not resolved from the PJO created pop up').toBeTruthy();
            pjoNumber = await mrpPage.getPJONumber(mrpNumber, salesOrderId);
            expect(pjoNumber, 'PJO number was not resolved under the MRP').toBeTruthy();
            console.log(`MRP ${mrpNumber} created PJO ${pjoNumber} for sales order ${salesOrderId}`);
        });

        await test.step('Production Job Order: Verify PJO details, BOM and BOL', async () => {
            await modules.goToModule({ nestedSubModule: 'Production Job Order' });
            await productionJobOrderPage.search(pjoNumber);
            await expect(productionJobOrderPage.status(productionData.pjoApprovalStatus), 'PJO approval status does not match').toBeVisible();
            await productionJobOrderPage.clickViewIcon();
            await productionJobOrderPage.validatePJODetails([
                `PJO Number-${pjoNumber}`,
                `PJO Quantity-${productionData.pjoQuantity}`,
                `Assigned Production Engineer-${productionEngineer}`,
                'PR Raised-Yes',
                `Sales Order Number-${salesOrderId}`,
                `Customer Name-${customerName}`,
            ]);
            await productionJobOrderPage.validatePJOMaterials(materials); 
            await productionJobOrderPage.validateMaterialsAndBOMStatus(materials);
            await productionJobOrderPage.goToTab('BOL');
            await productionJobOrderPage.validateBOLDepartments(productionData.bolDepartments); 
            await productionJobOrderPage.validateBOLDepartmentTable(productionData.bolDepartments);
            await productionJobOrderPage.clickBackArrow();
        });

        await test.step('Production Job Order (Manager): Verify PJO is approved by the manager', async () => {
            await modules.goToModule({ nestedSubModule: 'Production Job Order (Manager)' });
            await productionJobOrderPage.search(pjoNumber);
            await expect(productionJobOrderPage.status('Pending'), 'PJO approval status does not match').toBeVisible();
            await productionJobOrderPage.clickViewIcon();
            await productionJobOrderPage.validatePJODetails([`PJO Number-${pjoNumber}`, `Sales Order Number-${salesOrderId}`]);
            await productionJobOrderPage.validatePJOMaterials(materials);
            await productionJobOrderPage.approvePJOAndValidateAPI(201);
            await expect(productionJobOrderPage.successMessage('PJO approved successfully'), 'PJO approved success message does not match').toContainText('PJO approved successfully');
            await productionJobOrderPage.goToTab('Approved PJO Lists');
            await productionJobOrderPage.search(pjoNumber);
            await expect(productionJobOrderPage.status(productionData.pjoApprovedStatus), 'PJO approved status does not match').toBeVisible();
        });

        await test.step('PJO Progress & Status Tracking: Verify task progress of the approved PJO', async () => {
            await modules.goToModule({ module: 'PJOs & Tasks', nestedSubModule: 'PJO Progress & Status Tracking' });
            await productionJobOrderPage.search(pjoNumber);
            await productionJobOrderPage.clickViewIcon();
            await productionJobOrderPage.validatePJODetails([
                `Production Job Order - ${pjoNumber}`,
                `Sales Order-${salesOrderId}`,
                `Customer-${customerName}`,
                `Quantity-${productionData.pjoQuantity}`,
            ]);
            await productionJobOrderPage.validateTaskProgress(productionData.bolDepartments.length);
            console.log(`PJO ${pjoNumber} is approved and in progress`);
        });

        await test.step('Mobile App: Verify the Awal app is launched on the tablet and the user logs in with the same credentials', async () => {
            await mobileLoginPage.launchAwalApp();
            expect(await mobileLoginPage.isLoginScreenDisplayed(), 'Awal app login screen is not displayed after launching the app').toBe(true);
            await mobileLoginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
            expect(await mobileLoginPage.isLoggedIn(), 'Login to the Awal mobile app failed').toBe(true);
            console.log('Login successful in the Awal mobile app');
        });
    });
});
