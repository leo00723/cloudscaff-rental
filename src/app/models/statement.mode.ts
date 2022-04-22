import { Company } from './company.model';
import { Credit } from './credit.model';
import { Customer } from './customer.model';
import { Invoice } from './invoice.model';
import { Payment } from './payment.model';

export interface Statement {
  customer: Customer;
  company: Company;
  invoices: Invoice[];
  payments: Payment[];
  credits: Credit[];
  dates: {
    startDate: any;
    endDate: any;
    date: any;
  };
}
