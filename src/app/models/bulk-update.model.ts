import { Company } from './company.model';
import { InventoryItem } from './inventoryItem.model';
import { UploadedFile } from './uploadedFile.model';

export interface BulkUpdate {
  id?: string;
  code?: string;
  company?: Company;
  createdBy?: string;
  createdByName?: string;
  items?: InventoryItem[];
  date?: any;
  status?: string;
  updatedBy?: string;
  notes?: string;
  uploads?: UploadedFile[];
  type?: string;
}
