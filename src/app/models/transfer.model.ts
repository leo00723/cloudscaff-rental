import { Company } from './company.model';
import { InventoryItem } from './inventoryItem.model';
import { Site } from './site.model';
import { UploadedFile } from './uploadedFile.model';

export interface Transfer {
  id?: string;
  code?: string;
  fromSite?: Site;
  toSite?: Site;
  company?: Company;
  items?: InventoryItem[];
  transferDate?: any;
  date?: any;
  notes?: string;
  status?: string;
  createdBy?: string;
  updatedBy?: string;
  uploads?: UploadedFile[];
}
