import { Company } from './company.model';
import { Customer } from './customer.model';
import { Item } from './item.model';
import { Signature } from './signature.model';
import { Site } from './site.model';
import { UploadedFile } from './uploadedFile.model';

export interface SI {
  id?: string;
  additionals?: Item[];
  attachments?: Item[];
  boards?: Item[];
  code?: string;
  company?: Company;
  createdBy?: string;
  createdByName?: string;
  customer?: Customer;
  date?: any;
  detail?: string;
  notes?: string;
  signatures?: Signature[];
  site?: Site;
  status?: string;
  uploads?: UploadedFile[];
  scaffoldIDs?: string[];
}
