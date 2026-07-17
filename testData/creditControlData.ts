import { RandomDataGenerator } from '../utils/randomDataGenerator';

export type CreditControlData = {
    customer: string;
    company: string;
    applicantName: string;
    crnNo: string;
    vatNo: string;
    customerIndustry: string;
    contactPerson: string;
    contactPersonPosition: string;
    contactPersonNumber: string;
    financeContactName: string;
    financeContactPosition: string;
    financeContactNumber: string;
    founderName: string;
    founderPosition: string;
    founderNationality: string;
    signatoryName: string;
    poStatus: string;
    bankName: string;
    bankBranch: string;
    bankAccountNumber: string;
    relationshipManager: string;
    bankContactNumber: string;
    traderName: string;
    tradeContactPerson: string;
    tradeContactNumber: string;
    facilityEnjoyed: string;
    tradeEmail: string;
    tradeDays: string;
    customerAcknowledgementName: string;
    acknowledgementDesignation: string;
    fileName: string;
};

export type SalesAssesmentData = {
    proposedBHD: string;
    creditPeriod: string;
    paymentTerms: string;
    remarks: string;
    recommendedBy: string;
    accountExecutive: string;
    salesManager: string;
};

export type FinanceAssesmentData = {
    monthOutstanding: string;
    limitApproved: string;
    bankReference: string;
    tradeReference: string;
    paymentTerms: string;
    proposedLimit: string;
    creditPeriod: string;
    remarks: string;
};

export const getCreditControlData = (): CreditControlData => ({
    customer: 'EMP157-Vignesh Waran',
    company: 'Colan Infotech',
    applicantName: '',
    crnNo: '2',
    vatNo: '3',
    customerIndustry: 'Company W.L.L.',
    contactPerson: 'Vigneshwaran',
    contactPersonPosition: 'Tester',
    contactPersonNumber: `${RandomDataGenerator.getPhoneNumber()}`,
    financeContactName: 'Subash',
    financeContactPosition: 'Finance Manager',
    financeContactNumber: `${RandomDataGenerator.getPhoneNumber()}`,
    founderName: 'Founder Name',
    founderPosition: 'Founder Position',
    founderNationality: 'India',
    signatoryName: 'Signatory Name',
    poStatus: 'Yes',
    bankName: 'Bank Name',
    bankBranch: 'Bank Branch',
    bankAccountNumber: '123456789',
    relationshipManager: 'Relationship Manager',
    bankContactNumber: `${RandomDataGenerator.getPhoneNumber()}`,
    traderName: 'Trader',
    tradeContactPerson: 'Trade Contact Person',
    tradeContactNumber: `${RandomDataGenerator.getPhoneNumber()}`,
    facilityEnjoyed: 'Facility',
    tradeEmail: `${RandomDataGenerator.getEmail()}`,
    tradeDays: '10',
    customerAcknowledgementName: 'Customer Acknowledgement Name',
    acknowledgementDesignation: 'Acknowledgement Designation',
    fileName: 'Test_Document.pdf',
});

export const getSalesAssesmentData = (): SalesAssesmentData => ({
    proposedBHD: '65434',
    creditPeriod: '2',
    paymentTerms: '100 % Advance Full Payment',
    remarks: 'Credit Control E2E Flow Remarks',
    recommendedBy: 'EMP00287 - Neelamegam Subramani',
    accountExecutive: 'EMP00287 - Neelamegam Subramani',
    salesManager: 'EMP00287 - Neelamegam Subramani',
});

export const getFinanceAssesmentData = (): FinanceAssesmentData => ({
    monthOutstanding: '2',
    limitApproved: '6544',
    bankReference: '785',
    tradeReference: '564',
    paymentTerms: '100 % Advance Full Payment',
    proposedLimit: '987',
    creditPeriod: '3',
    remarks: 'Credit Control E2E Flow Remarks',
});
