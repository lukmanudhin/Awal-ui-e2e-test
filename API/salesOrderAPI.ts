import { APIRequestContext, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { ENV } from "../utils/ENV";

const SALES_API_BASE = `https://sales-api-${ENV.ENV_API}.colanapps.in/api/transaction/v1`;

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

    async createSalesOrder(accessToken: string, quotationExtId: string, customerId: number, customerName: string, deliveryPhone: string, deliveryLocation: string, dateIso: string) {
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
                    attachments: '553',
                    prRequired: '545',
                    isFullySubContracter: 'false',
                    finalQaQcPassed: '549',
                    inspectionReport: '0',
                    modeOfDelivery: '556',
                    installationId: '1200',
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
