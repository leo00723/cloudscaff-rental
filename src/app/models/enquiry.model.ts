import { Company } from './company.model';
import { Customer } from './customer.model';

export interface Enquiry {
  code: string;
  company: Company;
  customer: Customer;
  date: any;
  returnDate: any;
  id: string;
  message: string;
  siteName: string;
  recievedDate: any;
  status: string;
  estimateId: string;
  estimateCode: string;
  address: string;
  city: string;
  suburb: string;
  country: string;
  zip: string;
  createdBy: string;
  updatedBy: string;
  acceptedBy: string;
  rejectedBy: string;
}
