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
};

export const getMIRDetails = (): CreateMIRData => {
  // The out-of-stock flow chains these quantities together, so they are derived from one
  // another rather than repeated as literals: the whole requested quantity is received on the
  // GRN and sampled by QC, whatever fails QC is deducted, and the remainder is exactly what
  // Put Away accepts (the app rejects a Put Away quantity that differs from the QC-passed
  // quantity) and what is then issued to drain the material back to zero.
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
    // Double space is intentional: the dropdown filters on the raw option label, which is
    // stored with two spaces. Collapsing it to one filters the list down to nothing.
    warehouse: 'Warehouse  A - Salmabad Industrial Area',
    conversionUnit: '5',
    row: 'aisle1',
    rack: 'Put Away Rack 1',
    shelf: 'Finance_Self',
  };
};
