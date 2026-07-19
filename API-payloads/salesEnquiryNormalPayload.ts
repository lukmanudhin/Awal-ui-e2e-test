import { RandomDataGenerator } from "../utils/randomDataGenerator";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setUTCHours(18, 30, 0, 0);
const deliveryDateIso = tomorrow.toISOString();

export const salesEnquiryNormalPayload = {
    sourceType: 'salesenquiry',
    pricingDate: deliveryDateIso,
    requestedDeliveryDate: deliveryDateIso,
    customerName: `${RandomDataGenerator.getFirstName()} ${RandomDataGenerator.getLastName()}`,
    customerId: null,
    projectName: 'Sales Enquiry Normal API Test',
    projectMode: 1,
    paymentTermsId: 144,
    preferCurrencyId: 61,
    baseCurrencyId: 83,
    supplyTypeId: 370,
    manufacturingUnit: 'Awal Plastics Bahrain',
    signageType: 2,
    timePurpose: 1,
    designSuppliedBy: 2,
    materialSuppliedBy: 1,
    size: '5*5',
    materialThickness: '54',
    colorFinish: 'red',
    projectRequirement: 2,
    equipmentRequirement: [1],
    equipmentProvidedBy: 'iron',
    wallFinishDetails: 'glass',
    products: [361],
    permissionRequired: true,
    powerSupply: 'electricity',
    addresses: [
        {
            addressTypeId: 1,
            flatVilla: 'flat 2',
            building: 'building 2',
            block: 'block 2',
            road: 'road 2',
            area: 'area 2',
            telephoneNumber: `${RandomDataGenerator.getPhoneNumber()}`,
            telephoneNumber2: `${RandomDataGenerator.getPhoneNumber()}`,
            mobile: `${RandomDataGenerator.getPhoneNumber()}`,
            mobile2: `${RandomDataGenerator.getPhoneNumber()}`,
            fax: '3',
            email: `${RandomDataGenerator.getEmail()}`,
            email2: `${RandomDataGenerator.getEmail()}`,
            website: 'https://demo-test.in/sales',
            pobox: '2',
            city: 255,
            state: 139,
            country: 184,
        },
    ],
} as const;

export const deliveryDateISO = deliveryDateIso;
