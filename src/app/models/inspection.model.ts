import { Company } from './company.model';
import { Customer } from './customer.model';
import { InspectionTemplate } from './invoiceTemplate.model';
import { Scaffold } from './scaffold.model';
import { UploadedFile } from './uploadedFile.model';

export interface Inspection {
  id?: string;
  date?: any;
  code?: string;
  status?: string;
  notes?: string;
  questions?: InspectionTemplate;
  createdBy?: string;
  company?: Company;
  customer?: Customer;
  scaffold?: Scaffold;
  uploads?: UploadedFile[];
}
