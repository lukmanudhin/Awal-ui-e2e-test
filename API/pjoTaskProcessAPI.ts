import { APIRequestContext, expect } from "@playwright/test";
import { ENV } from "../utils/ENV";

const PRODUCTION_API_BASE = `https://production-api-${ENV.ENV_API}.colanapps.in/api/v1/pjoTaskProcess`;

// The Awal tablet app (Production > Task Management) drives the PJO task of a department through these endpoints:
// pick the employee, list the PJOs of the employee's department, assign a PJO (task process), start it and complete it.
export class PjoTaskProcessAPI {
    constructor(private request: APIRequestContext) {
    }

    private headers(accessToken: string) {
        return {
            'Authorization': `Bearer ${accessToken}`,
            'x-auth-token': accessToken,
        };
    }

    // Employees of the Task Management screen, e.g. { id: 234, employee: "EMP00234 | Sanjay Preeth D", departmentId: 46, department: "Design Studio" }
    async getAllEmployee(accessToken: string, search: string) {
        const response = await this.request.get(`${PRODUCTION_API_BASE}/getAllEmployee`, {
            headers: this.headers(accessToken),
            params: { Search: search },
        });
        expect(response.status(), `Failed to get task management employees through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    // "Assign PJO" screen: the PJOs (pjoDropdown: id, name = PJO number, routeStageId) that the employee's department can pick up
    async getAssignPjoById(accessToken: string, employeeId: number) {
        const response = await this.request.get(`${PRODUCTION_API_BASE}/getAssignPjoById`, {
            headers: this.headers(accessToken),
            params: { EmpId: String(employeeId) },
        });
        expect(response.status(), `Failed to get the assignable PJOs through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    // Submit on the Assign PJO screen
    async createPjoTaskProcess(accessToken: string, employeeId: number, subDeptId: number, pjoId: number, routeStageId: number) {
        const response = await this.request.post(`${PRODUCTION_API_BASE}/CreatePjoTaskProcess`, {
            headers: this.headers(accessToken),
            data: { empId: employeeId, subDeptId, pjoId, routeStageId },
        });
        expect(response.status(), `Failed to assign the PJO task through API, status code: ${response.status()}`).toBe(201);
        return await response.json();
    }

    // Production Job Detail screen: result.status is NOTYETSTARTED / INPROGRESS / COMPLETED
    async getPjoTaskProcessById(accessToken: string, taskProcessExtId: string) {
        const response = await this.request.get(`${PRODUCTION_API_BASE}/getPjoTaskProcessById`, {
            headers: this.headers(accessToken),
            params: { ExtId: taskProcessExtId },
        });
        expect(response.status(), `Failed to get the PJO task process through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    // Start Task + Yes
    async startPjoTask(accessToken: string, taskProcessExtId: string) {
        const response = await this.request.put(`${PRODUCTION_API_BASE}/updatePjoTaskProcess`, {
            headers: this.headers(accessToken),
            data: { extId: taskProcessExtId, startTime: new Date().toISOString(), isPaused: false },
        });
        expect(response.status(), `Failed to start the PJO task through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }

    // End Task + Yes (the PjoTaskProcessCompletion endpoint only uploads the task files, it does not end the task)
    async endPjoTask(accessToken: string, taskProcessExtId: string) {
        const response = await this.request.put(`${PRODUCTION_API_BASE}/updatePjoTaskProcess`, {
            headers: this.headers(accessToken),
            data: { extId: taskProcessExtId, endTime: new Date().toISOString(), isPaused: false },
        });
        expect(response.status(), `Failed to end the PJO task through API, status code: ${response.status()}`).toBe(200);
        return await response.json();
    }
}
