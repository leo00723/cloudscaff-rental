import { RateProfile } from './rate-profiles.model';

export interface HireItem {
  total: number;
  rate: RateProfile;
  daysStanding: string;
}
