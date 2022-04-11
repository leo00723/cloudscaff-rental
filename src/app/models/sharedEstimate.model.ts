import { Company } from './company.model';
import { Estimate } from './estimate.model';
import { Term } from './term.model';

export interface SharedEstimate {
  id: string;
  estimate: Estimate;
  company: Company;
  terms: Term;
  viewed: boolean;
  approved: boolean;
  cc: string[];
  email: string;
}
