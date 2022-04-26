import { Company } from './company.model';
import { Handover } from './handover.model';
import { Term } from './term.model';
export interface SharedHandover {
  id: string;
  handover: Handover;
  company: Company;
  terms: Term;
  viewed: boolean;
  approved: boolean;
  cc: string[];
  email: string;
}
