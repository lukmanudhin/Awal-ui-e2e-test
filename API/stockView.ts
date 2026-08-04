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
            throw new Error(`No Material in Stock. API message: ${responseBody.message}`);
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
        expect(highestStockItem.materialName, "Material name is not defined").toBeDefined();
        expect(Number(highestStockItem.currentQuantity), "Highest stock item quantity is not greater than 0").toBeGreaterThan(0);
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

    // Fetches every out-of-stock material (filtered by subStore, e.g. 'RawMaterials') that also
    // has an Active (non-expired) contract in Contract/Quote Management, then returns the one
    // with the longest materialName.
    //
    // Note: contractQuotePrices/getContractQuoteById expects the Contract/Quote Management
    // record's own extId, NOT the material's stockView extId — passing the stockView extId 404s
    // for every material. getAllContractQuote is a list endpoint that already returns
    // materialName + expiryStatus per contract record, so materials are cross-referenced by name
    // instead of probing getContractQuoteById per material.
    async getOutOfStockMaterialWithActiveContract(accessToken: string, subStore: string): Promise<{ materialName: string; extId: string; contractExtId: string; vendorName: string } | null> {
        const stockResponse = await this.request.get(`${PROCUREMENT_API_BASE}/stockView/getAllStockView?PageNumber=1&PageSize=200&subStore=${subStore}&materialStatus=OutOfStock`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        expect(stockResponse.status(), `Failed to get Out of Stock material through API, status code: ${stockResponse.status()}`).toBe(200);
        const stockBody = await stockResponse.json();
        const materials = stockBody?.result?.data;

        if (!Array.isArray(materials) || materials.length === 0) {
            throw new Error('Target material data array is missing or empty.');
        }

        const contractResponse = await this.request.get(`${PROCUREMENT_API_BASE}/contractQuotePrices/getAllContractQuote?PageNumber=1&PageSize=200&Search=&Filter=`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        expect(contractResponse.status(), `Failed to get contract quote list through API, status code: ${contractResponse.status()}`).toBe(200);
        const contractBody = await contractResponse.json();
        const contracts = contractBody?.result?.data;

        if (!Array.isArray(contracts)) {
            throw new Error('Contract quote data array is missing.');
        }

        const activeContractByMaterialName = new Map<string, { extId: string; vendorName: string }>();
        for (const contract of contracts) {
            if (contract.expiryStatus === 'Active') {
                activeContractByMaterialName.set(contract.materialName, { extId: contract.extId, vendorName: contract.vendorName });
            }
        }

        const outOfStockRawMaterialsInContract = materials
            .filter((material: any) => activeContractByMaterialName.has(material.materialName))
            .map((material: any) => {
                const contract = activeContractByMaterialName.get(material.materialName)!;
                return {
                    materialName: material.materialName as string,
                    extId: material.extId as string,
                    contractExtId: contract.extId,
                    vendorName: contract.vendorName
                };
            });

        if (outOfStockRawMaterialsInContract.length === 0) {
            // No out-of-stock material in this subStore currently has an active contract
            return null;
        }

        // Pick the material with the longest name, matching this file's other selection helpers
        const longest = outOfStockRawMaterialsInContract.reduce((longest, current) =>
            current.materialName.length > longest.materialName.length ? current : longest
        );

        return longest;
    }

    // Fetches every out-of-stock material (filtered by subStore, e.g. 'RawMaterials') whose
    // Contract/Quote Management records exist but are all expired, then returns the one with the
    // longest materialName. Mirrors getOutOfStockMaterialWithActiveContract but for the opposite
    // case, and returns the same shape so both can drive the same PR -> PO flow.
    //
    // Note: this deliberately keeps materials that have an expired contract rather than materials
    // with no contract row at all. contractExtId/vendorName can only come from a contract record,
    // so a material that has never been under contract has no vendor to return — the expired
    // contract still names the vendor that supplies it, which is what the PO step needs.
    async getOutOfStockMaterialWithoutContract(accessToken: string, subStore: string): Promise<{ materialName: string; extId: string; contractExtId: string; vendorName: string } | null> {
        const stockResponse = await this.request.get(`${PROCUREMENT_API_BASE}/stockView/getAllStockView?PageNumber=1&PageSize=200&subStore=${subStore}&materialStatus=OutOfStock`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        expect(stockResponse.status(), `Failed to get Out of Stock material through API, status code: ${stockResponse.status()}`).toBe(200);
        const stockBody = await stockResponse.json();
        const materials = stockBody?.result?.data;

        if (!Array.isArray(materials) || materials.length === 0) {
            throw new Error('Target material data array is missing or empty.');
        }

        const contractResponse = await this.request.get(`${PROCUREMENT_API_BASE}/contractQuotePrices/getAllContractQuote?PageNumber=1&PageSize=200&Search=&Filter=`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        expect(contractResponse.status(), `Failed to get contract quote list through API, status code: ${contractResponse.status()}`).toBe(200);
        const contractBody = await contractResponse.json();
        const contracts = contractBody?.result?.data;

        if (!Array.isArray(contracts)) {
            throw new Error('Contract quote data array is missing.');
        }

        // A material counts here only when it has at least one contract record and none of them
        // are Active, so there is always a contract to read the vendor from.
        const contractsByMaterialName = new Map<string, any[]>();
        for (const contract of contracts) {
            const existing = contractsByMaterialName.get(contract.materialName) ?? [];
            existing.push(contract);
            contractsByMaterialName.set(contract.materialName, existing);
        }

        const outOfStockRawMaterialsWithoutContract = materials
            .filter((material: any) => {
                const materialContracts = contractsByMaterialName.get(material.materialName);
                return !!materialContracts && materialContracts.every((contract: any) => contract.expiryStatus !== 'Active');
            })
            .map((material: any) => {
                const expiredContract = contractsByMaterialName.get(material.materialName)![0];
                return {
                    materialName: material.materialName as string,
                    extId: material.extId as string,
                    contractExtId: expiredContract.extId as string,
                    vendorName: expiredContract.vendorName as string
                };
            });

        if (outOfStockRawMaterialsWithoutContract.length === 0) {
            // Every out-of-stock material in this subStore either has an active contract or has
            // never been under contract at all
            return null;
        }

        // Pick the material with the longest name, matching this file's other selection helpers
        const longest = outOfStockRawMaterialsWithoutContract.reduce((longest, current) =>
            current.materialName.length > longest.materialName.length ? current : longest
        );

        return longest;
    }

    // Returns a material's live total quantity and stock status straight from the API, by
    // exact materialName match within a subStore. A material can have more than one stockView
    // row (e.g. one per GRN batch/location), so quantities are summed across all matching rows
    // rather than assuming a single row — this also sidesteps the UI search box's substring
    // matching, which returns multiple rows whenever one material's name is a prefix/substring
    // of another's (e.g. "PAINT" vs "ACRYLIC PAINT").
    async getMaterialQuantityAndStatus(accessToken: string, materialName: string, subStore: string): Promise<{ currentQuantity: number; stockStatus: string }> {
        const response = await this.request.get(`${PROCUREMENT_API_BASE}/stockView/getAllStockView?PageNumber=1&PageSize=1000&subStore=${subStore}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        expect(response.status(), `Failed to get stock view through API, status code: ${response.status()}`).toBe(200);
        const responseBody = await response.json();
        const materials = responseBody?.result?.data ?? [];

        const matchingRows = materials.filter((m: any) => m.materialName === materialName);
        expect(matchingRows.length > 0, `No stock view record found for material: ${materialName}`).toBeTruthy();

        const currentQuantity = matchingRows.reduce((total: number, m: any) => total + Number(m.currentQuantity), 0);
        const stockStatus = currentQuantity > 0 ? 'InStock' : 'OutOfStock';

        return { currentQuantity, stockStatus };
    }
}
