import { RandomDataGenerator } from '../utils/randomDataGenerator';

export type SalesReturnData = {
    quantity: string;
    reason: string;
    remarks: string;
    failedQuantity: string;
    qcRemark: string;
    fileName: string;
    moveReceivedProductTo: string;
};

export const getSalesReturnData = (): SalesReturnData => ({
    quantity: '1',
    reason: 'test',
    remarks: 'remark',
    failedQuantity: '0',
    qcRemark: 'ream',
    fileName: 'Test_Document.pdf',
    moveReceivedProductTo: 'Scrap',
});

export type BankPaymentVoucherData = {
    bankName: string;
    inFavourOf: string;
    chequeNumber: string;
    valueDate: number;
    chequeDate: number;
    bankCommission: string;
    ddChequeIssueCharges: string;
    lcCharges: string;
    otherDeductions: string;
};

export const getBankPaymentVoucherData = (): BankPaymentVoucherData => ({
    bankName: 'BANK ZCBL',
    inFavourOf: 'Test Vendor',
    chequeNumber: String(RandomDataGenerator.getNumber(100000, 999999)),
    valueDate: RandomDataGenerator.getCurrentDay(),
    chequeDate: RandomDataGenerator.getCurrentDay(),
    bankCommission: '1',
    ddChequeIssueCharges: '1',
    lcCharges: '1',
    otherDeductions: '1',
});