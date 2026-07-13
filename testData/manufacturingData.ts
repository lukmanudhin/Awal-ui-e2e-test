import { RandomDataGenerator } from "../utils/randomDataGenerator";

export interface ManufacturingData {
  material: string;
  quantity: string;
  discount: string;
  paymentMethod: string;
  campaign: string;
}

export function getManufacturingData(): ManufacturingData {
  return {
    material: '',
    quantity: '2',
    discount: '15',
    paymentMethod: 'Cash',
    campaign: '6',
  };
}
