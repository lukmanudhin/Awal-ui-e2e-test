import { APIRequestContext, expect } from "@playwright/test";
import { ENV } from "../utils/ENV";

export class CreateMaterialAPI {
    constructor(private request: APIRequestContext) {
    }

    async createMaterial(accessToken: string, data: any) {
        const response = await this.request.post(`https://core-api-dev.colanapps.in/api/v1/material/createMaterial`, {
            data,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        expect(response.status(), `Failed to create material through API, status code: ${response.status()}`).toBe(201);
        const responseBody = await response.json();
        console.log(responseBody);
    }
}
