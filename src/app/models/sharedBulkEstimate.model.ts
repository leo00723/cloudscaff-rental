import { BulkEstimate } from './bulkEstimate.model';
import { Company } from './company.model';
import { Term } from './term.model';

export interface SharedBulkEstimate {
  id: string;
  bulkEstimate: BulkEstimate;
  company: Company;
  terms: Term;
  viewed: boolean;
  approved: boolean;
  cc: string[];
  email: string;
}
