import { RateProfile } from './rate-profiles.model';

export interface AdditionalItem {
  total?: number;
  name?: string;
  rate?: RateProfile;
  qty?: string;
  daysStanding?: string;
  code?: string;
  unit?: string;
  discount?: number;
  discountPercentage?: number;
  extraHirePercentage?: number;
  extraHire?: number;
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
}
