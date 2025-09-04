import { Handover } from './handover.model';
import { Inspection } from './inspection.model';
import { Item } from './item.model';
import { User } from './user.model';

export interface Scaffold {
  id?: string;
  attachments?: Item[];
  boards?: Item[];
  code?: string;
  companyId?: string;
  createdBy?: string;
  createdByName?: string;
  customerId?: string;
  date?: any;
  endDate?: any;
  latestHandover?: Handover;
  latestInspection?: Inspection;
  jobReference?: string;
  scaffold?: Item;
  siIDS?: string[];
  siteCode?: string;
  siteId?: string;
  siteName?: string;
  startDate?: any;
  status?: string;
  totalArea?: number;
  totalModifications?: number;
  totalPlatforms?: number;
  updatedBy?: string;
  users?: User[];
  woNumber?: string;
}
