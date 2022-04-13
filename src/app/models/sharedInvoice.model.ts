import { Company } from './company.model';
import { Invoice } from './invoice.model';
import { Term } from './term.model';
export interface SharedInvoice {
  id: string;
  invoice: Invoice;
  company: Company;
  terms: Term;
  viewed: boolean;
  approved: boolean;
  cc: string[];
  email: string;
}
