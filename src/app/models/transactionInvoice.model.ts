import { EstimateV2 } from './estimate-v2.model';
import { Site } from './site.model';
import { TransactionItem } from './transactionItem.model';

export interface TransactionInvoice {
  id?: string;
  site?: Site;
  estimate?: EstimateV2;
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
  excludeVAT?: boolean;
  endDate?: any;
  days?: number;
  months?: number;
  status?: string;
  items?: TransactionItem[];
  creditItems?: { description: string; total: number }[];
  creditTotal?: number;
}
