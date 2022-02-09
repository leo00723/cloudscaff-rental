export interface Estimate {
  vat: number;
  total: number;
  siteName: string;
  scaffold: Boards;
  status: string;
  additionals: Additional[];
  date: any;
  company: { [key: string]: string };
  broker: Broker;
  subtotal: number;
  hire: Hire;
  customer: Customer;
  labour: Labour[];
  code: string;
  message: string;
  tax: number;
  boards: Boards[];
  id: string;
}

export interface Additional {
  total: number;
  name: string;
  rate: AdditionalRate;
  qty: string;
  daysStanding: string;
}

export interface AdditionalRate {
  rate: number;
  name: string;
  code: number;
}

export interface Boards {
  width: string;
  qty?: string;
  total: number;
  length: string;
  rate: AdditionalRate;
  height?: string;
}

export interface Broker {
  types: Type[];
  id: string;
  name: string;
}

export interface Type {
  ot1: number;
  nt: string;
  ph: number;
  name: string;
  ot2: number;
}

export interface Customer {
  rep: string;
  zip: string;
  id: string;
  company: string;
  address: string;
  country: string;
  phone: string;
  suburb: string;
  city: string;
  name: string;
  email: string;
}

export interface Hire {
  total: number;
  rate: AdditionalRate;
  daysStanding: string;
}

export interface Labour {
  hours: string;
  qty: string;
  days: string;
  total: number;
  type: Type;
  rate: LabourRate;
}

export interface LabourRate {
  rate: number;
  name: string;
}
