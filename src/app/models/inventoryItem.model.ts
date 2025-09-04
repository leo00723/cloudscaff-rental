import { Category } from './componentTypes.model';
import { UploadedFile } from './uploadedFile.model';

export interface CrossHire {
  company?: string;
  qty?: number;
  notes?: string;
  date?: any;
}
export interface InventoryItem {
  id?: string;
  code?: string;
  categoryType?: Category;
  category?: string;
  size?: string;
  name?: string;
  location?: string;
  hireCost?: number;
  replacementCost?: number;
  sellingCost?: number;
  weight?: number;
  availableQty?: number;
  yardQty?: number;
  crossHireQty?: number;
  inUseQty?: number;
  inMaintenanceQty?: number;
  damagedQty?: number;
  lostQty?: number;
  shipmentQty?: number;
  reservedQty?: number;
  reversedQty?: number;
  overageBalanceQty?: number;
  returnQty?: number;
  crossHire?: CrossHire[];
  sellQty?: number;
  error?: boolean;
  totalCost?: number;
  log?: any[];
  checked?: boolean;
  deficit?: number;
  duration?: number;
  uploads?: UploadedFile[];
  forInvoice?: boolean;
  total?: number;
  calculatedAvailableQty?: number;
  supplier?: string;
}
