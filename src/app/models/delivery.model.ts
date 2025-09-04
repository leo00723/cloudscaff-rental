import { Company } from './company.model';
import { InventoryItem } from './inventoryItem.model';
import { Site } from './site.model';
import { UploadedFile } from './uploadedFile.model';

export interface Delivery {
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
  date?: any;
  uploads?: UploadedFile[];
  notes?: string;
  driverName?: string;
  driverNo?: string;
  vehicleReg?: string;
  signedBy?: string;
  signature?: string;
  signatureRef?: string;
  signedBy2?: string;
  signature2?: string;
  signatureRef2?: string;
  jobReference?: string;
  companyRepName?: string;
  companyRepEmail?: string;
  companyRepContact?: string;
  customerRepName?: string;
  customerRepEmail?: string;
  customerRepContact?: string;
}
