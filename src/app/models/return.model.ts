import { Company } from './company.model';
import { InventoryItem } from './inventoryItem.model';
import { Site } from './site.model';

export interface Return {
  id?: string;
  code?: string;
  company?: Company;
  createdBy?: string;
  date?: any;
  items?: InventoryItem[];
  notes?: string;
  returnDate?: any;
  site?: Site;
  status?: string;
  updatedBy?: string;
}
