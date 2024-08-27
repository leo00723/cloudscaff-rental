import { Comment } from './comment.model';
import { Company } from './company.model';
import { Customer } from './customer.model';
import { InventoryItem } from './inventoryItem.model';
import { UploadedFile } from './uploadedFile.model';

export interface InventoryEstimateSell {
  id?: string;
  code?: string;
  company?: Company;
  customer?: Customer;
  date?: any;
  discount?: number;
  discountPercentage?: number;
  items?: InventoryItem[];
  scope?: string;
  siteName?: string;
  status?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  vat?: number;
  createdBy?: string;
  createdByName?: string;
  acceptedTerms?: boolean;
  comments?: Comment[];
  excludeVAT?: boolean;
  uploads?: UploadedFile[];
}
