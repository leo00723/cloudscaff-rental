import { UnitData } from './currencies.model';

export interface Terminology {
  scaffold?: string;
  boards?: string;
  hire?: string;
}

export interface Company {
  id?: string;
  accountNum?: string;
  address?: string;
  bankName?: string;
  branchCode?: string;
  city?: string;
  country?: string;
  currency?: UnitData;
  email?: string;
  gst?: boolean;
  logoRef?: string;
  logoUrl?: string;
  mass?: UnitData;
  measurement?: UnitData;
  name?: string;
  needsSetup?: boolean;
  phone?: string;
  regNumber?: string;
  removeBilling?: boolean;
  removeBranding?: boolean;
  replaceBranding?: string;
  salesTax?: number;
  suburb?: string;
  swiftCode?: string;
  terminology?: Terminology;
  totalBulkEstimates?: number;
  totalCredits?: number;
  totalDismantles?: number;
  totalEnquiries?: number;
  totalEstimates?: number;
  totalHandovers?: number;
  totalInspections?: number;
  totalInventoryEstimates?: number;
  totalInvoices?: number;
  totalOperationApplications?: number;
  totalPaymentApplications?: number;
  totalRequests?: number;
  totalReturns?: number;
  totalShipments?: number;
  totalSites?: number;
  totalTransfers?: number;
  trialEnded?: boolean;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    lastUpdated?: any;
    tenantID?: string;
    tenantName?: string;
  };
  userLimit?: number;
  users?: string[];
  vat?: number;
  vatNum?: string;
  zip?: string;
}
