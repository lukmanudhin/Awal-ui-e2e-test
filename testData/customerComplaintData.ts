import { RandomDataGenerator } from "../utils/randomDataGenerator";

export type CustomerComplaintData = {
    // Complaint Registration Form
    date: number;
    customer: string;
    invoiceNo: string;
    quantityAffected: string;
    productDescription: string;
    customerOnComplaints: string;
    proof: string;
    fileName: string;
    supportingDocuments: string;
    detailOfComplaints: string;
    proposedAction: string;
    furtherInvestigationBy: string;
    assignedTo: string;
    proposedBy: string;
    approvedBy: string;
};

export const getCustomerComplaintData = (): CustomerComplaintData => ({
    date: RandomDataGenerator.getCurrentDay(),
    customer: 'CUST01559 - subhashini',
    invoiceNo: '202600935',
    quantityAffected: '6',
    productDescription: 'Customer Complaint E2E Test',
    customerOnComplaints: 'CCR00018 - Test',
    proof: 'Enclosed',
    fileName: 'Test_Document.pdf',
    supportingDocuments: 'Attached',
    detailOfComplaints: 'Customer Complaint E2E Test',
    proposedAction: 'Proposed Action for Customer Complaint E2E Test',
    furtherInvestigationBy: 'IT Support',
    assignedTo: 'Janaki',
    proposedBy: 'Praveeen Kumar',
    approvedBy: 'Vignesh M MERN'
});
