import { Customer } from './customer.model';

export interface Site {
  address: string;
  city: string;
  code: string;
  country: string;
  customer: Customer;
  companyId: string;
  id?: string;
  name: string;
  suburb: string;
  totalScaffolds: number;
  zip: string;
  startDate: any;
  endDate: any;
  status: string;
  date: any;
  createdBy: string;
  updatedBy: string;
}
