import { APIRequestContext, expect } from "@playwright/test";
import { ENV } from "../utils/ENV";

const SALES_API_BASE = `https://sales-api-${ENV.ENV_API}.colanapps.in/api/transaction/v1`;

export class SalesEnquiryAPI {
    constructor(private request: APIRequestContext) {
    }

    async getAccessToken(email: string, password: string) { 
        const response = await this.request.post(
            `https://user-management-api-${ENV.ENV_API}.colanapps.in/api/v1/auth/authenticateUser`,
            {
                data: {
                    usernameOrEmail: `${email}`,
                    password: `${password}`,
                },
            }
        );

        expect(response.status(), `Failed to get access token, status code: ${response.status()}`).toBe(200);
        const res = await response.json();
        return res.result.accessToken;
    }

    async createSalesEnquiryAPI(accessToken: string, data: any) {
        const response = await this.request.post(
            `${SALES_API_BASE}/salesEnquiry/upsertSalesEnquiry`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': `${accessToken}`,
                },
                data
            }
        );
        expect(response.status(), `Failed to create sales enquiry through API, status code: ${response.status()}`).toBe(201);
        const res = await response.json();
        return res;
    }

    async createEmbroideryAPI(accessToken: string, enquiryId: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/salesEnquiryForm/upsertEmbroidery`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': `${accessToken}`,
                },
                data: {
                    enquiryMainExtId: `${enquiryId}`,
                    categoryId: [298],
                    materialFinishId: [306],
                    tailoringOptions: [100]
                }
            }
        );
        expect(response.status(), `Failed to create embroidery through API, status code: ${response.status()}`).toBe(201);
        const res = await response.json();
        return res;
    }

    async createAcrylicProducts(accessToken: string, enquiryId: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/salesEnquiryForm/upsertAcrylicProducts`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                },
                data: {
                    enquiryMainExtId: `${enquiryId}`,
                    customerAcrylicProductLength: 5,
                    customerAcrylicProductWidth: 5,
                    customerAcrylicProductHeight: 5,
                    materialFinishId: [307, 308],
                    illuminatedOptionsId: [156, 157],
                    mountingOptionsId: [356, 357],
                    tombstoneLength: 7,
                    tombstoneWidth: 7,
                    tombstoneHeight: 7
                }
            }
        );

        expect(response.status(), `Failed to create acrylic products through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async getSalesEnquiryByName(accessToken: string, searchName: string) {
        const response = await this.request.get(`${SALES_API_BASE}/salesEnquiry/getAllSalesEnquiry`, {
            headers: { 'Authorization': accessToken },
            params: {
                pageNumber: 1,
                pageSize: 10,
                search: searchName,
                sourceType: 'salesEnquiry'
            }
        });
        expect(response.status(), "Response status does not match expected value").toBe(200);
        const res = await response.json();
        return res;
    }

    async deleteSalesEnquiry(accessToken: string, enquiryId: string) {
        const response = await this.request.delete(`${SALES_API_BASE}/salesEnquiry/delete/${enquiryId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-auth-token': accessToken,
            }
        });
        expect(response.status(), `Failed to delete sales enquiry through API, status code: ${response.status()}`).toBe(200);
        const res = await response.json();
        return res;
    }

    async viewSalesEnquiryAPI(accessToken: string, enquiryId: string) {
        const response = await this.request.get(`${SALES_API_BASE}/salesEnquiry/getEnquiryDetails?enquiryExtId=${enquiryId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        expect(response.status(), `Failed to view sales enquiry through API, status code: ${response.status()}`).toBe(200);
        const res = await response.json();
        return res;
    }

    async editSalesEnquiryAPI(accessToken: string, data: any) {
        const response = await this.request.post(
            `${SALES_API_BASE}/salesEnquiry/upsertSalesEnquiry`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': `${accessToken}`,
                },
                data
            }
        );
        expect(response.status(), `Failed to edit sales enquiry through API, status code: ${response.status()}`).toBe(200);
        const res = await response.json();
        return res;
    }

    async dispose() {
        await this.request.dispose();
    }

    async validateViewSalesEnquiryAPIResponse(response: any, payload: any) {
        expect(response.result.customerName, "Customer Name Mismatch in View Sales Enquiry API").toBe(payload.customerName);
        expect(response.result.address.telephone, "Telephone Number Mismatch in View Sales Enquiry API").toBe(payload.addresses[0].telephoneNumber);
        expect(response.result.address.mobileNumber, "Mobile Number Mismatch in View Sales Enquiry API").toBe(payload.addresses[0].mobile);
        expect(response.result.contactDetails, "Contact Details Mismatch in View Sales Enquiry API").toBe(`${payload.addresses[0].mobile}, ${payload.addresses[0].email}`);
        expect(response.result.address.email, "Email Mismatch in View Sales Enquiry API").toBe(payload.addresses[0].email);
    }

    async createSignageIlluminatedAPI(accessToken: string, enquiryId: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/salesEnquiryForm/upsertSignageIlluminated`,
            {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                },
                data: {
                    enquiryMainExtId: `${enquiryId}`,
                    illuminated: 4,
                    materialFinish: [7, 8],
                    illuminationOption: 12,
                    mountingOption: [16],
                    aluminium: [18],
                    stainlessSteel: [19],
                    acrylic: [21],
                    titaniumSteel: [24],
                    brass: 25,
                    wood: [28]
                }
            });
        expect(response.status(), `Failed to create signage illuminated through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async createAtmProductsAPI(accessToken: string, enquiryId: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/salesEnquiryForm/upsertAtmProducts`,
            {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                },
                data: {
                    enquiryMainExtId: `${enquiryId}`,
                    aluminiumId: [18],
                    stainlessSteelId: [19],
                    acrylicId: [148],
                    titaniumSteelId: [23],
                    brassId: [154],
                    woodId: [27],
                    copperId: [336],
                    illuminatedId: [12],
                    mountingOptionsId: [342]
                }
            });
        expect(response.status(), `Failed to create ATM products through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async createVinylGraphicAPI(accessToken: string, enquiryId: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/salesEnquiryForm/upsertVinylGraphic`,
            {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                },
                data: {
                    enquiryMainExtId: `${enquiryId}`,
                    vinylGraphicApplicationId: [315, 314],
                    materialFinishId: [320, 321],
                    rollUp: "5",
                    popUp: "7"
                }
            });
        expect(response.status(), `Failed to create vinyl graphic through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async createTradingProductsAPI(accessToken: string, enquiryId: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/salesEnquiryForm/upsertTradingProducts`,
            {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                },
                data: {
                    enquiryMainExtId: `${enquiryId}`,
                    trafflicMirrors: [323, 324],
                    trafflicSafetySingsSize: [325],
                    trafficConcesSize: 327,
                    trafficConcesSleeves: [330],
                    bollardsSize: 368,
                    solorTrolleys: 333,
                    safetyDesignDeveloped: true,
                    safetyColor: 1,
                    safetyLabel: 1
                }
            });
        expect(response.status(), `Failed to create trading products through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async createPvcProductsAPI(accessToken: string, enquiryId: string) {
        const response = await this.request.post(
            `${SALES_API_BASE}/salesEnquiryForm/upsertPvcProducts`,
            {
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                },
                data: {
                    enquiryMainExtId: `${enquiryId}`,
                    materialFinishId: [334],
                    length: "6",
                    width: "6",
                    height: "6"
                }
            });
        expect(response.status(), `Failed to create PVC products through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    async deleteSalesEnquiryIfCreated(extId: string) {
        if (!extId) return;
        const accessToken = await this.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        const deleteAPIResponse = await this.deleteSalesEnquiry(accessToken, extId);
        expect(deleteAPIResponse.message, 'Delete Sales Enquiry API Message Mismatch').toBe('Data deleted successfully');
        console.log('----------------------Delete Sales Enquiry API Response---------------------');
        console.log('API Response:', deleteAPIResponse);
    }

    async deleteLeadIfCreated(leadId: string) {
        if (!leadId) return;
        const accessToken = await this.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        const response = await this.request.delete(`${SALES_API_BASE}/quickLeads/deleteLeadById/${leadId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-auth-token': accessToken,
            }
        });
        expect(response.status(), `Failed to delete lead through API, status code: ${response.status()}`).toBe(200);
        const deleteAPIResponse = await response.json();
        expect(deleteAPIResponse.message, 'Delete Lead API Message Mismatch').toBe('Data deleted successfully');
        console.log('----------------------Delete Lead API Response---------------------');
        console.log('API Response:', deleteAPIResponse);
    }
    
    async getRandomEmployeeName() {
        const accessToken = await this.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        const response = await this.request.get(
            `https://core-api-${ENV.ENV_API}.colanapps.in/api/v1/employeeMaster/getAllEmployeeSearch?search=`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-auth-token': accessToken,
                }
            }
        );
        expect(response.status(), `Failed to get employee list through API, status code: ${response.status()}`).toBe(200);
        const responseBody = await response.json();
        const employees = responseBody?.result;

        expect(Array.isArray(employees) && employees.length > 0, 'Employee list is empty or missing in getAllEmployeeSearch response').toBeTruthy();

        const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        console.log(`Site Visitor (fetched dynamically via API): ${randomEmployee.empName}`);
        return randomEmployee.empName as string;
    }
}
