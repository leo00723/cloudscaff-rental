import { RateProfile } from './rate-profiles.model';

export interface Item {
  type?: string;
  description?: string;
  width?: string;
  qty?: string;
  total?: number;
  length?: string;
  rate?: RateProfile | any;
  height?: string;
  safe?: string;
  level?: number;
  lifts?: number;
  boardedLifts?: number;
  extraHirePercentage?: number;
  extraHire?: number;
  breakdown?: {
    dismantle: {
      length: number;
      width: number;
      height: number;
      type: string;
    }[];
    erection: { length: number; width: number; height: number; type: string }[];
  };
  hireRate?: RateProfile | any;
  daysStanding?: number;
  hireTotal?: number;
  isWeeks?: boolean;
  hireDate?: any;
  handover?: any;
  appliedErectionPercentage?: number;
  erectionValue?: number;
  appliedErectionValue?: number;
  hireEndDate?: any;
  dismantleDate?: any;
  appliedDismantlePercentage?: number;
  dismantleValue?: number;
  appliedDismantleValue?: number;
  extraHireWeeks?: number;
  extraHireCharge?: number;
  grossTotal?: number;
  previousGross?: number;
  currentTotal?: number;
  totalPaid?: number;
  location?: string;
}
