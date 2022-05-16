import { Company } from './company.model';
import { Customer } from './customer.model';
import { InventoryItem } from './inventoryItem.model';
import { Site } from './site.model';

export interface Shipment {
  id?: string;
  code?: string;
  startDate?: any;
  endDate?: any;
  items?: InventoryItem[];
  site?: Site;
  company?: Company;
  status?: string;
  createdBy?: string;
  updatedBy?: string;
}
