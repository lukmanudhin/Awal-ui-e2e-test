import { APIRequestContext, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { ENV } from "../utils/ENV";

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
            `${ENV.BASE_URL_API}/SalesOrder/getPrepopulateValues`,
            {
                headers: this.headers(accessToken),
                params: { quotationExtId }
            }
        );
        expect(response.status(), `Failed to get sales order prepopulate values through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    // NOTE: native multipart file-upload endpoint carrying the full sales checklist (sales checklist,
    // delivery & installation, production checklist). Field names/IDs below are a best-effort
    // reconstruction from pages/quotationManagerPage.ts's generateChecklist() flow and from
    // SalesOrder/getSalesOrderById's response shape for a previously-submitted order (which mirrors
    // this codebase's consistent request/response DTO naming), since native file-upload bodies are not
    // recoverable from Playwright trace or CDP network capture. May need adjustment based on the API's
    // actual validation error on first run.
    async createSalesOrder(accessToken: string, quotationExtId: string, customerId: number, customerName: string, deliveryPhone: string, deliveryLocation: string, dateIso: string) {
        const filePath = path.join(process.cwd(), 'test_Documents', 'Test_Document.pdf');
        const response = await this.request.post(
            `${ENV.BASE_URL_API}/SalesOrder/createSalesOrder`,
            {
                headers: this.headers(accessToken),
                multipart: {
                    quotationExtId,
                    customerId: `${customerId}`,
                    customerName,
                    salesOrderSourceTypeId: '675',
                    quotationConfirmation: '538',
                    purchaseOrder: '543',
                    attachments: '553',
                    isAdvancePaymentApplied: 'true',
                    isRetentionApplied: 'true',
                    isAcceptPartialInvoice: 'true',
                    salesChecklistRemarks: 'Sales Checklist Remarks',
                    modeOfDelivery: '556',
                    deliveryCustomerName: customerName,
                    deliveryPhone,
                    deliveryLocation,
                    deliveryNoteWithGoods: 'true',
                    deliveryRemarks: 'Delivery Remarks',
                    inductionDate: dateIso,
                    deliveryDate: dateIso,
                    prRequired: '545',
                    finalQaQcPassed: '549',
                    dnDeliveryNote: 'true',
                    overtimeConsidered: 'true',
                    productionRemarks: 'Production Remarks',
                    purchaseOrderDocuments: {
                        name: 'Test_Document.pdf',
                        mimeType: 'application/pdf',
                        buffer: fs.readFileSync(filePath),
                    },
                    manufacturingDrawing: {
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
            `${ENV.BASE_URL_API}/SalesOrder/updateSalesChecklistStatus`,
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
            `${ENV.BASE_URL_API}/SalesOrder/salesOrderPendingApproval`,
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
            `${ENV.BASE_URL_API}/SalesOrder/updateSalesOrderStatus`,
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
