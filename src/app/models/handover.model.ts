import { Company } from './company.model';
import { Customer } from './customer.model';
import { Scaffold } from './scaffold.model';

export interface Handover {
  id?: string;
  date?: any;
  code?: string;
  status?: string;
  notes?: string;
  detail?: string;
  maxLoad?: string;
  createdBy?: string;
  createdByName?: string;
  safe?: string;
  company?: Company;
  customer?: Customer;
  scaffold?: Scaffold;
  signature?: string;
  signatureRef?: string;
  signedBy?: string;
  type?: string;
}
