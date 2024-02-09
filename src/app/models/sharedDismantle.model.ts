import { Company } from './company.model';
import { Handover } from './handover.model';
import { Term } from './term.model';
export interface SharedDismantle {
  id: string;
  dismantle: Handover;
  company: Company;
  terms: Term;
  viewed: boolean;
  approved: boolean;
  cc: string[];
  email: string;
}
