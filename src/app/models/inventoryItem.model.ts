import { Category } from './componentTypes.model';

export interface InventoryItem {
  id?: string;
  availableQty?: number;
  calculatedAvailableQty?: number;
  category?: string;
  categoryType?: Category;
  checked?: boolean;
  code?: string;
  damagedQty?: number;
  deficit?: number;
  error?: boolean;
  hireCost?: number;
  inMaintenanceQty?: number;
  inUseQty?: number;
  location?: string;
  log?: any[];
  lostQty?: number;
  resizedQty?: number;
  lowLevel?: number;
  lowPercentage?: number;
  name?: string;
  overageBalanceQty?: number;
  replacementCost?: number;
  reservedQty?: number;
  returnQty?: number;
  reversedQty?: number;
  sellQty?: number;
  sellingCost?: number;
  shipmentQty?: number;
  orderQty?: number;
  deliveredQty?: number;
  size?: string;
  totalCost?: number;
  weight?: number;
  yardQty?: number;

  storageQty?: number;
  storageType?: string;

  hasMetaUpdate?: boolean;

  // New tracking fields
  totalDelivered?: number;
  totalReturned?: number;
  totalTransferredIn?: number;
  totalTransferredOut?: number;
  totalOverages?: number;
  lastMovementDate?: any;
  lastMovementType?: string;

  type?: string;
  supplier?: string;
  duration?: number;
  forInvoice?: boolean;
  total?: number;
}
