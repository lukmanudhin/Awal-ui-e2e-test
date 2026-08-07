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
  qcFailedQuantity: string;
  putAwayQuantity: string;
  grnRemarks: string;
  purchaseOrderRemarks: string;
  deliveryNote: string;
  invoiceNumber: string;
  warehouse: string;
  conversionUnit: string;
  row: string;
  rack: string;
  shelf: string;
  shipTo: string;
  vendorQuotationVendor: string;
  tempVendorName: string;
  tempVendorEmail: string;
  creditDays: string;
  availableQuantity: string;
  unitPrice: string;
  eta: string;
  deliveryPeriod: string;
  paymentTerms: string;
  shipmentMode: string;
};

export const getMIRDetails = (): CreateMIRData => {
  const requestedQuantity = 50;
  const qcFailedQuantity = RandomDataGenerator.getNumber(1, 5);

  return {
    requisitionType: 'Raw Materials',
    priority: `${RandomDataGenerator.generatePriority()}`,
    pjoNumber: '802600615',
    material: 'WIRE - SINGLE STRAND 2 CORE',
    quantity: `${requestedQuantity}`,
    remarks: 'Add Material Test Remarks',
    vendor: '',
    orderType: 'Local - Product / Materials',
    qcFailedQuantity: `${qcFailedQuantity}`,
    putAwayQuantity: `${requestedQuantity - qcFailedQuantity}`,
    grnRemarks: 'Create GRN Remarks',
    purchaseOrderRemarks: 'Purchase Order (Contract) Remarks',
    deliveryNote: `DN-${RandomDataGenerator.getNumber(10000, 99999)}`,
    invoiceNumber: `${RandomDataGenerator.getNumber(10000, 99999)}`,
    warehouse: 'Warehouse  A - Salmabad Industrial Area',
    conversionUnit: '5',
    row: 'aisle1',
    rack: 'Put Away Rack 1',
    shelf: 'Finance_Self',
    shipTo: 'Colan tech Info',
    vendorQuotationVendor: 'QA Vendor testing',
    tempVendorName: `Test Vendor ${RandomDataGenerator.getNumber(100000, 999999)}`,
    tempVendorEmail: `${RandomDataGenerator.getEmail()}`,
    creditDays: '25',
    availableQuantity: `${requestedQuantity}`,
    unitPrice: '2',
    eta: '6',
    deliveryPeriod: '3',
    paymentTerms: '% Cash on Delivery',
    shipmentMode: 'Sea Freight',
  };
};
