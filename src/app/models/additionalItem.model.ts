import { RateProfile } from './rate-profiles.model';

export interface AdditionalItem {
  total: number;
  name: string;
  rate: RateProfile;
  qty: string;
  daysStanding: string;
}
