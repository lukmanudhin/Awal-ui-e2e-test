export type ProductionData = {
  salesOrderStatus: string;
  pjoQuantity: string;
  bolDepartments: string[];
  pjoApprovalStatus: string;
  pjoApprovedStatus: string;
};

export const getProductionData = (): ProductionData => ({
  salesOrderStatus: 'Sales Order Approved by Manager',
  pjoQuantity: '1',
  bolDepartments: ['Design Studio', 'Vinyl Graphics & Application'],
  pjoApprovalStatus: 'Pending',
  pjoApprovedStatus: 'Approved',
});
