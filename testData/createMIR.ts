import { RandomDataGenerator } from "../utils/randomDataGenerator";

export type CreateMIRData = {
  requisitionType: string;
  priority: string;
  pjoNumber: string;
  material: string;
  quantity: string;
  remarks: string;
  vendor: string;
  orderType: string;
};

export const getMIRDetails = (): CreateMIRData => ({
  requisitionType: 'Raw Materials',
  priority: `${RandomDataGenerator.generatePriority()}`,
  pjoNumber: '802600615',
  material: 'WIRE - SINGLE STRAND 2 CORE',
  quantity: '50',
  remarks: 'Add Material Test Remarks',
  vendor: '',
  orderType: 'Local - Product / Materials',
});