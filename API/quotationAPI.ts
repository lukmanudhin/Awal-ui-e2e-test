import { APIRequestContext, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { ENV } from "../utils/ENV";

const SALES_API_BASE = `https://sales-api-${ENV.ENV_API}.colanapps.in/api/transaction/v1`;

export class QuotationAPI {
    constructor(private request: APIRequestContext) {
    }

    private headers(accessToken: string) {
        return {
            'Authorization': `Bearer ${accessToken}`,
            'x-auth-token': accessToken,
        };
    }

    async generateQuotation(accessToken: string, ppjoId: number, salesEnquiryId: number, customerName: string, currencyId: number, versionOptionExtId: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/Quotation/GenerateQuotation`,
            {
                headers: this.headers(accessToken),
                data: {
                    ppjoId,
                    salesEnquiryId,
                    customerId: null,
                    customerName,
                    currencyId,
                    versionOptionExtId,
                    quotationSourceTypeId: 675,
                }
            }
        );
        expect(response.status(), `Failed to generate quotation through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async submitForApproval(accessToken: string, quotationExtId: string) {
        const response = await this.request.put(
            `${SALES_API_BASE}/Quotation/SubmitForApproval/${quotationExtId}`,
            {
                headers: this.headers(accessToken),
                data: {}
            }
        );
        expect(response.status(), `Failed to submit quotation for approval through API, status code: ${response.status()}`).toBe(200);
        return response;
    }

    async quotationManagerApprove(accessToken: string, quotationExtId: string, isApproved: boolean, comment: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/Quotation/quotationManagerApprove`,
            {
                headers: this.headers(accessToken),
                data: { quotationExtId, isApproved, comment }
            }
        );
        expect(response.status(), `Failed to approve quotation through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async sendToCustomer(accessToken: string, quotationExtId: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/Quotation/sendToCustomer`,
            {
                headers: this.headers(accessToken),
                data: { quotationExtId }
            }
        );
        expect(response.status(), `Failed to send quotation to customer through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async quotationApproval(accessToken: string, quotationExtId: string, documentNumber: string, paymentTermId: number) {
        const filePath = path.join(process.cwd(), 'test_Documents', 'Test_Document.pdf');
        const response = await this.request.post(
            `${SALES_API_BASE}/Quotation/QuotationApproval`,
            {
                headers: this.headers(accessToken),
                multipart: {
                    QuotationExtId: quotationExtId,
                    PaymentTermId: `${paymentTermId}`,
                    DocumentNumber: documentNumber,
                    DocumentId: '570',
                    ApprovalDocuments: {
                        name: 'Test_Document.pdf',
                        mimeType: 'application/pdf',
                        buffer: fs.readFileSync(filePath),
                    },
                }
            }
        );
        expect(response.status(), `Failed to approve quotation (customer approval) through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async sendAdvanceInvoice(accessToken: string, quotationExtId: string, documentNumber: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/Quotation/sendAdvanceInvoice`,
            {
                headers: this.headers(accessToken),
                data: { quotationExtId, documentNumber }
            }
        );
        expect(response.status(), `Failed to send advance invoice through API, status code: ${response.status()}`).toBe(201);
        return response;
    }

    async dispose() {
        await this.request.dispose();
    }
}
