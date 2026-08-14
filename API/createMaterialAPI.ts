import { APIRequestContext, expect } from "@playwright/test";
import { ENV } from "../utils/ENV";

export class CreateMaterialAPI {
    constructor(private request: APIRequestContext) {
    }

    async createMaterial(accessToken: string, data: any) {
        const response = await this.request.post(`https://core-api-${ENV.ENV_API}.colanapps.in/api/v1/material/createMaterial`, {
            data,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        expect(response.status(), `Failed to create material through API, status code: ${response.status()}`).toBe(201);
        const responseBody = await response.json();
        console.log(responseBody);
        return responseBody.result;
    }

    async deleteMaterial(accessToken: string, materialId: string) {
        const response = await this.request.delete(`https://core-api-${ENV.ENV_API}.colanapps.in/api/v1/material/deleteMaterialById/${materialId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        expect(response.status(), `Failed to delete material through API, status code: ${response.status()}`).toBe(200);
        const responseBody = await response.json();
        console.log(responseBody);
    }

    async deleteVendorIfCreated(accessToken: string, extId: string) {
        if (!extId) return;
        const response = await this.request.delete(`https://core-api-${ENV.ENV_API}.colanapps.in/api/v1/vendor/deleteVendorsById/${extId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-auth-token': accessToken,
            }
        });
        expect(response.status(), `Failed to delete vendor through API, status code: ${response.status()}`).toBe(200);
        const deleteAPIResponse = await response.json();
        expect(deleteAPIResponse.message, 'Delete Vendor API Message Mismatch').toBe('Record deleted successfully.');
        console.log('----------------------Delete Vendor API Response---------------------');
        console.log('API Response:', deleteAPIResponse);
    }
}
