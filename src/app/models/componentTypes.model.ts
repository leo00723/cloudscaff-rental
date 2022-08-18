import { Company } from './company.model';

export interface ComponentTypes {
  categories: Category[];
  company: Company;
  date: any;
  updatedBy: string;
}

export interface Category {
  name: string;
  items: Item[];
}

export interface Item {
  size: string;
}
