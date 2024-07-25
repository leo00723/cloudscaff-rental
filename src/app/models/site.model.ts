import { Customer } from './customer.model';
import { UploadedFile } from './uploadedFile.model';
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
  previousGross?: number;
  uploads?: UploadedFile[];
  userIDS?: string[];
}
