import { InventoryEstimateSell } from './inventory-estimate-sell.model';

export interface SaleInvoice {
  estimate?: InventoryEstimateSell;
  createdBy?: string;
  createdByName?: string;
  jobReference?: string;
  code?: string;
  id?: string;
  date?: any;
  status?: string;
}
