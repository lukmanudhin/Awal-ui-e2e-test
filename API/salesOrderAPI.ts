import { APIRequestContext, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { ENV } from "../utils/ENV";

const SALES_API_BASE = `https://sales-api-${ENV.ENV_API}.colanapps.in/api/transaction/v1`;

// Lookup ids of the sales order checklist options selected in the Generate Check List form
export type SalesOrderChecklistOptions = {
    attachments: string;      // Sales checklist attachment type
    prRequired: string[];     // PR Required checkboxes
    modeOfDelivery: string;   // Delivery & Installation radio
    installationId: string;   // Installation type
};

export const DEFAULT_CHECKLIST_OPTIONS: SalesOrderChecklistOptions = {
    attachments: '554',                 // Approved Artwork
    prRequired: ['545', '546'],        // Material + Services / Sub-Contract Charges
    modeOfDelivery: '557',             // Delivery & Installation
    installationId: '1202',            // MOW Installation
};

export class SalesOrderAPI {
    constructor(private request: APIRequestContext) {
    }

    private headers(accessToken: string) {
        return {
            'Authorization': `Bearer ${accessToken}`,
            'x-auth-token': accessToken,
        };
    }

    async getPrepopulateValues(accessToken: string, quotationExtId: string) {
        const response = await this.request.get(
            `${SALES_API_BASE}/SalesOrder/getPrepopulateValues`,
            {
                headers: this.headers(accessToken),
                params: { quotationExtId }
            }
        );
        expect(response.status(), `Failed to get sales order prepopulate values through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    // Lists the "New Request" tab of the Sales Order list; each row carries salesOrderExtId and the human readable salesOrderNumber
    async getAllSalesOrder(accessToken: string, search: string) {
        const response = await this.request.get(
            `${SALES_API_BASE}/SalesOrder/getAllSalesOrder`,
            {
                headers: this.headers(accessToken),
                params: { TabType: 'New Request', PageNumber: 1, PageSize: 10, Search: search, Filter: '' }
            }
        );
        expect(response.status(), `Failed to get sales order list through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async createSalesOrder(accessToken: string, quotationExtId: string, customerId: number, customerName: string, deliveryPhone: string, deliveryLocation: string, dateIso: string, checklist: SalesOrderChecklistOptions = DEFAULT_CHECKLIST_OPTIONS) {
        const filePath = path.join(process.cwd(), 'test_Documents', 'Test_Document.pdf');
        const browserDate = new Date(dateIso).toUTCString();
        const response = await this.request.post(
            `${SALES_API_BASE}/SalesOrder/createSalesOrder`,
            {
                headers: this.headers(accessToken),
                multipart: {
                    quotationExtId,
                    customerId: `${customerId}`,
                    accountExecuteId: '0',
                    salesOrderAmount: '449.856',
                    salesOrderSourceTypeId: '675',
                    quotationConfirmation: '538',
                    purchaseOrder: '543',
                    attachments: checklist.attachments,
                    ...Object.fromEntries(checklist.prRequired.map((id, index) => [`prRequired[${index}]`, id])),
                    isFullySubContracter: 'false',
                    finalQaQcPassed: '549',
                    inspectionReport: '0',
                    modeOfDelivery: checklist.modeOfDelivery,
                    installationId: checklist.installationId,
                    isAdvancePaymentApplied: 'true',
                    isRetentionApplied: 'true',
                    isAcceptPartialInvoice: 'true',
                    isStockReserved: 'true',
                    dnDeliveryNote: 'true',
                    overtimeConsidered: 'true',
                    deliveryNoteWithGoods: 'true',
                    salesChecklistRemarks: 'Sales Checklist Remarks',
                    deliveryCustomerName: customerName,
                    deliveryPhone,
                    deliveryLocation,
                    deliveryRemarks: 'Delivery Remarks',
                    inductionDate: browserDate,
                    deliveryDate: browserDate,
                    productionRemarks: 'Production Remarks',
                    PurchaseOrderDocuments: {
                        name: 'Test_Document.pdf',
                        mimeType: 'application/pdf',
                        buffer: fs.readFileSync(filePath),
                    },
                    ManufacturingDrawing: {
                        name: 'Test_Document.pdf',
                        mimeType: 'application/pdf',
                        buffer: fs.readFileSync(filePath),
                    },
                }
            }
        );
        expect(response.status(), `Failed to create sales order through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async updateSalesChecklistStatus(accessToken: string, salesOrderExtId: string, isSalesCheckListApproved: boolean, comments: string) {
        const response = await this.request.put(
            `${SALES_API_BASE}/SalesOrder/updateSalesChecklistStatus`,
            {
                headers: this.headers(accessToken),
                data: { salesOrderExtId, isSalesCheckListApproved, comments }
            }
        );
        expect(response.status(), `Failed to update sales checklist status through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async salesOrderPendingApproval(accessToken: string, salesOrderExtId: string) {
        const response = await this.request.put(
            `${SALES_API_BASE}/SalesOrder/salesOrderPendingApproval`,
            {
                headers: this.headers(accessToken),
                data: { salesOrderExtId }
            }
        );
        expect(response.status(), `Failed to submit sales order for pending approval through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async updateSalesOrderStatus(accessToken: string, salesOrderExtId: string, isSalesOrderApproved: boolean, comments: string) {
        const response = await this.request.put(
            `${SALES_API_BASE}/SalesOrder/updateSalesOrderStatus`,
            {
                headers: this.headers(accessToken),
                data: { salesOrderExtId, isSalesOrderApproved, comments }
            }
        );
        expect(response.status(), `Failed to update sales order status through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async dispose() {
        await this.request.dispose();
    }
}
