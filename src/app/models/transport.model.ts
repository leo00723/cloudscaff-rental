export class TransportType {
  maxLoad?: number;
  name?: string;
  rate?: number;
}
export interface Transport {
  id?: string;
  name?: string;
  types?: TransportType[];
}
export interface TransportItem {
  hours?: string;
  qty?: string;
  days?: string;
  extraHirePercentage?: number;
  extraHire?: number;
  total?: number;
  type?: TransportType;
  grossTotal?: number;
  previousGross?: number;
  currentTotal?: number;
  totalPaid?: number;
}
