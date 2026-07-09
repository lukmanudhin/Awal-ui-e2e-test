export type BOQData = {
  finishedProduct: string;
  signCode: string;
  signType: string;
  signName: string;
  description: string;
  size: string;
  quantity: string;
  deliveryType: string;
  deliveryPeriod: string;
  warrantyType: string;
  warrantyPeriod: string;
};

export const addBOQData: BOQData = {
  finishedProduct: 'Apple ball',
  signCode: '12358',
  signType: 'Metal',
  signName: 'Customer',
  description: 'Add BOQ Test',
  size: '5',
  quantity: '2',
  deliveryType: 'Day',
  deliveryPeriod: '5',
  warrantyType: 'Week',
  warrantyPeriod: '8',
};