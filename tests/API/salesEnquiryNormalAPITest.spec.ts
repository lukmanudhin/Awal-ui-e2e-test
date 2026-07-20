import { test, expect } from "../../fixtures/baseFixtures";
import { request as playwrightRequest } from "@playwright/test";
import { SalesEnquiryAPI } from "../../API/salesEnquiryAPI";
import { salesEnquiryNormalPayload } from "../../API-payloads/salesEnquiryNormalPayload";
import { ENV } from "../../utils/ENV";
import { Utils } from "../../utils/utils";
import { ApiLogger } from "../../utils/apiLogger";

test.describe.serial('Verify E2E flow of Sales Enquiry (Request Normal) through API', () => {
    let accessToken: string;
    let enquiryId: string;
    let ppjoId: number;
    let ppjoNumber: string;
    let salesEnquiryNumericId: number;
    let estimationVerOptExtId: string;
    let estimationDetailExtId: string;
    let quotationExtId: string;
    let invoiceExtId: string;
    let salesOrderExtId: string;

    const customerName = salesEnquiryNormalPayload.customerName;
    const mobileNumber = salesEnquiryNormalPayload.addresses[0].mobile;

    test.beforeAll('Setup', async () => {
        console.log('Test Start Time: ', Utils.getCurrentTime());
    });

    test.beforeEach(async ({ salesEnquiryAPI }) => {
        if (!accessToken) {
            accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        }
    });

    test.afterAll('Teardown', async () => {
        if (enquiryId) {
            const request = ApiLogger(await playwrightRequest.newContext());
            const salesEnquiryAPI = new SalesEnquiryAPI(request);
            await salesEnquiryAPI.deleteSalesEnquiry(accessToken, enquiryId);
            await salesEnquiryAPI.dispose();
        }
    });

    test('Verify Create Sales Enquiry API', async ({ salesEnquiryAPI }) => {
        const response = await salesEnquiryAPI.createSalesEnquiryAPI(accessToken, salesEnquiryNormalPayload);
        expect(response.message, 'Create Sales Enquiry API Message Mismatch').toBe('Data created successfully');
        enquiryId = response.result.extId;
        console.log('Created Sales Enquiry extId:', enquiryId);
    });

    test('Verify Create Acrylic Products API', async ({ salesEnquiryAPI }) => {
        const response = await salesEnquiryAPI.createAcrylicProducts(accessToken, enquiryId);
        expect(response.message, 'Create Acrylic Products API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Request Artwork PPJO API', async ({ ppjoAPI }) => {
        const response = await ppjoAPI.requestArtwork(accessToken, enquiryId, '5', 'Artwork requirement details');
        expect(response.message, 'Request Artwork PPJO API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Request AutoCAD PPJO API', async ({ ppjoAPI }) => {
        const response = await ppjoAPI.requestAutoCAD(accessToken, enquiryId, '5', 'AutoCAD requirement details');
        expect(response.message, 'Request AutoCAD PPJO API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Request Site Visit PPJO API', async ({ ppjoAPI }) => {
        const today = new Date();
        const siteVisitDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        const response = await ppjoAPI.requestSiteVisit(accessToken, enquiryId, '287', siteVisitDate);
        expect(response.message, 'Request Site Visit PPJO API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Request Procurement PPJO API', async ({ ppjoAPI }) => {
        const response = await ppjoAPI.requestProcurement(accessToken, enquiryId, '5', 'Procurement requirement details');
        expect(response.message, 'Request Procurement PPJO API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Request Estimation PPJO API', async ({ ppjoAPI }) => {
        const response = await ppjoAPI.requestEstimation(accessToken, enquiryId, '5', 'Estimation requirement details');
        expect(response.message, 'Request Estimation PPJO API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Get PPJO By Reference Id API', async ({ ppjoAPI }) => {
        const response = await ppjoAPI.getPpjoByReferenceId(accessToken, enquiryId);
        expect(response.message, 'Get PPJO By Reference Id API Message Mismatch').toBe('Data fetched successfully');
        ppjoId = response.result.ppjoId;
        ppjoNumber = response.result.ppjoCode;
        salesEnquiryNumericId = response.result.salesEnquiryId;
        expect(ppjoId, 'PPJO Id was not resolved after creating job requests').toBeGreaterThan(0);
        expect(ppjoNumber, 'PPJO Number/Code was not resolved after creating job requests').toBeTruthy();
        console.log('Resolved ppjoId:', ppjoId, 'ppjoNumber:', ppjoNumber, 'salesEnquiryId:', salesEnquiryNumericId);
    });

    test('Verify Create BOQ API', async ({ estimationAPI }) => {
        const response = await estimationAPI.createBoq(accessToken, ppjoNumber, {
            signCode: '12358',
            signType: 'Metal',
            signName: 'Customer',
            description: 'Add BOQ Test',
            size: '5',
            quantity: 2,
            deliveryTypeId: 1232,
            deliveryPeriod: 5,
            warrantyTypeId: 1233,
            warrantyPeriod: 8,
            fgProductId: 22,
        });
        expect(response.message, 'Create BOQ API Message Mismatch').toBe('Data created successfully');
        estimationVerOptExtId = response.result;
        console.log('Created estimationVerOptExtId:', estimationVerOptExtId);
    });

    test('Verify Get All BOQ API', async ({ estimationAPI }) => {
        const response = await estimationAPI.getAllBoq(accessToken, estimationVerOptExtId);
        expect(response.message, 'Get All BOQ API Message Mismatch').toBe('Data fetched successfully');
        estimationDetailExtId = response.result[0].boqDetailExtId;
        expect(estimationDetailExtId, 'BOQ detail extId was not resolved').toBeTruthy();
        console.log('Resolved estimationDetailExtId:', estimationDetailExtId);
    });

    test('Verify Update Consumable Percentage (Sign) API', async ({ estimationAPI }) => {
        const response = await estimationAPI.updateConsumableByEstimationDetailId(accessToken, estimationDetailExtId, false, 3);
        expect(response.message, 'Update Consumable Percentage (Sign) API Message Mismatch').toBe('Data updated successfully');
    });

    test('Verify Create Estimation BOM (Sign) API', async ({ estimationAPI }) => {
        const response = await estimationAPI.createEstimationBom(accessToken, estimationDetailExtId, false, [{
            consumablePercentage: 3,
            materialId: 243,
            quantity: 3,
            price: 12.5,
            isAncillary: false,
            ancillaryName: '',
            ancillaryCode: '',
            ancillaryUomId: 328,
            ancillarySize: '',
            ancillaryDescription: 'ALUMINIUM SHEET 3MX1.53MX2.5MM- FASCIA',
            isExistingAncillary: false,
            warrantyTypeId: 1,
            warrantyPercentage: 1,
            warrantyValue: 0,
        }]);
        expect(response.message, 'Create Estimation BOM (Sign) API Message Mismatch').toBe('Data created successfully');
    });

    const departmentBolData: Record<number, { description: string; machineUtilizationHours: number; hourlyRate: number; estHours: number; otHoursPercentage: number; warrantyPercentage: number }> = {
        46: { description: 'BOL Depertment', machineUtilizationHours: 6, hourlyRate: 12, estHours: 5, otHoursPercentage: 7, warrantyPercentage: 3 },
        49: { description: 'test', machineUtilizationHours: 3, hourlyRate: 100, estHours: 4, otHoursPercentage: 2, warrantyPercentage: 1 },
        51: { description: 'Dept Bill of labour', machineUtilizationHours: 6, hourlyRate: 3450, estHours: 5, otHoursPercentage: 7, warrantyPercentage: 3 },
        56: { description: 'Testing', machineUtilizationHours: 3, hourlyRate: 100, estHours: 4, otHoursPercentage: 2, warrantyPercentage: 1 },
    };

    test('Verify Update Estimation BOL (Sign, all departments) API', async ({ estimationAPI }) => {
        const bolResponse = await estimationAPI.getAllBolById(accessToken, estimationDetailExtId, false);
        expect(bolResponse.message, 'Get All BOL By Id API Message Mismatch').toBe('Data fetched successfully');
        const bolList = bolResponse.result.bol;
        expect(bolList.length, 'No BOL department rows returned for the created BOQ detail').toBeGreaterThan(0);

        for (const bol of bolList) {
            const data = departmentBolData[bol.departmentId];
            if (!data) continue;
            const response = await estimationAPI.updateEstimationBolById(accessToken, {
                departmentId: bol.departmentId,
                description: data.description,
                machineUtilizationHours: data.machineUtilizationHours,
                hourlyRate: data.hourlyRate,
                estHours: data.estHours,
                otHoursPercentage: data.otHoursPercentage,
                warrantyTypeId: 1,
                warrantyPercentage: data.warrantyPercentage,
                warrantyValue: null,
                bolExtId: bol.bolExtId,
                isVariation: false,
            });
            expect(response.message, `Update Estimation BOL API Message Mismatch for department ${bol.departmentId}`).toBe('Data updated successfully');
        }
    });

    test('Verify Create Summary (Sign) API', async ({ estimationAPI }) => {
        const response = await estimationAPI.createSummary(accessToken, estimationDetailExtId, false, 1);
        expect(response.message, 'Create Summary (Sign) API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Create Packing API', async ({ estimationAPI }) => {
        const response = await estimationAPI.createPacking(accessToken, estimationVerOptExtId, 3, 3, 3, 3, 0.05);
        expect(response.message, 'Create Packing API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Update Consumable Percentage (Package) API', async ({ estimationAPI }) => {
        const response = await estimationAPI.updateConsumableByEstimationDetailId(accessToken, estimationVerOptExtId, true, 2);
        expect(response.message, 'Update Consumable Percentage (Package) API Message Mismatch').toBe('Data updated successfully');
    });

    test('Verify Create Estimation BOM (Package) API', async ({ estimationAPI }) => {
        const response = await estimationAPI.createEstimationBom(accessToken, estimationVerOptExtId, true, [{
            consumablePercentage: 2,
            materialId: 243,
            quantity: 3,
            price: 12.5,
            isAncillary: false,
            ancillaryName: '',
            ancillaryCode: '',
            ancillaryUomId: 328,
            ancillarySize: '',
            ancillaryDescription: 'ALUMINIUM SHEET 3MX1.53MX2.5MM- FASCIA',
            isExistingAncillary: false,
        }]);
        expect(response.message, 'Create Estimation BOM (Package) API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Create Estimation BOL (Package) API', async ({ estimationAPI }) => {
        const response = await estimationAPI.createEstimationBol(accessToken, estimationVerOptExtId, true, [{
            departmentId: 57,
            description: 'Packing details for bol',
            machineUtilizationHours: 2,
            hourlyRate: 4580,
            estHours: 2,
            otHoursPercentage: 2,
            isPackage: true,
        }]);
        expect(response.message, 'Create Estimation BOL (Package) API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Create Summary (Package) API', async ({ estimationAPI }) => {
        const response = await estimationAPI.createSummary(accessToken, estimationVerOptExtId, true, 2);
        expect(response.message, 'Create Summary (Package) API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Update Other Costing Status API', async ({ estimationAPI }) => {
        const response = await estimationAPI.updateOtherCostingStatus(accessToken, estimationVerOptExtId, 1, true);
        expect(response.statusCode, 'Update Other Costing Status API status code mismatch').toBe(200);
    });

    test('Verify Recalculate Cost Distribution API', async ({ estimationAPI }) => {
        const response = await estimationAPI.reCalculatingCostDistribution(accessToken, estimationVerOptExtId);
        expect(response.result, 'Recalculate Cost Distribution API did not report success').toBe(true);
    });

    test('Verify Create Other Costing API', async ({ estimationAPI }) => {
        const response = await estimationAPI.createOtherCosting(accessToken, estimationVerOptExtId, 25, 3);
        expect(response.message, 'Create Other Costing API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Create Cost Distribution API', async ({ estimationAPI }) => {
        const response = await estimationAPI.createCostDistribution(accessToken, estimationDetailExtId);
        expect(response.message, 'Create Cost Distribution API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Calculate Summary With Incentive API', async ({ estimationAPI }) => {
        const response = await estimationAPI.calculateSummaryWithIncentive(accessToken, estimationVerOptExtId, estimationDetailExtId);
        expect(response.statusCode, 'Calculate Summary With Incentive API status code mismatch').toBe(200);
    });

    test('Verify Generate Quotation API', async ({ quotationAPI }) => {
        const response = await quotationAPI.generateQuotation(accessToken, ppjoId, salesEnquiryNumericId, customerName, 61, estimationVerOptExtId);
        expect(response.message, 'Generate Quotation API Message Mismatch').toBe('Data created successfully');
        quotationExtId = response.result;
        console.log('Created quotationExtId:', quotationExtId);
    });

    test('Verify Submit Quotation For Approval API', async ({ quotationAPI }) => {
        const response = await quotationAPI.submitForApproval(accessToken, quotationExtId);
        expect(response.status(), 'Submit Quotation For Approval API status code mismatch').toBe(200);
    });

    test('Verify Quotation Manager Approve API', async ({ quotationAPI }) => {
        const response = await quotationAPI.quotationManagerApprove(accessToken, quotationExtId, true, '');
        expect(response.message, 'Quotation Manager Approve API Message Mismatch').toBe('Data updated successfully');
    });

    test('Verify Send To Customer API', async ({ quotationAPI }) => {
        const response = await quotationAPI.sendToCustomer(accessToken, quotationExtId);
        expect(response.message, 'Send To Customer API Message Mismatch').toBe('Data updated successfully');
    });

    test('Verify Quotation Approval (Customer Approved) API', async ({ quotationAPI }) => {
        const response = await quotationAPI.quotationApproval(accessToken, quotationExtId, '123', 144);
        expect(response.message, 'Quotation Approval API Message Mismatch').toBe('Data created successfully');
    });

    test('Verify Send Advance Invoice API', async ({ quotationAPI }) => {
        const response = await quotationAPI.sendAdvanceInvoice(accessToken, quotationExtId, '123');
        expect(response.status(), 'Send Advance Invoice API status code mismatch').toBe(201);
    });

    test('Verify Create Invoice Request API', async ({ invoiceRequestAPI }) => {
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

    test('Verify Invoice Manager Approval API', async ({ invoiceRequestAPI }) => {
        const response = await invoiceRequestAPI.updateManagerApproval(accessToken, invoiceExtId, true);
        expect(response.message, 'Invoice Manager Approval API Message Mismatch').toBe('Data updated successfully');
    });

    test('Verify Acknowledge Invoice File Upload API', async ({ invoiceRequestAPI }) => {
        const response = await invoiceRequestAPI.acknowledgeFileUpload(accessToken, invoiceExtId);
        expect(response.message, 'Acknowledge Invoice File Upload API Message Mismatch').toBe('Data updated successfully');
    });

    test('Verify Create Sales Order API', async ({ salesOrderAPI }) => {
        const prepopulateResponse = await salesOrderAPI.getPrepopulateValues(accessToken, quotationExtId);
        const customerId = prepopulateResponse.result.customerId;

        const dateIso = new Date();
        dateIso.setDate(dateIso.getDate() - 1);
        dateIso.setUTCHours(18, 30, 0, 0);

        const response = await salesOrderAPI.createSalesOrder(accessToken, quotationExtId, customerId, customerName, mobileNumber, 'Guangdong', dateIso.toISOString());
        expect(response.message, 'Create Sales Order API Message Mismatch').toBe('Data created successfully');
        salesOrderExtId = response.result;
        console.log('Created salesOrderExtId:', salesOrderExtId);
    });

    test('Verify Update Sales Checklist Status API', async ({ salesOrderAPI }) => {
        const response = await salesOrderAPI.updateSalesChecklistStatus(accessToken, salesOrderExtId, true, 'Approved');
        expect(response.message, 'Update Sales Checklist Status API Message Mismatch').toBe('Data updated successfully');
    });

    test('Verify Sales Order Pending Approval API', async ({ salesOrderAPI }) => {
        const response = await salesOrderAPI.salesOrderPendingApproval(accessToken, salesOrderExtId);
        expect(response.message, 'Sales Order Pending Approval API Message Mismatch').toBe('Data updated successfully');
    });

    test('Verify Update Sales Order Status API', async ({ salesOrderAPI }) => {
        const response = await salesOrderAPI.updateSalesOrderStatus(accessToken, salesOrderExtId, true, 'Approved');
        expect(response.message, 'Update Sales Order Status API Message Mismatch').toBe('Data updated successfully');
    });
});
