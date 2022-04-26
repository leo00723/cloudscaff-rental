import { Company } from './company.model';
import { Statement } from './statement.mode';
import { Term } from './term.model';
export interface SharedStatement {
  id: string;
  statement: Statement;
  company: Company;
  terms: Term;
  viewed: boolean;
  approved: boolean;
  cc: string[];
  email: string;
}
