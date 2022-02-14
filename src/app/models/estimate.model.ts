import { AdditionalItem } from './additionalItem.model';
import { Customer } from './customer.model';
import { HireItem } from './hireItem.model';
import { Item } from './item.model';
import { LabourBroker } from './labour-broker.model';
import { LabourItem } from './labourItem.model';

export interface Estimate {
  vat: number;
  total: number;
  siteName: string;
  scaffold: Item;
  status: string;
  additionals: AdditionalItem[];
  date: any;
  company: { [key: string]: string };
  broker: LabourBroker;
  subtotal: number;
  hire: HireItem;
  customer: Customer;
  labour: LabourItem[];
  code: string;
  message: string;
  tax: number;
  boards: Item[];
  id: string;
  discountPercentage: number;
}
