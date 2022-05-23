export class TransportItem {
  maxLoad?: number;
  name?: string;
  rate?: number;
}
export interface Transport {
  id?: string;
  name?: string;
  types?: TransportItem[];
}
