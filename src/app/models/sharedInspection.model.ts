import { Company } from './company.model';
import { Inspection } from './inspection.model';
import { Term } from './term.model';
export interface SharedInspection {
  id: string;
  inspection: Inspection;
  company: Company;
  terms: Term;
  viewed: boolean;
  approved: boolean;
  cc: string[];
  email: string;
}
