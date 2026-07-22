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

    async dispose() {
        await this.request.dispose();
    }
}
