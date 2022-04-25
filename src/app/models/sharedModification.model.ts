import { Company } from './company.model';
import { Modification } from './modification.model';
import { Term } from './term.model';

export interface SharedModification {
  id: string;
  modification: Modification;
  company: Company;
  terms: Term;
  viewed: boolean;
  approved: boolean;
  cc: string[];
  email: string;
}
