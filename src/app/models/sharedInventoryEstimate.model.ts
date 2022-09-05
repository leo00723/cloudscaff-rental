import { BulkInventoryEstimate } from './bulkInventoryEstimate.model';
import { Company } from './company.model';
import { Term } from './term.model';

export interface SharedInventoryEstimate {
  id: string;
  inventoryEstimate: BulkInventoryEstimate;
  company: Company;
  terms: Term;
  viewed: boolean;
  approved: boolean;
  cc: string[];
  email: string;
}
