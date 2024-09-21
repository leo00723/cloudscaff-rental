export interface TransactionItem {
  id?: string;
  size?: string;
  inMaintenanceQty?: number;
  damagedQty?: number;
  lostQty?: number;
  error?: boolean;
  deliveryLogId?: string;
  itemId?: string;
  code?: string;
  category?: string;
  name?: string;
  weight?: string;
  deliveredQty?: number;
  invoiceQty?: number;
  balanceQty?: number;
  returnTotal?: number;
  returnQty?: number;
  location?: string;
  returnId?: string;
  returnCode?: string;
  returnDate?: any;
  invoiceStart?: any;
  invoiceEnd?: any;
  hireRate?: number;
  poNumber?: string;
  type?: string;
}
