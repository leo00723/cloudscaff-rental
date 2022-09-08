import { Customer } from './customer.model';
import { User } from './user.model';

export interface Site {
  address?: string;
  city?: string;
  code?: string;
  country?: string;
  customer?: Customer;
  companyId?: string;
  id?: string;
  name?: string;
  suburb?: string;
  totalScaffolds?: number;
  totalInvoices?: number;
  zip?: string;
  startDate?: any;
  endDate?: any;
  status?: string;
  date?: any;
  createdBy?: string;
  updatedBy?: string;
  users?: User[];
  nextInvoiceDate?: any;
  billingCycle?: number;
  billable?: boolean;
}
