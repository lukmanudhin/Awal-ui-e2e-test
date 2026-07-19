import { APIRequestContext, expect } from "@playwright/test";

const ESTIMATION_API_BASE = 'https://estimation-api-dev.colanapps.in/api/v1';

export class EstimationAPI {
    constructor(private request: APIRequestContext) {
    }

    private headers(accessToken: string) {
        return {
            'Authorization': `Bearer ${accessToken}`,
            'x-auth-token': accessToken,
        };
    }

    async createBoq(accessToken: string, ppjoNumber: string, boqData: any) {
        const response = await this.request.post(
            `${ESTIMATION_API_BASE}/boq/createBoq`,
            {
                headers: this.headers(accessToken),
                data: {
                    ppjoNumber,
                    versionName: 'Version 1',
                    optionName: 'Option 1',
                    details: boqData,
                    requestType: 'NormalRequest',
                }
            }
        );
        expect(response.status(), `Failed to create BOQ through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async getAllBoq(accessToken: string, estimationVerOptExtId: string) {
        const response = await this.request.get(
            `${ESTIMATION_API_BASE}/boq/getAllBoq`,
            {
                headers: this.headers(accessToken),
                params: { estimationVerOptExtId }
            }
        );
        expect(response.status(), `Failed to get BOQ list through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async updateConsumableByEstimationDetailId(accessToken: string, extId: string, isPackage: boolean, consumablePercentage: number) {
        const response = await this.request.put(
            `${ESTIMATION_API_BASE}/bom/updateConsumableByEstimationDetailId`,
            {
                headers: this.headers(accessToken),
                data: { extId, isPackage, isVariation: false, consumablePercentage }
            }
        );
        expect(response.status(), `Failed to update consumable percentage through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async createEstimationBom(accessToken: string, extId: string, isPackage: boolean, boms: any[]) {
        const response = await this.request.post(
            `${ESTIMATION_API_BASE}/bom/createEstimationBom`,
            {
                headers: this.headers(accessToken),
                data: { extId, boms, isPackage, isVariation: false }
            }
        );
        expect(response.status(), `Failed to create estimation BOM through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async getAllBolById(accessToken: string, extId: string, isPackage: boolean) {
        const response = await this.request.get(
            `${ESTIMATION_API_BASE}/bol/getAllBolById/${extId}`,
            {
                headers: this.headers(accessToken),
                params: { isPackage: `${isPackage}` }
            }
        );
        expect(response.status(), `Failed to get BOL list through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async updateEstimationBolById(accessToken: string, bolData: any) {
        const response = await this.request.put(
            `${ESTIMATION_API_BASE}/bol/updateEstimationBolById`,
            {
                headers: this.headers(accessToken),
                data: bolData
            }
        );
        expect(response.status(), `Failed to update estimation BOL through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async createEstimationBol(accessToken: string, extId: string, isPackage: boolean, bol: any[]) {
        const response = await this.request.post(
            `${ESTIMATION_API_BASE}/bol/createEstimationBol`,
            {
                headers: this.headers(accessToken),
                data: { extId, isPackage, isVariation: false, bol }
            }
        );
        expect(response.status(), `Failed to create estimation BOL through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async createSummary(accessToken: string, extId: string, isPackage: boolean, variation: number) {
        const response = await this.request.post(
            `${ESTIMATION_API_BASE}/summary/createSummary`,
            {
                headers: this.headers(accessToken),
                data: isPackage ? { extId, isPackage, variation } : { extId, isPackage, isVariation: false, variation }
            }
        );
        expect(response.status(), `Failed to create summary through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async createPacking(accessToken: string, estimationVerOptExtId: string, quantity: number, length: number, width: number, height: number, variation: number) {
        const response = await this.request.post(
            `${ESTIMATION_API_BASE}/packing/createPacking`,
            {
                headers: this.headers(accessToken),
                data: { estimationVerOptExtId, quantity, length, width, height, variation }
            }
        );
        expect(response.status(), `Failed to create packing through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async updateOtherCostingStatus(accessToken: string, estimationVerOptExtId: string, otherCostingsId: number, isCompleted: boolean) {
        const response = await this.request.post(
            `${ESTIMATION_API_BASE}/otherCosting/updateOtherCostingStatus`,
            {
                headers: this.headers(accessToken),
                data: { estimationVerOptExtId, otherCostingsId, isCompleted }
            }
        );
        expect(response.status(), `Failed to update other costing status through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async reCalculatingCostDistribution(accessToken: string, estimationVerOptId: string) {
        const response = await this.request.post(
            `${ESTIMATION_API_BASE}/costDistribution/reCalculatingCostDistribution`,
            {
                headers: this.headers(accessToken),
                params: { estimationVerOptId },
                data: {}
            }
        );
        expect(response.status(), `Failed to recalculate cost distribution through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async createOtherCosting(accessToken: string, estimationVerOptExtId: string, subCategoryId: number, totalCost: number) {
        const response = await this.request.post(
            `${ESTIMATION_API_BASE}/otherCosting/createOtherCosting`,
            {
                headers: this.headers(accessToken),
                data: { estimationVerOptExtId, subCategoryId, totalCost }
            }
        );
        expect(response.status(), `Failed to create other costing through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async createCostDistribution(accessToken: string, estimationDetailExtId: string) {
        const costsBySubCategory: Record<number, number> = {
            4: 2, 5: 3, 6: 4, 7: 5, 8: 1, 9: 2, 10: 4, 11: 5, 12: 7, 13: 8,
            14: 6, 15: 3, 16: 1, 17: 5, 18: 6, 19: 6, 20: 2, 21: 7, 22: 9, 24: 2,
        };
        const costDistribution = Object.entries(costsBySubCategory).map(([subCategoryId, distributedCost]) => ({
            subCategoryId: Number(subCategoryId),
            costDistributionList: [{ estimationDetailExtId, distributedCost, remarks: '' }]
        }));
        const response = await this.request.post(
            `${ESTIMATION_API_BASE}/costDistribution/createCostDistribution`,
            {
                headers: this.headers(accessToken),
                data: { costDistribution }
            }
        );
        expect(response.status(), `Failed to create cost distribution through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async calculateSummaryWithIncentive(accessToken: string, estimationVerOptId: string, estimationDetailExtId: string) {
        const response = await this.request.post(
            `${ESTIMATION_API_BASE}/summaryWithIncentive/CalculateSummaryWithIncentive`,
            {
                headers: this.headers(accessToken),
                data: {
                    estimationVerOptId,
                    financePercentage: 0,
                    discountPercentage: 4,
                    commissionPercentage: 0,
                    withHoldingTaxPercentage: 0,
                    vat: 3,
                    contingenciesPercentage: 0,
                    serviceChargesPercentage: 0,
                    customChargesPercentage: 0,
                    isOverSeas: true,
                    typeId: 3,
                    marginDetails: [{ detailExtId: estimationDetailExtId, marginPercentage: 0, marginPercentageOnDirectOtherCost: 0, variationPercentage: 1 }],
                    discounts: [],
                }
            }
        );
        expect(response.status(), `Failed to calculate summary with incentive through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async dispose() {
        await this.request.dispose();
    }
}
