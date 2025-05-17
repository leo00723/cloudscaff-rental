import { Company } from './company.model';
import { InventoryItem } from './inventoryItem.model';
import { Site } from './site.model';
import { TransactionItem } from './transactionItem.model';
import { UploadedFile } from './uploadedFile.model';

export interface TransactionReturn {
  id?: string;
  itemId?: string;
  code?: string;
  company?: Company;
  createdBy?: string;
  createdByName?: string;
  date?: any;
  items?: TransactionItem[];
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
  signedBy2?: string;
  signature2?: string;
  signatureRef2?: string;
  poNumber?: string;
  overageItems?: InventoryItem[];
}
