import { Company } from './company.model';
import { CreditItem } from './creditItem.model';
import { Customer } from './customer.model';

export interface Credit {
  additionals: CreditItem[];
  code: string;
  company: Company;
  customer: Customer;
  date: any;
  discount: number;
  discountPercentage: number;
  endDate: any;
  id: string;
  message: string;
  siteName: string;
  startDate: any;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  vat: number;
  poNumber: string;
  woNumber: string;
  siteId: string;
  createdBy: string;
  updatedBy: string;
  acceptedBy: string;
  rejectedBy: string;
}
