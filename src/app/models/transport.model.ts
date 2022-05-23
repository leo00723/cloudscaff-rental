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
  rate?: number;
  hours?: string;
  qty?: string;
  days?: string;
  total?: number;
  type?: TransportType;
}
