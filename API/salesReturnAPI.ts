import { APIRequestContext, expect } from "@playwright/test";

export class SalesReturnAPI {
    constructor(private request: APIRequestContext) {
    }

    async deleteSalesReturn(accessToken: string, salesReturnId: string) {
        const response = await this.request.delete(
            `https://sales-api-dev.colanapps.in/api/v1/salesReturn/deleteSalesReturn/${salesReturnId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                }
            }
        );
        expect(response.status(), `Failed to delete sales return through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }
}
