import { UploadedFile } from './uploadedFile.model';

export interface Customer {
  id?: string;
  code?: string;
  name?: string;
  tradingName?: string;

  rep?: string;
  email?: string;
  phone?: string;
  abnNumber?: string;

  officeRep?: string;
  officeEmail?: string;
  officePhone?: string;
  websiteUrl?: string;

  address?: string;
  suburb?: string;
  city?: string;
  zip?: string;
  country?: string;

  discountPercentage?: number;
  minHire?: number;
  poRequired?: boolean;
  billingTerms?: string;

  checklistItems?: any[];

  status?: boolean;

  uploads?: UploadedFile[];

  reps?: { name?: string; phone?: string; email?: string }[];

  vatNum?: string;

  company?: string;
  selected?: boolean;
  xeroID?: string;
  excludeVAT?: boolean;
}
