import { APIRequestContext, expect } from "@playwright/test";
import { ENV } from "../utils/ENV";

const PROCUREMENT_API_BASE = `https://procurement-api-${ENV.ENV_API}.colanapps.in/api/v1`;

export class StockViewAPI {
    constructor(private request: APIRequestContext) {
    }

    async getMaterialWithHighStock(accessToken: string) {
        const response = await this.request.get(`${PROCUREMENT_API_BASE}/stockView/getAllStockView?PageNumber=1&PageSize=10`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        expect(response.status(), `Failed to view stock view through API, status code: ${response.status()}`).toBe(200);
        const responseBody = await response.json();
        console.log(responseBody);

        // 3. Drill down into the specific response structure (result.data)
        const stockItems = responseBody.result?.data;

        if (!Array.isArray(stockItems) || stockItems.length === 0) {
            throw new Error('Could not parse the items array from responseBody.result.data');
        }

        // 4. Reduce array using your exact keys: 'currentQuantity' and 'materialName'
        const highestStockItem = stockItems.reduce((max, item) =>
            Number(item.currentQuantity) > Number(max.currentQuantity) ? item : max
            , stockItems[0]);

        // 5. Output the calculated winner
        console.log('====================================');
        console.log(`Highest Stock Material: ${highestStockItem.materialName}`);
        console.log(`Quantity Available: ${highestStockItem.currentQuantity}`);
        console.log('====================================');

        // Basic check to ensure valid parsing
        expect(highestStockItem.materialName).toBeDefined();
        expect(Number(highestStockItem.currentQuantity)).toBeGreaterThan(0);
        return highestStockItem.materialName;
    }

    async getOutOfStockMaterialName(accessToken: string, subStore: string) {
        const response = await this.request.get(`${PROCUREMENT_API_BASE}/stockView/getAllStockView?PageNumber=1&PageSize=10&subStore=${subStore}&materialStatus=OutOfStock`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        expect(response.status(), `Failed to get Out of Stock material through API, status code: ${response.status()}`).toBe(200);
        const responseBody = await response.json();

        // if (responseBody?.result?.data && Array.isArray(responseBody.result.data) && responseBody.result.data.length > 0) {
        //     return responseBody.result.data[0].materialName;
        // } else {
        //     throw new Error('Target material data array is missing or empty in response payload.');
        // }

        const materials = responseBody?.result?.data;

        if (Array.isArray(materials) && materials.length > 0) {
            // Uses reduce to compare string lengths and keep the longest one
            const longestMaterialName = materials.reduce((longest, current) => {
                const currentName = current.materialName || '';
                return currentName.length > longest.length ? currentName : longest;
            }, '');

            return longestMaterialName;
        } else {
            throw new Error('Target material data array is missing or empty.');
        }
    }

    async getOutOfStockMaterialList(accessToken: string, subStore: string) {
        const response = await this.request.get(`${PROCUREMENT_API_BASE}/stockView/getAllStockView?PageNumber=1&PageSize=10&subStore=${subStore}&materialStatus=OutOfStock`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        expect(response.status(), `Failed to get Out of Stock material through API, status code: ${response.status()}`).toBe(200);
        const responseBody = await response.json();

        const materials = responseBody?.result?.data;

        if (Array.isArray(materials) && materials.length > 0) {
            // Sort materials by materialName length in descending order (largest first)
            const sortedMaterials = [...materials].sort((a, b) => {
                const nameA = a.materialName || '';
                const nameB = b.materialName || '';
                return nameB.length - nameA.length;
            });

            // Return array of material names, sorted by length
            return sortedMaterials.map(material => material.materialName || '');
        } else {
            throw new Error('Target material data array is missing or empty.');
        }
    }

    async getOutOfStockMaterialExtId(accessToken: string, subStore: string) {
        const response = await this.request.get(`${PROCUREMENT_API_BASE}/stockView/getAllStockView?subStore=${subStore}&materialStatus=OutOfStock`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        expect(response.status(), `Failed to get Out of Stock material through API, status code: ${response.status()}`).toBe(200);
        const responseBody = await response.json();

        const materials = responseBody?.result?.data;

        if (Array.isArray(materials) && materials.length > 0) {
            // Sort materials by materialName length in descending order (largest first)
            const sortedMaterials = [...materials].sort((a, b) => {
                const nameA = a.materialName || '';
                const nameB = b.materialName || '';
                return nameB.length - nameA.length;
            });

            // Map materialName -> extId, preserving sorted order
            const nameToExtIdMap: Record<string, string> = {};
            for (const material of sortedMaterials) {
                nameToExtIdMap[material.materialName || ''] = material.extId;
            }
            console.log(nameToExtIdMap);

            return nameToExtIdMap;
        } else {
            throw new Error('Target material data array is missing or empty.');
        }
    }

    // async getContractPeriod(accessToken: string, extId: string) {
    //     const response = await this.request.get(`${PROCUREMENT_API_BASE}/contractQuotePrices/getContractQuoteById?extId=fea26043-2f3c-4212-8497-72e69fe02be6`, {
    //         headers: {
    //             'Authorization': `Bearer ${accessToken}`
    //         }
    //     });
    //     expect(response.status(), `Failed to get contract period through API, status code: ${response.status()}`).toBe(200);
    //     const responseBody = await response.json();
    //     console.log(responseBody.result.data[0].contractPeriod);
    //     return responseBody.result.data[0].contractPeriod;
    // }


    async getMaterialWithValidContract(accessToken: string, extId: string): Promise<string | null> {
        // const context = await request.newContext();
        const currentDate = new Date();

        const response = await this.request.get(`${PROCUREMENT_API_BASE}/contractQuotePrices/getContractQuoteById`, {
            params: { extId: extId },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-auth-token': accessToken,
                'Accept': 'application/json'
            }
        });

        // If material has no contract data, API returns 404 — treat as "no valid contract", not a failure
        if (response.status() === 404) {
            return null;
        }

        expect(response.status(), `Unexpected status while fetching contract for extId ${extId}: ${response.status()}`).toBe(200);

        const data = await response.json();

        if (data.success && data.result) {
            const { materialDetails, vendorDetails } = data.result;

            const hasValidContract = vendorDetails.some((vendor: any) => {
                const endDate = new Date(vendor.contractEndDate);
                return endDate > currentDate;
            });

            if (hasValidContract) {
                return materialDetails.materialName;
            }
        }

        return null;
    }


    async getOutOfStockMaterialWithValidContract(accessToken: string, subStore: string): Promise<{ materialName: string; extId: string } | null> {
        const response = await this.request.get(`${PROCUREMENT_API_BASE}/stockView/getAllStockView?PageNumber=1&PageSize=10&subStore=${subStore}&materialStatus=OutOfStock`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        expect(response.status(), `Failed to get Out of Stock material through API, status code: ${response.status()}`).toBe(200);
        const responseBody = await response.json();

        const materials = responseBody?.result?.data;

        if (!Array.isArray(materials) || materials.length === 0) {
            throw new Error('Target material data array is missing or empty.');
        }

        // Sort materials by materialName length in descending order (largest first)
        const sortedMaterials = [...materials].sort((a, b) => {
            const nameA = a.materialName || '';
            const nameB = b.materialName || '';
            return nameB.length - nameA.length;
        });

        // Iterate through sorted materials, checking each for a valid contract
        for (const material of sortedMaterials) {
            const validMaterialName = await this.getMaterialWithValidContract(accessToken, material.extId);

            if (validMaterialName) {
                return {
                    materialName: validMaterialName,
                    extId: material.extId
                };
            }
        }

        // No material in the out-of-stock list has a valid contract
        return null;
    }

    async getOutOfStockMaterialWithValidContract2(accessToken: string, subStore: string): Promise<{ materialName: string; extId: string } | null> {
        const response = await this.request.get(`${PROCUREMENT_API_BASE}/stockView/getAllStockView?PageNumber=1&PageSize=10&subStore=${subStore}&materialStatus=OutOfStock`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        expect(response.status(), `Failed to get Out of Stock material through API, status code: ${response.status()}`).toBe(200);
        const responseBody = await response.json();

        const materials = responseBody?.result?.data;

        if (!Array.isArray(materials) || materials.length === 0) {
            throw new Error('Target material data array is missing or empty.');
        }

        // Sort materials by materialName length in descending order (largest first)
        const sortedMaterials = [...materials].sort((a, b) => {
            const nameA = a.materialName || '';
            const nameB = b.materialName || '';
            return nameB.length - nameA.length;
        });

        // Iterate through sorted materials, checking each extId for a valid contract
        for (const material of sortedMaterials) {
            const contractResponse = await this.request.get(`${PROCUREMENT_API_BASE}/contractQuotePrices/getContractQuoteById`, {
                params: { extId: material.extId },
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                    'Accept': 'application/json'
                }
            });

            // If this material has no contract record at all, skip to the next extId
            if (contractResponse.status() === 404) {
                console.log(`No contract found for extId ${material.extId}, checking next material...`);
                continue;
            }

            expect(contractResponse.status(), `Unexpected status while fetching contract for extId ${material.extId}: ${contractResponse.status()}`).toBe(200);

            const contractData = await contractResponse.json();

            if (contractData.success && contractData.result) {
                const { materialDetails, vendorDetails } = contractData.result;
                const currentDate = new Date();

                const hasValidContract = vendorDetails.some((vendor: any) => {
                    const endDate = new Date(vendor.contractEndDate);
                    return endDate > currentDate;
                });

                if (hasValidContract) {
                    // Found a material with a valid contract — stop and return it
                    return {
                        materialName: materialDetails.materialName,
                        extId: material.extId
                    };
                }
            }

            // Contract exists but none of the vendors have a valid (non-expired) end date — skip to next
            console.log(`No valid contract for extId ${material.extId}, checking next material...`);
        }

        // Exhausted all materials — none had a valid contract
        console.log('No out-of-stock material with a valid contract was found.');
        return null;
    }
}
