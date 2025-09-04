import { Company } from './company.model';
import { Site } from './site.model';
import { TransactionItem } from './transactionItem.model';
import { UploadedFile } from './uploadedFile.model';

export interface Transfer {
  id?: string;
  code?: string;
  fromSite?: Site;
  fromJobReference?: string;
  toSite?: Site;
  toJobReference?: string;
  company?: Company;
  items?: TransactionItem[];
  transferDate?: any;
  date?: any;
  notes?: string;
  status?: string;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  uploads?: UploadedFile[];
}
