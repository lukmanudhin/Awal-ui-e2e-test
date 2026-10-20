import { getCreateEnquiryData, type SalesEnquiryData } from "./salesEnquiryData";
import { addBOQData, type BOQData } from "./addBoqData";

// Invalid / boundary values used by the negative and edge-case specs under tests/UI/sales/edgeCases
export const invalidEnquiryValues = {
  whitespaceOnly: '   ',
  invalidEmail: 'invalid-email',
  invalidWebsite: 'not a url',
};

export const getInvalidEnquiryData = (overrides: Partial<SalesEnquiryData>): SalesEnquiryData => ({
  ...getCreateEnquiryData(),
  product: ['Acrylic Products'],
  ...overrides,
});

export type PPJORequestDetails = {
  attachFile: boolean;
  quantity: string;
  description: string;
};

export const validPPJORequestDetails: PPJORequestDetails = {
  attachFile: true,
  quantity: '5',
  description: 'Artwork requirement details',
};

export const getInvalidPPJORequestDetails = (overrides: Partial<PPJORequestDetails>): PPJORequestDetails => ({
  ...validPPJORequestDetails,
  ...overrides,
});

export const getInvalidBOQData = (overrides: Partial<BOQData>): BOQData => ({
  ...addBOQData,
  ...overrides,
});

export const invalidBOMValues = {
  material: 'ALUMINIUM SHEET 3MX1.53MX2.5MM- FASCIA',
  warrantyValue: '1',
};
