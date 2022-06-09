import { RateProfile } from './rate-profiles.model';

export interface HireItem {
  total?: number;
  rate?: RateProfile | string;
  daysStanding?: number;
  isWeeks?: boolean;
}
