import { RateProfile } from './rate-profiles.model';

export interface Item {
  width?: string;
  qty?: string;
  total?: number;
  length?: string;
  rate?: RateProfile;
  height?: string;
  safe?: string;
  level?: string;
}
