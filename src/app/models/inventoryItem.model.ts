import { Category } from './componentTypes.model';

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
  inService?: boolean;
  crossHire?: CrossHire[];
  error?: boolean;
  totalCost?: number;
  log?: any[];
  checked?: boolean;
  deficit?: number;
}
