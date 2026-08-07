import { RandomDataGenerator } from "../utils/randomDataGenerator";

export type VendorRegistrationData = {
  // General Information
  companyName: string;
  telephoneNumber: string;
  mobileNumber: string;
  emailAddress: string;
  webAddress: string;
  facebookLink: string;
  instagramLink: string;
  flatNo: string;
  building: string;
  block: string;
  road: string;
  country: string;
  state: string;
  city: string;
  area: string;
  postBoxNo: string;
  contactName1: string;
  designation1: string;
  phoneNumber1: string;
  contactEmail1: string;
  contactName2: string;
  designation2: string;
  phoneNumber2: string;
  contactEmail2: string;
  // Company Information
  legalName: string;
  licenseNumber: string;
  yearEstablished: string;
  typeOfBusiness: string;
  natureOfBusiness: string;
  fullTimeEmployees: string;
  partTimeEmployees: string;
  workingLanguage: string;
  vatNumber: string;
  crNumber: string;
  qualityAssurance: string;
  companyDescription: string;
  // Goods & Services
  goodsDescription: string;
  totalSales: string[];
  totalExportSales: string[];
  goodsCountry: string;
  // Bank Information
  bankName: string;
  branchAddress: string;
  accountName: string;
  bankAccountNumber: string;
  accountCurrency: string;
  bankTelephoneNumber: string;
  faxNumber: string;
  creditLimitAmount: string;
  paymentTerms: string;
  ibanNumber: string;
  swiftCode: string;
  routingBankDetails: string;
  // Evaluation
  recommendation: string;
  modeOfDiscussion: string;
  evaluatorName: string;
};

export const getVendorRegistrationData = (): VendorRegistrationData => ({
  companyName: '',
  telephoneNumber: `${RandomDataGenerator.getPhoneNumber()}`,
  mobileNumber: `${RandomDataGenerator.getPhoneNumber()}`,
  emailAddress: `${RandomDataGenerator.getEmail()}`,
  webAddress: 'https://demo.com',
  facebookLink: 'facebook.com',
  instagramLink: 'instagram.com',
  flatNo: '2',
  building: 'Building',
  block: 'Block',
  road: 'Road',
  country: 'Kingdom of Bahrain',
  state: 'Muharraq',
  city: 'Al Muharraq',
  area: 'Area',
  postBoxNo: '543',
  contactName1: `${RandomDataGenerator.getFirstName()}`,
  designation1: 'Designation',
  phoneNumber1: `${RandomDataGenerator.getPhoneNumber()}`,
  contactEmail1: `${RandomDataGenerator.getEmail()}`,
  contactName2: `${RandomDataGenerator.getFirstName()}`,
  designation2: 'Designation 2',
  phoneNumber2: `${RandomDataGenerator.getPhoneNumber()}`,
  contactEmail2: `${RandomDataGenerator.getEmail()}`,

  legalName: 'Colan Info',
  licenseNumber: `${RandomDataGenerator.getNumber(10000, 99999)}`,
  yearEstablished: '2012',
  typeOfBusiness: 'Corporate/Limited',
  natureOfBusiness: 'Authorized Agent',
  fullTimeEmployees: '5',
  partTimeEmployees: '2',
  workingLanguage: 'ARABIC Q',
  vatNumber: '2',
  crNumber: '4',
  qualityAssurance: 'ISO 9001',
  companyDescription: 'Vendor Creation',

  goodsDescription: 'Temp Vendor Des',
  // One value per year column shown on the Goods & Services step
  totalSales: ['4', '5', '7'],
  totalExportSales: ['2', '4', '8'],
  goodsCountry: 'Kingdom of Bahrain',
  bankName: 'ABC Bank',
  branchAddress: 'Alwarpet',
  accountName: 'Account Name',
  bankAccountNumber: `${RandomDataGenerator.getNumber(100000000, 999999999)}`,
  accountCurrency: 'BHD',
  bankTelephoneNumber: `${RandomDataGenerator.getPhoneNumber()}`,
  faxNumber: '8966',
  creditLimitAmount: '34',
  paymentTerms: '% Advance Full Payment',
  ibanNumber: `${RandomDataGenerator.getNumber(100000000, 999999999)}`,
  swiftCode: '2324',
  routingBankDetails: 'Test',
  recommendation: 'Test Assesment Recomendation',
  modeOfDiscussion: 'On-Site Visit',
  evaluatorName: '',
});
