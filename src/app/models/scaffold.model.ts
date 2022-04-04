import { AdditionalItem } from './additionalItem.model';
import { HireItem } from './hireItem.model';
import { Item } from './item.model';
import { LabourItem } from './labourItem.model';
import { User } from './user.model';

export interface Scaffold {
  id?: string;
  code?: string;
  date?: any;
  companyId?: string;
  customerId?: string;
  siteId?: string;
  siteCode?: string;
  createdBy?: string;
  scaffold?: Item;
  attachments?: Item[];
  boards?: Item[];
  hire?: HireItem;
  labour?: LabourItem[];
  additionals?: AdditionalItem[];
  poNumber?: string;
  woNumber?: string;
  updatedBy?: string;
  startDate?: any;
  endDate?: any;
  status?: string;
  users?: User[];
  totalInspections?: number;
  totalHandovers?: number;
  totalModifications?: number;
  totalInvoices?: number;
}
