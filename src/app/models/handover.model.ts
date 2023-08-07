import { Company } from './company.model';
import { Customer } from './customer.model';
import { HandoverTemplate } from './handoverTemplate.model';
import { Scaffold } from './scaffold.model';
import { UploadedFile } from './uploadedFile.model';

export interface Handover {
  id?: string;
  date?: any;
  code?: string;
  status?: string;
  notes?: string;
  detail?: string;
  maxLoad?: string;
  createdBy?: string;
  createdByName?: string;
  safe?: string;
  company?: Company;
  customer?: Customer;
  scaffold?: Scaffold;
  signature?: string;
  signatureRef?: string;
  signedBy?: string;
  type?: string;
  erectPercentage?: number;
  dismantlePercentage?: number;
  uploads?: UploadedFile[];
  questions?: HandoverTemplate;
}
