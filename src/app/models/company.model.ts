import { UnitData } from './currencies.model';

export interface Terminology {
  scaffold?: string;
  boards?: string;
  hire?: string;
}

export interface Company {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  suburb?: string;
  city?: string;
  zip?: string;
  country?: string;
  bankName?: string;
  accountNum?: string;
  branchCode?: string;
  swiftCode?: string;
  currency?: UnitData;
  terminology?: Terminology;
  totalEstimates?: number;
  totalEnquiries?: number;
  totalBulkEstimates?: number;
  totalInventoryEstimates?: number;
  totalShipments?: number;
  totalInvoices?: number;
  totalTransfers?: number;
  totalRequests?: number;
  totalReturns?: number;
  totalCredits?: number;
  totalSites?: number;
  totalPaymentApplications?: number;
  totalOperationApplications?: number;
  users?: string[];
  vat?: number;
  vatNum?: string;
  salesTax?: number;
  regNumber?: string;
  logoUrl?: string;
  logoRef?: string;
  measurement?: UnitData;
  mass?: UnitData;
  needsSetup?: boolean;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    lastUpdated?: any;
    tenantID?: string;
    tenantName?: string;
  };
  trialEnded?: boolean;
}
