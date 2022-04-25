import { Company } from './company.model';
import { Credit } from './credit.model';
import { Term } from './term.model';
export interface SharedCredit {
  id: string;
  credit: Credit;
  company: Company;
  terms: Term;
  viewed: boolean;
  approved: boolean;
  cc: string[];
  email: string;
}
