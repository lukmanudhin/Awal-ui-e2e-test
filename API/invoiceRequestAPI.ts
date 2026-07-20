import { APIRequestContext, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { ENV } from "../utils/ENV";

const FINANCE_API_BASE = `https://finance-api-${ENV.ENV_API}.colanapps.in/api`;

export class InvoiceRequestAPI {
    constructor(private request: APIRequestContext) {
    }

    private headers(accessToken: string) {
        return {
            'Authorization': `Bearer ${accessToken}`,
            'x-auth-token': accessToken,
        };
    }

    async getAllInvoiceRequest(accessToken: string, search: string) {
        const response = await this.request.get(
            `${FINANCE_API_BASE}/InvoiceRequest/GetAllInvoiceRequest`,
            {
                headers: this.headers(accessToken),
                params: { pageNumber: 1, pageSize: 10, Search: search }
            }
        );
        expect(response.status(), `Failed to get invoice request list through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async createInvoiceRequest(accessToken: string, invoiceRequestExtId: string, invoiceDate: string, netDueDate: string) {
        const response = await this.request.post(
            `${FINANCE_API_BASE}/InvoiceRequest/Create`,
            {
                headers: this.headers(accessToken),
                data: {
                    invoiceRequestExtId,
                    invoiceDate,
                    netDueDate,
                    paymentTerms: '',
                    invoiceStatus: 165,
                    isSameAsDefaultAddress: true,
                }
            }
        );
        expect(response.status(), `Failed to create invoice request through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async updateManagerApproval(accessToken: string, invoiceExtId: string, status: boolean) {
        const response = await this.request.post(
            `${FINANCE_API_BASE}/invoiceRegister/updateManagerApproval`,
            {
                headers: this.headers(accessToken),
                data: { invoiceExtId, status }
            }
        );
        expect(response.status(), `Failed to update invoice manager approval through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async acknowledgeFileUpload(accessToken: string, invoiceExtId: string) {
        const filePath = path.join(process.cwd(), 'test_Documents', 'Test_Document.pdf');
        const response = await this.request.post(
            `${FINANCE_API_BASE}/invoiceRegister/acknowledgeFileUpload`,
            {
                headers: this.headers(accessToken),
                multipart: {
                    InvoiceMainExtId: invoiceExtId,
                    Attachments: {
                        name: 'Test_Document.pdf',
                        mimeType: 'application/pdf',
                        buffer: fs.readFileSync(filePath),
                    },
                }
            }
        );
        expect(response.status(), `Failed to acknowledge invoice file upload through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async dispose() {
        await this.request.dispose();
    }
}
