import { Invoice } from './invoice.model';

export interface Payment {
  id?: string;
  customer?: string;
  customerId?: string;
  date?: any;
  email?: string;
  estimateId?: string;
  invoice?: Invoice;
  invoiceCode?: string;
  invoiceId?: string;
  scaffoldId?: string;
  siteId?: string;
  total?: number;
}
