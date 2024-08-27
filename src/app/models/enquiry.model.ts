import { Company } from './company.model';
import { Customer } from './customer.model';
import { UploadedFile } from './uploadedFile.model';

export interface Enquiry {
  code: string;
  company: Company;
  customer: Customer;
  customerName: string;
  date: any;
  returnDate: string;
  id: string;
  message: string;
  siteName: string;
  recievedDate: string;
  status: string;
  address: string;
  city: string;
  suburb: string;
  country: string;
  zip: string;
  createdBy: string;
  createdByName?: string;
  updatedBy: string;
  acceptedBy: string;
  rejectedBy: string;
  upload?: UploadedFile;
  uploads?: UploadedFile[];
  probability?: string;
  type?: string;
}
