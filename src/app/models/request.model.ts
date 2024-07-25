import { Company } from './company.model';
import { InventoryItem } from './inventoryItem.model';
import { Site } from './site.model';

export interface Request {
  id?: string;
  code?: string;
  company?: Company;
  createdBy?: string;
  createdByName?: string;
  endDate?: any;
  items?: InventoryItem[];
  site?: Site;
  startDate?: any;
  status?: string;
  updatedBy?: string;
  notes?: string;
}
