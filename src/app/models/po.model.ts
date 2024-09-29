import { EstimateV2 } from './estimate-v2.model';
import { Site } from './site.model';

export interface PO {
  id?: string;
  site?: Site;
  estimate?: EstimateV2;
  date?: any;
  createdBy?: string;
  createdByName?: string;
  poNumber?: string;
  code?: string;
  discount?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
  vat?: number;
  status?: string;
}
