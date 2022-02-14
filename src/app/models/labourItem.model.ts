import { Labour } from './labour.model';

export interface LabourItem {
  hours: string;
  qty: string;
  days: string;
  total: number;
  type: Labour;
  rate: LabourRate;
}

export interface LabourRate {
  rate: number;
  name: string;
}
