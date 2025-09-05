import { UploadedFile } from './uploadedFile.model';

export interface Customer {
  id?: string;
  name?: string;
  tradingName?: string;
  abnNo?: string;

  rep?: string;
  email?: string;
  phone?: string;

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

  status?: boolean;

  uploads?: UploadedFile[];

  reps?: { name?: string; phone?: string; email?: string }[];

  regNumber?: string;
  vatNum?: string;

  company?: string;
  selected?: boolean;
  xeroID?: string;
  excludeVAT?: boolean;
}
