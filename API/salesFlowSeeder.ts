import { SalesEnquiryAPI } from "./salesEnquiryAPI";
import { PPJOAPI } from "./ppjoAPI";
import { EstimationAPI } from "./estimationAPI";
import { QuotationAPI } from "./quotationAPI";
import { InvoiceRequestAPI } from "./invoiceRequestAPI";
import { SalesOrderAPI } from "./salesOrderAPI";
import { ENV } from "../utils/ENV";
import { salesEnquiryNormalPayload } from "../API-payloads/salesEnquiryNormalPayload";

// Ordered stages of the Sales Enquiry (Request Normal) flow. Seeding runs every step up to and including the requested stage.
export type SalesFlowStage =
    | 'quotationGenerated'
    | 'quotationSubmitted'
    | 'quotationManagerApproved'
    | 'quotationSentToCustomer'
    | 'customerApproved'
    | 'advanceInvoiceSent'
    | 'invoiceCreated'
    | 'invoiceApproved'
    | 'invoiceAcknowledged'
    | 'salesOrderCreated'
    | 'salesChecklistApproved'
    | 'salesOrderPendingApproval';

const STAGES: SalesFlowStage[] = [
    'quotationGenerated', 'quotationSubmitted', 'quotationManagerApproved', 'quotationSentToCustomer', 'customerApproved',
    'advanceInvoiceSent', 'invoiceCreated', 'invoiceApproved', 'invoiceAcknowledged', 'salesOrderCreated',
    'salesChecklistApproved', 'salesOrderPendingApproval',
];

export type SalesFlowApis = {
    salesEnquiryAPI: SalesEnquiryAPI;
    ppjoAPI: PPJOAPI;
    estimationAPI: EstimationAPI;
    quotationAPI: QuotationAPI;
    invoiceRequestAPI: InvoiceRequestAPI;
    salesOrderAPI: SalesOrderAPI;
};

export type SeededSalesFlow = {
    accessToken: string;
    enquiryExtId: string;
    quotationExtId: string;
    invoiceExtId: string;
    salesOrderExtId: string;
};

const departmentBolData: Record<number, { description: string; machineUtilizationHours: number; hourlyRate: number; estHours: number; otHoursPercentage: number; warrantyPercentage: number }> = {
    46: { description: 'BOL Depertment', machineUtilizationHours: 6, hourlyRate: 12, estHours: 5, otHoursPercentage: 7, warrantyPercentage: 3 },
    49: { description: 'test', machineUtilizationHours: 3, hourlyRate: 100, estHours: 4, otHoursPercentage: 2, warrantyPercentage: 1 },
    51: { description: 'Dept Bill of labour', machineUtilizationHours: 6, hourlyRate: 3450, estHours: 5, otHoursPercentage: 7, warrantyPercentage: 3 },
    56: { description: 'Testing', machineUtilizationHours: 3, hourlyRate: 100, estHours: 4, otHoursPercentage: 2, warrantyPercentage: 1 },
};

// Mirrors tests/API/salesEnquiryNormalAPITest.spec.ts so UI specs for the later stages do not need to replay the whole UI flow.
export class SalesFlowSeeder {
    constructor(private apis: SalesFlowApis) { }

    // Seeds only the sales enquiry (and optionally its PPJO requests) - used by the early-stage specs.
    async seedEnquiry(customerName: string) {
        const { salesEnquiryAPI } = this.apis;
        const accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        const created = await salesEnquiryAPI.createSalesEnquiryAPI(accessToken, { ...salesEnquiryNormalPayload, customerName });
        const enquiryExtId = created.result.extId as string;
        await salesEnquiryAPI.createAcrylicProducts(accessToken, enquiryExtId);
        return { accessToken, enquiryExtId };
    }

    // `onEnquiryCreated` is called as soon as the enquiry exists so the caller can register it for cleanup
    // even if a later seeding step throws.
    async seedUntil(stage: SalesFlowStage, customerName: string, onEnquiryCreated?: (enquiryExtId: string) => void): Promise<SeededSalesFlow> {
        const { ppjoAPI, estimationAPI, quotationAPI, invoiceRequestAPI, salesOrderAPI } = this.apis;
        const { accessToken, enquiryExtId } = await this.seedEnquiry(customerName);
        onEnquiryCreated?.(enquiryExtId);
        const mobile = salesEnquiryNormalPayload.addresses[0].mobile;

        await ppjoAPI.requestArtwork(accessToken, enquiryExtId, '5', 'Artwork requirement details');
        await ppjoAPI.requestEstimation(accessToken, enquiryExtId, '5', 'Estimation requirement details');
        const ppjo = await ppjoAPI.getPpjoByReferenceId(accessToken, enquiryExtId);
        const ppjoId = ppjo.result.ppjoId;
        const ppjoNumber = ppjo.result.ppjoCode;
        const salesEnquiryNumericId = ppjo.result.salesEnquiryId;

        // Estimation
        const boq = await estimationAPI.createBoq(accessToken, ppjoNumber, {
            signCode: '12358', signType: 'Metal', signName: 'Customer', description: 'Add BOQ Test', size: '5', quantity: 2,
            deliveryTypeId: 1232, deliveryPeriod: 5, warrantyTypeId: 1233, warrantyPeriod: 8, fgProductId: 22,
        });
        const estimationVerOptExtId = boq.result as string;
        const allBoq = await estimationAPI.getAllBoq(accessToken, estimationVerOptExtId);
        const estimationDetailExtId = allBoq.result[0].boqDetailExtId as string;
        await estimationAPI.updateConsumableByEstimationDetailId(accessToken, estimationDetailExtId, false, 3);
        await estimationAPI.createEstimationBom(accessToken, estimationDetailExtId, false, [{
            consumablePercentage: 3, materialId: 243, quantity: 3, price: 12.5, isAncillary: false, ancillaryName: '', ancillaryCode: '',
            ancillaryUomId: 328, ancillarySize: '', ancillaryDescription: 'ALUMINIUM SHEET 3MX1.53MX2.5MM- FASCIA',
            isExistingAncillary: false, warrantyTypeId: 1, warrantyPercentage: 1, warrantyValue: 0,
        }]);
        const bolResponse = await estimationAPI.getAllBolById(accessToken, estimationDetailExtId, false);
        for (const bol of bolResponse.result.bol) {
            const data = departmentBolData[bol.departmentId];
            if (!data) continue;
            await estimationAPI.updateEstimationBolById(accessToken, {
                departmentId: bol.departmentId, description: data.description, machineUtilizationHours: data.machineUtilizationHours,
                hourlyRate: data.hourlyRate, estHours: data.estHours, otHoursPercentage: data.otHoursPercentage, warrantyTypeId: 1,
                warrantyPercentage: data.warrantyPercentage, warrantyValue: null, bolExtId: bol.bolExtId, isVariation: false,
            });
        }
        await estimationAPI.createSummary(accessToken, estimationDetailExtId, false, 1);
        await estimationAPI.createPacking(accessToken, estimationVerOptExtId, 3, 3, 3, 3, 0.05);
        await estimationAPI.updateConsumableByEstimationDetailId(accessToken, estimationVerOptExtId, true, 2);
        await estimationAPI.createEstimationBom(accessToken, estimationVerOptExtId, true, [{
            consumablePercentage: 2, materialId: 243, quantity: 3, price: 12.5, isAncillary: false, ancillaryName: '', ancillaryCode: '',
            ancillaryUomId: 328, ancillarySize: '', ancillaryDescription: 'ALUMINIUM SHEET 3MX1.53MX2.5MM- FASCIA', isExistingAncillary: false,
        }]);
        await estimationAPI.createEstimationBol(accessToken, estimationVerOptExtId, true, [{
            departmentId: 57, description: 'Packing details for bol', machineUtilizationHours: 2, hourlyRate: 4580, estHours: 2,
            otHoursPercentage: 2, isPackage: true,
        }]);
        await estimationAPI.createSummary(accessToken, estimationVerOptExtId, true, 2);
        await estimationAPI.updateOtherCostingStatus(accessToken, estimationVerOptExtId, 1, true);
        await estimationAPI.reCalculatingCostDistribution(accessToken, estimationVerOptExtId);
        await estimationAPI.createOtherCosting(accessToken, estimationVerOptExtId, 25, 3);
        await estimationAPI.createCostDistribution(accessToken, estimationDetailExtId);
        await estimationAPI.calculateSummaryWithIncentive(accessToken, estimationVerOptExtId, estimationDetailExtId);

        // Quotation
        const quotation = await quotationAPI.generateQuotation(accessToken, ppjoId, salesEnquiryNumericId, customerName, 61, estimationVerOptExtId);
        const quotationExtId = quotation.result as string;
        const seeded: SeededSalesFlow = { accessToken, enquiryExtId, quotationExtId, invoiceExtId: '', salesOrderExtId: '' };
        if (stage === 'quotationGenerated') return seeded;

        await quotationAPI.submitForApproval(accessToken, quotationExtId);
        if (stage === 'quotationSubmitted') return seeded;

        await quotationAPI.quotationManagerApprove(accessToken, quotationExtId, true, '');
        if (stage === 'quotationManagerApproved') return seeded;

        await quotationAPI.sendToCustomer(accessToken, quotationExtId);
        if (stage === 'quotationSentToCustomer') return seeded;

        await quotationAPI.quotationApproval(accessToken, quotationExtId, '123', 144);
        if (stage === 'customerApproved') return seeded;

        await quotationAPI.sendAdvanceInvoice(accessToken, quotationExtId, '123');
        if (stage === 'advanceInvoiceSent') return seeded;

        // Invoice
        const invoiceList = await invoiceRequestAPI.getAllInvoiceRequest(accessToken, customerName);
        seeded.invoiceExtId = invoiceList.result.data[0].extId;
        const invoiceDate = new Date();
        invoiceDate.setDate(invoiceDate.getDate() + 2);
        await invoiceRequestAPI.createInvoiceRequest(accessToken, seeded.invoiceExtId, invoiceDate.toISOString(), new Date().toISOString());
        if (stage === 'invoiceCreated') return seeded;

        await invoiceRequestAPI.updateManagerApproval(accessToken, seeded.invoiceExtId, true);
        if (stage === 'invoiceApproved') return seeded;

        await invoiceRequestAPI.acknowledgeFileUpload(accessToken, seeded.invoiceExtId);
        if (stage === 'invoiceAcknowledged') return seeded;

        // Sales order
        const prepopulate = await salesOrderAPI.getPrepopulateValues(accessToken, quotationExtId);
        const dateIso = new Date();
        dateIso.setDate(dateIso.getDate() - 1);
        dateIso.setUTCHours(18, 30, 0, 0);
        const salesOrder = await salesOrderAPI.createSalesOrder(accessToken, quotationExtId, prepopulate.result.customerId, customerName, mobile, 'Guangdong', dateIso.toISOString());
        seeded.salesOrderExtId = salesOrder.result;
        if (stage === 'salesOrderCreated') return seeded;

        await salesOrderAPI.updateSalesChecklistStatus(accessToken, seeded.salesOrderExtId, true, 'Approved');
        if (stage === 'salesChecklistApproved') return seeded;

        await salesOrderAPI.salesOrderPendingApproval(accessToken, seeded.salesOrderExtId);
        return seeded;
    }
}
