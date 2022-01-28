import { CurrencyData } from './currencies.model';

export interface Terminology {
  scaffold: string;
  boards: string;
  hire: string;
}
export interface Company {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  suburb: string;
  city: string;
  zip: string;
  country: string;
  bankName: string;
  accountNum: string;
  branchCode: string;
  swiftCode: string;
  currency: CurrencyData;
  terminology: Terminology;
}
