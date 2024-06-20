import { Company } from './company.model';
import { InventoryItem } from './inventoryItem.model';
import { Site } from './site.model';
import { UploadedFile } from './uploadedFile.model';

export interface Return {
  id?: string;
  code?: string;
  company?: Company;
  createdBy?: string;
  createdByName?: string;
  date?: any;
  items?: InventoryItem[];
  notes?: string;
  returnDate?: any;
  site?: Site;
  status?: string;
  updatedBy?: string;
  uploads?: UploadedFile[];
  driverName?: string;
  driverNo?: string;
  vehicleReg?: string;
  signedBy?: string;
  signature?: string;
  signatureRef?: string;
}
