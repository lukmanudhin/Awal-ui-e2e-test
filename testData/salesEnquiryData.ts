
import { RandomDataGenerator } from "../utils/randomDataGenerator";
import { faker } from "@faker-js/faker";

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
  flatOrVilla: `${faker.location.cardinalDirection()}`,
  building: `${faker.location.buildingNumber()}`,
  block: `${faker.string.alpha({ length: 2, casing: 'upper' })}`,
  road: `${faker.location.street()}`,
  area: `${faker.location.city()}`,
  telephoneNumber1: `${RandomDataGenerator.getPhoneNumber()}`,
  mobileNumber1: `${RandomDataGenerator.getPhoneNumber()}`,
  fax: `${faker.string.numeric(7)}`,
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
  dimension: `${faker.number.int({ min: 1, max: 20 })}*${faker.number.int({ min: 1, max: 20 })}`,
  materialThickness: `${faker.number.int({ min: 1, max: 100 })}`,
  color: `${faker.color.human()}`,
  projectRequirementType: `${RandomDataGenerator.getProjectReqType()}`,
  wall: `${faker.lorem.words({ min: 1, max: 3 })}`,
  equipment: `${RandomDataGenerator.getEquipment()}`,
  equipmentProvidedBy: `${faker.company.name()}`,
  powerSupply: `${faker.helpers.arrayElement(['electricity', 'solar', 'generator'])}`,
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
  flatOrVilla: `${faker.location.cardinalDirection()}`,
  building: `${faker.location.buildingNumber()}`,
  block: `${faker.string.alpha({ length: 2, casing: 'upper' })}`,
  road: `${faker.location.street()}`,
  area: `${faker.location.city()}`,
  telephoneNumber1: `${RandomDataGenerator.getPhoneNumber()}`,
  mobileNumber1: `${RandomDataGenerator.getPhoneNumber()}`,
  fax: `${faker.string.numeric(7)}`,
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
  dimension: `${faker.number.int({ min: 1, max: 20 })}*${faker.number.int({ min: 1, max: 20 })}`,
  materialThickness: `${faker.number.int({ min: 1, max: 100 })}`,
  color: `${faker.color.human()}`,
  projectRequirementType: `${RandomDataGenerator.getProjectReqType()}`,
  wall: `${faker.lorem.words({ min: 1, max: 3 })}`,
  equipment: `${RandomDataGenerator.getEquipment()}`,
  equipmentProvidedBy: `${faker.company.name()}`,
  powerSupply: `${faker.helpers.arrayElement(['electricity', 'solar', 'generator'])}`,
  permission: `${RandomDataGenerator.getPermission()}`,
  // product: ['Acrylic Products', 'ATM Products', 'Embroidery & Tailoring', 'PVC Products', 'Signage', 'Trading', 'Vinyl Graphic'],
  product: ['Acrylic Products', 'Embroidery & Tailoring'],
  date: RandomDataGenerator.getCurrentDay(),
  paymentTerms: '100 % Advance Full Payment',
  currency: `${RandomDataGenerator.getCurrency()}`,
  supplyType: `${RandomDataGenerator.getSupplyType()}`, 
  socialMedia: `${RandomDataGenerator.getSocialMedia()}`,
};