export interface HandoverTemplate {
  detail?: string;
  maxLoads?: string[];
  date?: any;
  updatedBy?: string;
  company?: string;
  categories?: {
    name?: string;
    items?: { question?: string; value?: string }[];
  }[];
}
