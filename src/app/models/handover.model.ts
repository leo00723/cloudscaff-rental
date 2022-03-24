import { Company } from './company.model';
import { Customer } from './customer.model';
import { Scaffold } from './scaffold.model';

export interface Handover {
  date: any;
  code: string;
  status: string;
  notes: string;
  detail: string;
  maxLoad: string;
  createdBy: string;
  company?: Company;
  customer?: Customer;
  scaffold?: Scaffold;
}
