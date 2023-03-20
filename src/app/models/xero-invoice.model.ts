/* eslint-disable @typescript-eslint/naming-convention */
export interface XeroInvoice {
  Id: string;
  Status: string;
  ProviderName: string;
  DateTimeUTC: string;
  Invoices: Invoice[];
}

export interface Invoice {
  Type: string;
  InvoiceID: string;
  InvoiceNumber: string;
  Reference: string;
  Payments: any[];
  CreditNotes: any[];
  Prepayments: any[];
  Overpayments: any[];
  AmountDue: number;
  AmountPaid: number;
  AmountCredited: number;
  CurrencyRate: number;
  IsDiscounted: boolean;
  HasAttachments: boolean;
  InvoiceAddresses: any[];
  HasErrors: boolean;
  InvoicePaymentServices: any[];
  Contact: Contact;
  DateString: string;
  Date: string;
  DueDateString: string;
  DueDate: string;
  BrandingThemeID: string;
  Status: string;
  LineAmountTypes: string;
  LineItems: any[];
  SubTotal: number;
  TotalTax: number;
  Total: number;
  UpdatedDateUTC: string;
  CurrencyCode: string;
}

export interface Contact {
  ContactID: string;
  Name: string;
  Addresses: any[];
  Phones: any[];
  ContactGroups: any[];
  ContactPersons: any[];
  HasValidationErrors: boolean;
}
