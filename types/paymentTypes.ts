
export const PAYMENT_TYPES = {
  MOBILE_BANKING: 'Mobile Banking',
  CHEQUE: 'Chèque de banque', 
  CASH: 'Liquide'
} as const;

export type PaymentType = typeof PAYMENT_TYPES[keyof typeof PAYMENT_TYPES];

export const PHONE_TYPES = {
  PRINCIPAL: 'principal',
  WHATSAPP: 'whatsapp',
  MVOLA: 'mvola',
  ORANGE_MONEY: 'orange_money',
  AIRTEL_MONEY: 'airtel_money',
  MOBILE_BANKING: 'mobile_banking',
  AUTRE: 'autre'
} as const;

export type PhoneType = typeof PHONE_TYPES[keyof typeof PHONE_TYPES];

// Mapping des types de téléphone qui sont considérés comme Mobile Banking
// Excluant désormais PHONE_TYPES.MOBILE_BANKING
export const MOBILE_BANKING_PHONE_TYPES: PhoneType[] = [
  PHONE_TYPES.MVOLA,
  PHONE_TYPES.ORANGE_MONEY, 
  PHONE_TYPES.AIRTEL_MONEY
];

export const isMobileBankingPhone = (phoneType: string): boolean => {
  return MOBILE_BANKING_PHONE_TYPES.includes(phoneType as PhoneType);
};
