import { APIRequestContext, expect } from "@playwright/test";
import { ENV } from "../utils/ENV";

const ESTIMATION_API_BASE = `https://estimation-api-${ENV.ENV_API}.colanapps.in/api/v1`;

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

    // Finds the Estimation - Request (Normal) row of an enquiry; the row carries salesExtId = the sales enquiry extId
    async getRequestNormalExtId(accessToken: string, enquiryExtId: string, enquiryNumber: string) {
        const response = await this.request.get(
            `${ESTIMATION_API_BASE}/estimation/getAllRequestNormal`,
            {
                headers: this.headers(accessToken),
                params: { pageNumber: 1, pageSize: 10, searchTerm: enquiryNumber, requestType: 'NormalRequest' }
            }
        );
        expect(response.status(), `Failed to get request normal list through API, status code: ${response.status()}`).toBe(200);
        const body = await response.json();
        const row = body.result.result.find((item: { salesExtId: string }) => item.salesExtId === enquiryExtId);
        expect(row, `Estimation request for enquiry ${enquiryNumber} was not found in Request (Normal)`).toBeDefined();
        return row.requestNormalExtId as string;
    }

    // Picks a random estimator from the same dropdown the Select Estimator field uses
    async getRandomEstimator(accessToken: string) {
        const response = await this.request.get(
            `${ESTIMATION_API_BASE}/estimation/getAllEstimatorDropdown`,
            { headers: this.headers(accessToken) }
        );
        expect(response.status(), `Failed to get estimator dropdown through API, status code: ${response.status()}`).toBe(200);
        const body = await response.json();
        expect(body.result.length, 'Estimator dropdown is empty').toBeGreaterThan(0);
        const estimator = body.result[Math.floor(Math.random() * body.result.length)];
        console.log(`Estimator (fetched dynamically via API): ${estimator.name}`);
        return estimator as { id: number; name: string };
    }

    // Picks a random employee from the employee search the Select Project Manager field uses
    async getRandomProjectManager(accessToken: string) {
        const response = await this.request.get(
            `https://core-api-${ENV.ENV_API}.colanapps.in/api/v1/employeeMaster/getAllEmployeeSearch`,
            {
                headers: this.headers(accessToken),
                params: { search: '' }
            }
        );
        expect(response.status(), `Failed to get employee list through API, status code: ${response.status()}`).toBe(200);
        const body = await response.json();
        expect(body.result.length, 'Employee list is empty').toBeGreaterThan(0);
        const employee = body.result[Math.floor(Math.random() * body.result.length)];
        console.log(`Project Manager (fetched dynamically via API): ${employee.empName}`);
        return { id: employee.id as number, name: employee.empName as string };
    }

    async assignEstimator(accessToken: string, requestNormalExtId: string, estimatorId: number) {
        const response = await this.request.patch(
            `${ESTIMATION_API_BASE}/estimation/updateRequestNormalById`,
            {
                headers: this.headers(accessToken),
                data: { requestNormalExtId, estimatorId, estimationStatusId: 0 }
            }
        );
        expect(response.status(), `Failed to assign estimator through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async assignProjectManager(accessToken: string, requestNormalExtId: string, projectManagerId: number) {
        const response = await this.request.patch(
            `${ESTIMATION_API_BASE}/estimation/updateRequestNormalById`,
            {
                headers: this.headers(accessToken),
                data: { requestNormalExtId, projectManagerId, estimationStatusId: 213, requestType: 'NormalRequest' }
            }
        );
        expect(response.status(), `Failed to assign project manager through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    // Resolves the numeric finished product id used by the BOQ form dropdown (typeId 1459 = finished product type)
    async getFinishedProductId(accessToken: string, productName: string) {
        const response = await this.request.get(
            `${ESTIMATION_API_BASE}/finishedProductMaster/finishedProductDropdown`,
            {
                headers: this.headers(accessToken),
                params: { typeId: 1459 }
            }
        );
        expect(response.status(), `Failed to get finished product dropdown through API, status code: ${response.status()}`).toBe(200);
        const body = await response.json();
        const product = body.result.find((item: { id: number; name: string }) => item.name === productName);
        expect(product, `Finished product "${productName}" was not found in the BOQ finished product dropdown`).toBeDefined();
        return product.id as number;
    }

    // Resolves the numeric material id used by BOM lines from the material name shown in the BOM material dropdown
    async getMaterialIdByName(accessToken: string, materialName: string) {
        const response = await this.request.get(
            `${ESTIMATION_API_BASE}/bom/getAllMaterialDropdown`,
            { headers: this.headers(accessToken) }
        );
        expect(response.status(), `Failed to get BOM material dropdown through API, status code: ${response.status()}`).toBe(200);
        const body = await response.json();
        const material = body.result.materials.find((item: { id: number; name: string }) => item.name === materialName);
        expect(material, `Material "${materialName}" was not found in the BOM material dropdown`).toBeDefined();
        return material.id as number;
    }

    async getMaterialDetailsById(accessToken: string, materialId: number) {
        const response = await this.request.get(
            `${ESTIMATION_API_BASE}/bom/getMaterialDetailsById/${materialId}`,
            {
                headers: this.headers(accessToken),
                params: { isAncillary: 'false' }
            }
        );
        expect(response.status(), `Failed to get material details through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    async dispose() {
        await this.request.dispose();
    }
}
