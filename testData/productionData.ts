export type ProductionData = {
  salesOrderStatus: string;
  pjoQuantity: string;
  bolDepartments: string[];
  // Employee assigned to the Design Studio department in the mobile app
  designStudioEmployee: string;
  pjoApprovalStatus: string;
  pjoApprovedStatus: string;
  currency: string;
  deliveryLocation: string;
  salesChecklistRemarks: string;
  productionRemarks: string;
  deliveryRemarks: string;
  installationCategory: string;
  // QC employee who is assigned to the QC task of the PJO
  qcEmployee: string;
  departmentTaskPendingStatus: string;
  departmentTaskCompletedStatus: string;
  qcTaskInProgressStatus: string;
  qcTaskCompletedStatus: string;
  qcTestType: string;
  qcTestDescription: string;
  qcTestCriteria: string;
  qcExpectedResult: string;
  qcActualResult: string;
  qcAcceptedQuantity: string;
  qcRejectedQuantity: string;
  nonConformityDetails: string;
  // File uploaded as the design file and as the non conformity attachment
  uploadFolder: string;
  uploadFileName: string;
  // Progress of the PJO once the first of its two departments is completed and QC passed
  pjoProgressPercentage: string;
  // Options that are selected in the sales order check list, in the order they appear on the form
  checkedChecklistOptions: string[];
};

export const getProductionData = (): ProductionData => ({
  salesOrderStatus: 'Sales Order Approved by Manager',
  pjoQuantity: '1',
  bolDepartments: ['Design Studio', 'Vinyl Graphics & Application'],
  designStudioEmployee: 'Sanjay Preeth',
  pjoApprovalStatus: 'Pending',
  pjoApprovedStatus: 'Approved',
  qcEmployee: 'Yoganath raja',
  departmentTaskPendingStatus: 'Pending',
  departmentTaskCompletedStatus: 'Completed',
  qcTaskInProgressStatus: 'In Progress',
  qcTaskCompletedStatus: 'Completed',
  qcTestType: 'Machine Testing',
  qcTestDescription: 'QC E2E Test Description',
  qcTestCriteria: 'Test Criteria',
  qcExpectedResult: '5',
  qcActualResult: '5',
  qcAcceptedQuantity: '1',
  qcRejectedQuantity: '0',
  nonConformityDetails: 'Details of non confirmation QC Task E2E Test',
  uploadFolder: 'test_Documents',
  uploadFileName: 'Test_Document.pdf',
  pjoProgressPercentage: '50%',
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
