import { RandomDataGenerator } from "../utils/randomDataGenerator";

export interface TradingData {
  customerName: string;
  company: string;
  city: string;
  owner: string;
  value: string
  expectedDate: number;
  phone: string;
  secondaryPhone: string;
  email: string;
  secondaryEmail: string;
  notes: string;
  material: string;
  quantity: string;
  discount: string;
  campaign: string;
  paymentMethod: string;
}

export function getTradingData(): TradingData {
  return {
    customerName: `${RandomDataGenerator.getFirstName()} ${RandomDataGenerator.getLastName()}`,
    company: 'Colan Infotech',
    city: 'Guangdong',  
    owner: 'EMP00287 - Neelamegam Subramani',
    value: '2',
    expectedDate: RandomDataGenerator.getCurrentDay(),
    phone: `${RandomDataGenerator.getPhoneNumber()}`,
    secondaryPhone: `${RandomDataGenerator.getPhoneNumber()}`,
    email: `${RandomDataGenerator.getEmail()}`,
    secondaryEmail: `${RandomDataGenerator.getEmail()}`,
    notes: 'Trading E2E Test Note',
    material: '',
    quantity: '2',
    discount: '15',
    campaign: '6',
    paymentMethod: 'Cash',
  }
}