import { APIRequestContext, expect } from "@playwright/test";
import { ENV } from "../utils/ENV";

const PROCUREMENT_API_BASE = `https://procurement-api-${ENV.ENV_API}.colanapps.in/api/v1`;

export class MaterialIndentRequestAPI {
    constructor(private request: APIRequestContext) {
    }

    async deleteMIR(accessToken: string, mirId: string) {
        const response = await this.request.delete(`${PROCUREMENT_API_BASE}/materialIndentRequest/deleteMIR/${mirId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-auth-token': accessToken,
            }
        });
        expect(response.status(), `Failed to delete material indent request through API, status code: ${response.status()}`).toBe(200);
        const res = await response.json();
        return res;
    }

    async deleteMaterialIndentRequestIfCreated(accessToken: string, mirId: string) {
        if (!mirId) return;
        const deleteAPIResponse = await this.deleteMIR(accessToken, mirId);
        expect(deleteAPIResponse.message, 'Delete Material Indent Request API Message Mismatch').toBe('Data deleted successfully');
        console.log('----------------------Delete Material Indent Request API Response---------------------');
        console.log('API Response:', deleteAPIResponse);
    }

    async deleteMIRIfCreated(accessToken: string, mirExtId: string) {
        if (!mirExtId) return;

        try {
            const response = await this.request.delete(`${PROCUREMENT_API_BASE}/materialIndentRequest/deleteMIR/${mirExtId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                }
            });
            console.log(`Cleanup: deleted material indent request ${mirExtId}, status code ${response.status()}`);
        } catch (error) {
            console.log(`Cleanup: failed to delete material indent request ${mirExtId} -`, error);
        }
    }

    async issueAvailableMaterialForMIR(accessToken: string, mirNumber: string) {
        if (!mirNumber) return;

        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'x-auth-token': accessToken,
        };

        const listResponse = await this.request.get(`${PROCUREMENT_API_BASE}/materialIssueNote/getAllPendingMaterial/?PageNumber=1&PageSize=10&Search=${mirNumber}&Filter=`, { headers });
        expect(listResponse.status(), `Failed to get pending material issue list through API, status code: ${listResponse.status()}`).toBe(200);
        const listBody = await listResponse.json();
        const pendingRecord = (listBody?.result?.data ?? []).find((record: any) => record.mirid === mirNumber);

        if (!pendingRecord) {
            console.log(`No pending material issue record found for ${mirNumber}, nothing to restore`);
            return;
        }

        const detailResponse = await this.request.get(`${PROCUREMENT_API_BASE}/materialIssueNote/getPendingMaterialById?extId=${pendingRecord.extId}`, { headers });
        expect(detailResponse.status(), `Failed to get pending material detail through API, status code: ${detailResponse.status()}`).toBe(200);
        const detail = (await detailResponse.json())?.result;

        // Only issue what is actually on hand, and never more than the MIR still has pending
        const createMaterialSummaryList = (detail?.materialInformationList ?? [])
            .map((material: any) => ({
                materialId: material.materialId,
                uomId: material.uomId,
                quantity: material.requestedQuantity,
                issuingQuantity: Math.min(Number(material.stockInHand), Number(material.pendingQuantity)),
                mirInfoId: material.mirInfoId,
                isExcess: false,
                excessToSubStoreQuantity: null,
            }))
            .filter((material: any) => material.issuingQuantity > 0);

        if (createMaterialSummaryList.length === 0) {
            console.log(`No stock on hand against ${mirNumber}, material is already out of stock`);
            return;
        }

        const issueResponse = await this.request.post(`${PROCUREMENT_API_BASE}/materialIssueNote/createIssueMaterial`, {
            headers,
            data: {
                mirId: detail.id,
                pjoId: detail.pjoId,
                departmentId: detail.departmentId,
                subDepartmentId: detail.subDepartmentId,
                requestedById: detail.requestedById,
                createMaterialSummaryList,
            },
        });
        expect(issueResponse.status(), `Failed to issue material through API, status code: ${issueResponse.status()}`).toBe(201);
        console.log(`Restored out-of-stock state for ${mirNumber} by issuing:`, createMaterialSummaryList);
    }

    async dispose() {
        await this.request.dispose();
    }
}
