export type ProductionData = {
  salesOrderStatus: string;
  pjoQuantity: string;
  bolDepartments: string[];
  pjoApprovalStatus: string;
  pjoApprovedStatus: string;
  currency: string;
  deliveryLocation: string;
  salesChecklistRemarks: string;
  productionRemarks: string;
  deliveryRemarks: string;
  installationCategory: string;
  // Options that are selected in the sales order check list, in the order they appear on the form
  checkedChecklistOptions: string[];
};

export const getProductionData = (): ProductionData => ({
  salesOrderStatus: 'Sales Order Approved by Manager',
  pjoQuantity: '1',
  bolDepartments: ['Design Studio', 'Vinyl Graphics & Application'],
  pjoApprovalStatus: 'Pending',
  pjoApprovedStatus: 'Approved',
  currency: 'SAR',
  deliveryLocation: 'Guangdong',
  salesChecklistRemarks: 'Sales Checklist Remarks',
  productionRemarks: 'Production Remarks',
  deliveryRemarks: 'Delivery Remarks',
  installationCategory: 'MOW Installation',
  checkedChecklistOptions: [
    'Email',                            // 1. Quotation Confirmation
    'Photocopy',                        // 2. Purchase Order
    'Approved Artwork',                 // 3. Attachments
    'Yes',                              // 4. Advance payment applied
    'Yes',                              // 5. Retention applied
    'Yes',                              // 6. Partial invoice accepted
    'Yes',                              // 7. Stock reserved
    'Material',                         // 4. PR Required
    'Services / Sub-Contract Charges',  // 4. PR Required
    'Partial Subcontractor Service',    // Subcontractor service
    'Yes',                              // 5. Final QA/QC passed
    'YES',                              // 6. Delivery note
    'YES',                              // 7. Overtime considered
    'Delivery & Installation',          // 1. Mode of delivery
    'YES',                              // 2. Delivery note with the goods
  ],
});
