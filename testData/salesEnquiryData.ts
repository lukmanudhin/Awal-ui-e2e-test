
import { RandomDataGenerator } from "../utils/randomDataGenerator";
export type SalesEnquiryData = {
  customerName: string;
  flatOrVilla: string;
  building: string;
  block: string;
  road: string;
  area: string;
  telephoneNumber1: string;
  mobileNumber1: string;
  fax: string;
  telephoneNumber2: string;
  mobileNumber2: string;
  email1: string;
  email2: string;
  website: string;
  poBox: string;
  country: string;
  state: string;
  city: string;
  projectName: string;
  projectMode: string;
  signageType: string;
  timePurpose: string;
  designSuppliedBy: string;
  materialSuppliedBy: string;
  dimension: string;
  materialThickness: string;
  color: string;
  projectRequirementType: string;
  wall: string;
  equipment: string;
  equipmentProvidedBy: string;
  powerSupply: string;
  permission: string;
  product: string[];
  date: number;
  paymentTerms: string;
  currency: string;
  supplyType: string;
  socialMedia: string;
};

export const getCreateEnquiryData = (): SalesEnquiryData => ({
  customerName: `${RandomDataGenerator.getFirstName()} ${RandomDataGenerator.getLastName()}`,
  flatOrVilla: 'flat 2',
  building: 'building 2',
  block: 'block 2',
  road: 'road 2',
  area: 'area 2',
  telephoneNumber1: `${RandomDataGenerator.getPhoneNumber()}`,
  mobileNumber1: `${RandomDataGenerator.getPhoneNumber()}`,
  fax: '3',
  telephoneNumber2: `${RandomDataGenerator.getPhoneNumber()}`,
  mobileNumber2: `${RandomDataGenerator.getPhoneNumber()}`,
  email1: `${RandomDataGenerator.getEmail()}`,
  email2: `${RandomDataGenerator.getEmail()}`,
  website: 'https://demo-test.in/sales',
  poBox: '2',
  country: 'China',
  state: 'Guangdong Province',
  city: 'Guangdong',
  projectName: 'Sales Enquiry Test',
  projectMode: `${RandomDataGenerator.getProjectMode()}`,
  signageType: `${RandomDataGenerator.getSignageType()}`,
  timePurpose: `${RandomDataGenerator.getTimePurpose()}`,
  designSuppliedBy: `${RandomDataGenerator.getSuppliedBy()}`,
  materialSuppliedBy: `${RandomDataGenerator.getSuppliedBy()}`,
  dimension: '5*5',
  materialThickness: '54',
  color: 'red',
  projectRequirementType: `${RandomDataGenerator.getProjectReqType()}`,
  wall: 'glass',
  equipment: `${RandomDataGenerator.getEquipment()}`,
  equipmentProvidedBy: 'iron',
  powerSupply: 'electricity',
  permission: `${RandomDataGenerator.getPermission()}`,
  // product: ['Acrylic Products', 'ATM Products', 'Embroidery & Tailoring', 'PVC Products', 'Signage', 'Trading', 'Vinyl Graphic'],
  product: ['Acrylic Products', 'Embroidery & Tailoring', 'ATM Products'],
  date: RandomDataGenerator.getCurrentDay(),
  paymentTerms: '100 % Advance Full Payment',
  currency: `${RandomDataGenerator.getCurrency()}`,
  supplyType: `${RandomDataGenerator.getSupplyType()}`, 
  socialMedia: `${RandomDataGenerator.getSocialMedia()}`,
});

export const editEnquiryData: SalesEnquiryData = {
  customerName: `${RandomDataGenerator.getFirstName()} ${RandomDataGenerator.getLastName()}`,
  flatOrVilla: 'flat 2',
  building: 'building 2',
  block: 'block 2',
  road: 'road 2',
  area: 'area 2',
  telephoneNumber1: `${RandomDataGenerator.getPhoneNumber()}`,
  mobileNumber1: `${RandomDataGenerator.getPhoneNumber()}`,
  fax: '3',
  telephoneNumber2: `${RandomDataGenerator.getPhoneNumber()}`,
  mobileNumber2: `${RandomDataGenerator.getPhoneNumber()}`,
  email1: `${RandomDataGenerator.getEmail()}`,
  email2: `${RandomDataGenerator.getEmail()}`,
  website: 'https://demo-test.in/sales',
  poBox: '2',
  country: 'China',
  state: 'Guangdong Province',
  city: 'Guangdong',
  projectName: 'Sales Enquiry Test',
  projectMode: `${RandomDataGenerator.getProjectMode()}`,
  signageType: `${RandomDataGenerator.getSignageType()}`,
  timePurpose: `${RandomDataGenerator.getTimePurpose()}`,
  designSuppliedBy: `${RandomDataGenerator.getSuppliedBy()}`,
  materialSuppliedBy: `${RandomDataGenerator.getSuppliedBy()}`,
  dimension: '5*5',
  materialThickness: '54',
  color: 'red',
  projectRequirementType: `${RandomDataGenerator.getProjectReqType()}`,
  wall: 'glass',
  equipment: `${RandomDataGenerator.getEquipment()}`,
  equipmentProvidedBy: 'iron',
  powerSupply: 'electricity',
  permission: `${RandomDataGenerator.getPermission()}`,
  // product: ['Acrylic Products', 'ATM Products', 'Embroidery & Tailoring', 'PVC Products', 'Signage', 'Trading', 'Vinyl Graphic'],
  product: ['Acrylic Products', 'Embroidery & Tailoring'],
  date: RandomDataGenerator.getCurrentDay(),
  paymentTerms: '100 % Advance Full Payment',
  currency: `${RandomDataGenerator.getCurrency()}`,
  supplyType: `${RandomDataGenerator.getSupplyType()}`, 
  socialMedia: `${RandomDataGenerator.getSocialMedia()}`,
};