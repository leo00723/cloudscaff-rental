import { Budget } from './budget.model';
import { Company } from './company.model';
import { Customer } from './customer.model';
import { InventoryEstimate } from './inventoryEstimate.model';

export interface BulkInventoryEstimate {
  code: string;
  company: Company;
  customer: Customer;
  date: any;
  discount: number;
  discountPercentage: number;
  estimates: InventoryEstimate[];
  endDate: any;
  id: string;
  message: string;
  siteName: string;
  startDate: any;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  extraHire: number;
  vat: number;
  poNumber: string;
  woNumber: string;
  siteId: string;
  createdBy: string;
  updatedBy: string;
  acceptedBy: string;
  rejectedBy: string;
  budget?: Budget;
  acceptedTerms?: boolean;
  enquiryId: string;
  type?: string;
  excludeVAT?: boolean;
}
