import { Company } from './company.model';
import { Customer } from './customer.model';
import { InspectionTemplate } from './invoiceTemplate.model';
import { Scaffold } from './scaffold.model';

export interface Inspection {
  date: any;
  code: string;
  status: string;
  notes: string;
  questions: InspectionTemplate;
  createdBy: string;
  company?: Company;
  customer?: Customer;
  scaffold?: Scaffold;
}
