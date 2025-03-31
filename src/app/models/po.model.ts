import { EstimateV2 } from './estimate-v2.model';
import { InventoryEstimateRent } from './inventory-estimate-rent.model';
import { Site } from './site.model';

export interface PO {
  id?: string;
  site?: Site;
  estimate?: EstimateV2 | InventoryEstimateRent;
  date?: any;
  createdBy?: string;
  createdByName?: string;
  poNumber?: string;
  code?: string;
  discount?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
  vat?: number;
  status?: string;
  type?: string;
  customInvoice?: boolean;
  mixedInvoice?: boolean;
}
