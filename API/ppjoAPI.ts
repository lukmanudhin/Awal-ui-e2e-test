import { APIRequestContext, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { ENV } from "../utils/ENV";

const SALES_API_BASE = `https://sales-api-${ENV.ENV_API}.colanapps.in/api/transaction/v1`;

export class PPJOAPI {
    constructor(private request: APIRequestContext) {
    }

    private async createFileBasedPpjo(accessToken: string, enquiryId: string, jobRequestTypeId: number, quantity: string, requirementDetails: string) {
        const filePath = path.join(process.cwd(), 'test_Documents', 'Test_Document.pdf');
        const response = await this.request.post(
            `${SALES_API_BASE}/ppjo/createPpjo`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                },
                multipart: {
                    referenceType: 'SalesEnquiry',
                    ReferenceId: enquiryId,
                    jobRequestTypeId: `${jobRequestTypeId}`,
                    quantity,
                    requirementDetails,
                    files: {
                        name: 'Test_Document.pdf',
                        mimeType: 'application/pdf',
                        buffer: fs.readFileSync(filePath),
                    },
                }
            }
        );
        expect(response.status(), `Failed to create PPJO request (type ${jobRequestTypeId}) through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async requestArtwork(accessToken: string, enquiryId: string, quantity: string, requirementDetails: string) {
        return this.createFileBasedPpjo(accessToken, enquiryId, 1, quantity, requirementDetails);
    }

    async requestAutoCAD(accessToken: string, enquiryId: string, quantity: string, requirementDetails: string) {
        return this.createFileBasedPpjo(accessToken, enquiryId, 2, quantity, requirementDetails);
    }

    async requestSiteVisit(accessToken: string, enquiryId: string, siteVisitorId: string, siteVisitRequestDate: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/ppjo/createPpjo`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                },
                multipart: {
                    referenceType: 'SalesEnquiry',
                    ReferenceId: enquiryId,
                    jobRequestTypeId: '3',
                    SiteVisiterId: siteVisitorId,
                    SiteVisitRequestDate: siteVisitRequestDate,
                }
            }
        );
        expect(response.status(), `Failed to create PPJO site visit request through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async requestProcurement(accessToken: string, enquiryId: string, quantity: string, requirementDetails: string) {
        return this.createFileBasedPpjo(accessToken, enquiryId, 6, quantity, requirementDetails);
    }

    async requestEstimation(accessToken: string, enquiryId: string, quantity: string, requirementDetails: string) {
        return this.createFileBasedPpjo(accessToken, enquiryId, 5, quantity, requirementDetails);
    }

    async getPpjoByReferenceId(accessToken: string, enquiryId: string) {
        const response = await this.request.get(
            `${SALES_API_BASE}/ppjo/getPpjoByReferenceId`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                },
                params: {
                    referenceId: enquiryId,
                    referenceType: 'SalesEnquiry',
                }
            }
        );
        expect(response.status(), `Failed to get PPJO by reference id through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async dispose() {
        await this.request.dispose();
    }
}
