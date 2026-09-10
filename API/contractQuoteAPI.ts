import { APIRequestContext, expect } from "@playwright/test";
import { ENV } from "../utils/ENV";

const CORE_API_BASE = `https://core-api-${ENV.ENV_API}.colanapps.in/api/v1`;
const PROCUREMENT_API_BASE = `https://procurement-api-${ENV.ENV_API}.colanapps.in/api/v1`;
const USER_MANAGEMENT_API_BASE = `https://user-management-api-${ENV.ENV_API}.colanapps.in/api/v1`;

export type SeedActiveContractOptions = {
    materialName: string;
    requisitionType: string;
    uomId: number;
    vendorName: string;
    pjoNumber: string;
    shipTo: string;
    quantity: string;
    unitPrice: string;
    paymentTerms: string;
    shipmentMode: string;
    employeeName?: string;
    breakdownType?: string;
};

export type SeededContractMaterial = {
    materialName: string;
    materialId: number;
    vendorName: string;
    mirExtId: string;
    prExtId: string;
};

export class ContractQuoteAPI {
    constructor(private request: APIRequestContext) {
    }

    private headers(accessToken: string) {
        return {
            'Authorization': `Bearer ${accessToken}`,
            'x-auth-token': accessToken,
        };
    }

    private daysFromNow(days: number) {
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    private yearsFromNow(years: number) {
        const today = new Date();
        return new Date(today.getFullYear() + years, today.getMonth(), today.getDate());
    }

    private async getJson(accessToken: string, url: string, description: string) {
        const response = await this.request.get(url, { headers: this.headers(accessToken) });
        expect(response.status(), `Failed to ${description} through API, status code: ${response.status()}`).toBe(200);
        return (await response.json())?.result;
    }

    private async postJson(accessToken: string, url: string, data: any, description: string, expectedStatus: number) {
        const response = await this.request.post(url, { headers: this.headers(accessToken), data });
        expect(response.status(), `Failed to ${description} through API, status code: ${response.status()}`).toBe(expectedStatus);
        return (await response.json())?.result;
    }

    private async putJson(accessToken: string, url: string, data: any, description: string, expectedStatus = 200) {
        const response = await this.request.put(url, { headers: this.headers(accessToken), data });
        expect(response.status(), `Failed to ${description} through API, status code: ${response.status()}`).toBe(expectedStatus);
        return (await response.json())?.result;
    }

    private async sendMultipart(accessToken: string, url: string, fields: Record<string, string | number | boolean>, description: string, method: 'post' | 'put', expectedStatus: number) {
        const multipart: Record<string, string> = {};
        for (const [name, value] of Object.entries(fields)) {
            multipart[name] = String(value);
        }
        const response = method === 'post'
            ? await this.request.post(url, { headers: this.headers(accessToken), multipart })
            : await this.request.put(url, { headers: this.headers(accessToken), multipart });
        expect(response.status(), `Failed to ${description} through API, status code: ${response.status()}`).toBe(expectedStatus);
        return (await response.json())?.result;
    }

    private async getRequesterDetails(accessToken: string) {
        const profile = await this.getJson(accessToken, `${USER_MANAGEMENT_API_BASE}/profileSetting/getUserProfileSettings`, 'get the logged in user profile');
        expect(profile?.userId, 'User id is missing in getUserProfileSettings response').toBeTruthy();
        return {
            userId: profile.userId as number,
            departmentId: profile.departmentId as number,
            subDepartmentId: profile.subDepartmentId as number,
            currencyId: profile.companyCurrencyDetails?.currencyId as number,
        };
    }

    private async getRequisitionTypeId(accessToken: string, requisitionType: string) {
        const requisitionTypes = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/materialIndentRequest/getRequistionTypeDropdown`, 'get the requisition type dropdown');
        const match = (requisitionTypes ?? []).find((type: any) => type.name === requisitionType);
        expect(match, `Requisition type "${requisitionType}" was not found in the requisition type dropdown`).toBeTruthy();
        return match.id as number;
    }

    private async getMaterialId(accessToken: string, materialName: string, requisitionTypeId: number) {
        const materials = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/materialIndentRequest/getMaterialById?id=${requisitionTypeId}`, 'get the material indent request material dropdown');
        const match = (materials ?? []).find((material: any) => material.name === materialName);
        expect(match, `Material "${materialName}" was not found in the material indent request dropdown`).toBeTruthy();
        return match.id as number;
    }

    private async getPriorityId(accessToken: string) {
        const priorities = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/materialIndentRequest/getPriorityDropdown`, 'get the priority dropdown');
        expect(priorities?.length, 'Priority dropdown is empty').toBeGreaterThan(0);
        return priorities[0].id as number;
    }

    private async getEmployeeId(accessToken: string, employeeName: string) {
        const employees = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/materialIndentRequest/getEmployeeDropdown`, 'get the employee dropdown');
        const match = (employees ?? []).find((employee: any) => employee.name === employeeName);
        expect(match, `Employee "${employeeName}" was not found in the employee dropdown`).toBeTruthy();
        return match.id as number;
    }

    private async getBreakdownTypeId(accessToken: string, breakdownType: string) {
        const breakdownTypes = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/materialIndentRequest/getBreakdownDropdown`, 'get the breakdown type dropdown');
        const match = (breakdownTypes ?? []).find((type: any) => type.name === breakdownType);
        expect(match, `Breakdown type "${breakdownType}" was not found in the breakdown type dropdown`).toBeTruthy();
        return match.id as number;
    }

    private async getPJOId(accessToken: string, pjoNumber: string) {
        const pjoNumbers = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/materialIndentRequest/getPJONumberDropdown`, 'get the PJO number dropdown');
        const match = (pjoNumbers ?? []).find((pjo: any) => pjo.name === pjoNumber);
        expect(match, `PJO number "${pjoNumber}" was not found in the PJO number dropdown`).toBeTruthy();
        return match.id as number;
    }

    async getUomId(accessToken: string, uomName: string) {
        const uomOptions = await this.getJson(accessToken, `${CORE_API_BASE}/uom/getUomDropdown`, 'get the UOM dropdown');
        const match = (uomOptions ?? []).find((uom: any) => uom.name === uomName);
        expect(match, `UOM "${uomName}" was not found in the UOM dropdown`).toBeTruthy();
        return match.id as number;
    }

    private async getVendorId(accessToken: string, vendorName: string) {
        const vendors = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/vendorQuotation/getVendorDetails`, 'get the vendor quotation vendor list');
        const match = (vendors ?? []).find((vendor: any) => vendor.vendorName === vendorName);
        expect(match, `Vendor "${vendorName}" was not found in the vendor quotation vendor list`).toBeTruthy();
        return match.vendorId as number;
    }

    private async getShipToId(accessToken: string, shipTo: string) {
        const companies = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/vendorQuotation/getShipToDropdown`, 'get the ship to dropdown');
        const match = (companies ?? []).find((company: any) => company.companyName === shipTo);
        expect(match, `Ship to company "${shipTo}" was not found in the ship to dropdown`).toBeTruthy();
        return match.companyId as number;
    }

    private async getPaymentTermId(accessToken: string, paymentTerms: string) {
        const terms = await this.getJson(accessToken, `${CORE_API_BASE}/paymentTerms/getPaymentTermDropdown`, 'get the payment terms dropdown');
        const match = (terms ?? []).find((term: any) => String(term.name).includes(paymentTerms));
        expect(match, `Payment term "${paymentTerms}" was not found in the payment terms dropdown`).toBeTruthy();
        return match.id as number;
    }

    private async getShipmentModeId(accessToken: string, shipmentMode: string) {
        const modes = await this.getJson(accessToken, `${CORE_API_BASE}/modeOfShipment/getModeDropDown`, 'get the shipment mode dropdown');
        const match = (modes?.shipmentMode ?? []).find((mode: any) => mode.mode === shipmentMode);
        expect(match, `Shipment mode "${shipmentMode}" was not found in the shipment mode dropdown`).toBeTruthy();
        return Number(match.id);
    }

    async createActiveContractForMaterial(accessToken: string, options: SeedActiveContractOptions): Promise<SeededContractMaterial> {
        const requester = await this.getRequesterDetails(accessToken);
        const requisitionTypeId = await this.getRequisitionTypeId(accessToken, options.requisitionType);
        const materialId = await this.getMaterialId(accessToken, options.materialName, requisitionTypeId);
        const vendorId = await this.getVendorId(accessToken, options.vendorName);
        const uomId = options.uomId;
        const quantity = Number(options.quantity);
        const unitPrice = Number(options.unitPrice);
        const totalPrice = quantity * unitPrice;

        const itemInfo: Record<string, unknown> = { itemId: materialId, reqQty: quantity, remarks: 'Contract precondition seed' };
        if (options.employeeName) {
            itemInfo.newQty = quantity;
            itemInfo.returnedQty = 0;
        }
        if (options.breakdownType) {
            itemInfo.breakdownType = await this.getBreakdownTypeId(accessToken, options.breakdownType);
        }

        const mirExtId = await this.postJson(accessToken, `${PROCUREMENT_API_BASE}/materialIndentRequest/create`, {
            requistionType: requisitionTypeId,
            pjoNumber: await this.getPJOId(accessToken, options.pjoNumber),
            priorityLevel: await this.getPriorityId(accessToken),
            department: requester.departmentId,
            subDepartment: requester.subDepartmentId,
            requestedBy: requester.userId,
            employeeId: options.employeeName ? await this.getEmployeeId(accessToken, options.employeeName) : undefined,
            itemInfo: [itemInfo],
        }, 'create the seed material indent request', 201);

        const mirDetail = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/materialIndentRequest/getMaterialIndentRequestById?extId=${mirExtId}`, 'get the seed material indent request');
        const mirInfoExtId = mirDetail?.materialInformationList?.[0]?.infoExtId;
        expect(mirInfoExtId, 'Seed material indent request has no material information row').toBeTruthy();

        await this.putJson(accessToken, `${PROCUREMENT_API_BASE}/mirManager/update`, { extId: mirExtId, approvalConfirm: true }, 'approve the seed material indent request');
        await this.putJson(accessToken, `${PROCUREMENT_API_BASE}/purchaseRequisition/createPR`, { extId: [mirInfoExtId], remarks: 'Contract precondition seed' }, 'create the seed purchase requisition');

        const pendingRequisitions = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/purchaseRequisitionManager/getAllPurchaseRequisitionManager?pageNumber=1&pageSize=10&search=${encodeURIComponent(options.materialName)}&filter=`, 'get the seed purchase requisition');
        const requisition = (pendingRequisitions?.data ?? []).find((pr: any) => pr.materialNames === options.materialName);
        expect(requisition, `Seed purchase requisition for "${options.materialName}" was not found in the PR manager list`).toBeTruthy();

        await this.putJson(accessToken, `${PROCUREMENT_API_BASE}/purchaseRequisitionManager/update`, { extId: requisition.extId, approvalConfirm: true }, 'approve the seed purchase requisition');

        const quotableRequisitions = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/vendorQuotation/getAllVendorQuotation?pageNumber=1&pageSize=10&search=${requisition.prNo}`, 'get the seed purchase requisition awaiting a vendor quotation');
        const quotable = (quotableRequisitions?.data ?? []).find((pr: any) => pr.prNo === requisition.prNo);
        expect(quotable, `Seed purchase requisition ${requisition.prNo} was not found in the vendor quotation list`).toBeTruthy();

        const quoteExtId = await this.sendMultipart(accessToken, `${PROCUREMENT_API_BASE}/vendorQuotation/createVendorQuotation`, {
            ShippedToId: await this.getShipToId(accessToken, options.shipTo),
            ExpectedDate: this.daysFromNow(8).toISOString(),
            IsEmailNeeded: true,
            'MaterialList[0].prNumber': quotable.prId,
            'MaterialList[0].sourceId': quotable.sourceId,
            'MaterialList[0].materialId': materialId,
            'MaterialList[0].uomId': uomId,
            'MaterialList[0].quantity': quantity,
            'MaterialList[0].groupName': 'Contract precondition seed',
            'MaterialList[0].vendorIds[0]': vendorId,
        }, 'create the seed vendor quotation', 'post', 201);

        await this.postJson(accessToken, `${PROCUREMENT_API_BASE}/vendorQuoteEmail/sendVendorQuoteEmail`, {
            vendors: [{ extId: quoteExtId, vendorId, materialIds: [materialId] }],
        }, 'send the seed vendor quote email', 200);

        const quote = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/vendorQuoteComparison/getVendorUpdateQuoteById?extId=${quoteExtId}`, 'get the seed vendor quote');
        const quoteInfoExtId = quote?.materialDetails?.[0]?.infoExtId;
        expect(quoteInfoExtId, 'Seed vendor quote has no material detail row').toBeTruthy();

        await this.sendMultipart(accessToken, `${PROCUREMENT_API_BASE}/vendorQuoteComparison/updateVendorQuoteComparison`, {
            ExtId: quoteExtId,
            TotalPrice: totalPrice,
            CurrencyId: requester.currencyId,
            CreditDays: 25,
            IsToggle: false,
            IsRFQ: false,
            VendorQuoteDate: new Date().toISOString(),
            QuoteValidUpto: this.yearsFromNow(2).toISOString(),
            'MaterialDetails[0].infoExtId': quoteInfoExtId,
            'MaterialDetails[0].materialId': materialId,
            'MaterialDetails[0].unitPrice': unitPrice,
            'MaterialDetails[0].landedCost': unitPrice,
            'MaterialDetails[0].eta': 6,
            'MaterialDetails[0].availbleQty': quantity,
            DeliveryTerms: '3',
            PaymentTerms: await this.getPaymentTermId(accessToken, options.paymentTerms),
            ShipmentMode: await this.getShipmentModeId(accessToken, options.shipmentMode),
        }, 'record the seed vendor quote', 'put', 200);

        const awardDetails = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/vendorQuoteComparison/getVendorQuoteComparisonAwardById?ExtIds=${quoteExtId}`, 'get the seed vendor quote award details');
        const awardVendor = awardDetails?.[0]?.materialDetails?.[0]?.vendorDetails?.[0];
        expect(awardVendor, 'Seed vendor quote award details are missing the vendor row').toBeTruthy();

        await this.putJson(accessToken, `${PROCUREMENT_API_BASE}/vendorQuoteComparison/updateVendorQuotationAward`, {
            updates: [{
                extId: awardVendor.rfqVendorQuotationInfoExtId,
                materialId,
                totallandedcost: Number(String(awardVendor.totalLandedCost).replace(/,/g, '')),
                isAwarded: true,
            }],
        }, 'award the seed vendor quote');

        await this.putJson(accessToken, `${PROCUREMENT_API_BASE}/vendorQuoteComparisonManager/updateVendorQuoteComparison`, {
            extId: quoteExtId,
            vendorId,
            vendorQuoteNumber: awardVendor.vendorQuoteNum,
            quoteId: awardVendor.vendorQuoteId,
            materialDetails: [{
                materialId,
                isManagerApproved: true,
                uomId,
                basePrice: unitPrice,
                landedCost: unitPrice,
                contractEndDate: this.yearsFromNow(2).toISOString(),
            }],
        }, 'approve the seed vendor quote');

        await this.verifyActiveContract(accessToken, options.materialName, options.vendorName);
        console.log(`Seeded an active contract for "${options.materialName}" with vendor "${options.vendorName}"`);

        return {
            materialName: options.materialName,
            materialId,
            vendorName: options.vendorName,
            mirExtId,
            prExtId: requisition.extId,
        };
    }

    private async verifyActiveContract(accessToken: string, materialName: string, vendorName: string) {
        const contracts = await this.getJson(accessToken, `${PROCUREMENT_API_BASE}/contractQuotePrices/getAllContractQuote?PageNumber=1&PageSize=300&Search=&Filter=`, 'get the contract quote list');
        const contract = (contracts?.data ?? []).find((record: any) => record.materialName === materialName);
        expect(contract, `No contract was created for the seeded material "${materialName}"`).toBeTruthy();
        expect(contract.expiryStatus, `Seeded contract for "${materialName}" is not Active`).toBe('Active');
        expect(contract.vendorName, `Seeded contract for "${materialName}" is not held by the expected vendor`).toBe(vendorName);
    }

    async deleteSeededContractIfCreated(accessToken: string, seed: SeededContractMaterial | null) {
        if (!seed) return;

        for (const [description, url] of [
            ['seed purchase requisition', `${PROCUREMENT_API_BASE}/purchaseRequisitionManager/deletePr/${seed.prExtId}`],
            ['seed material indent request', `${PROCUREMENT_API_BASE}/materialIndentRequest/deleteMIR/${seed.mirExtId}`],
        ] as const) {
            try {
                const response = await this.request.delete(url, { headers: this.headers(accessToken) });
                console.log(`Cleanup: deleted ${description}, status code ${response.status()}`);
            } catch (error) {
                console.log(`Cleanup: failed to delete ${description} -`, error);
            }
        }
    }
}
