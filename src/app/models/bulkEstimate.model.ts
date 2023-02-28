import { Budget } from './budget.model';
import { Company } from './company.model';
import { Customer } from './customer.model';
import { Estimate } from './estimate.model';

export interface BulkEstimate {
  code: string;
  company: Company;
  customer: Customer;
  date: any;
  discount: number;
  discountPercentage: number;
  estimates: Estimate[];
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
  revision?: number;
  type?: string;
}
