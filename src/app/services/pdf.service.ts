/* eslint-disable max-len */
import { DatePipe, DecimalPipe } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Platform } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Term } from 'src/app/models/term.model';
import { environment } from 'src/environments/environment';
import { DateDiffPipe } from '../components/dateDiff.pipe';
import { WeightPipe } from '../components/weight.pipe';
import { Delivery } from '../models/delivery.model';
import { EstimateV2 } from '../models/estimate-v2.model';
import { Handover } from '../models/handover.model';
import { Inspection } from '../models/inspection.model';
import { InventoryEstimateRent } from '../models/inventory-estimate-rent.model';
import { InventoryEstimateSell } from '../models/inventory-estimate-sell.model';
import { InventoryItem } from '../models/inventoryItem.model';
import { SaleInvoice } from '../models/sale-invoice.model';
import { Site } from '../models/site.model';
import { TransactionInvoice } from '../models/transactionInvoice.model';
import { TransactionItem } from '../models/transactionItem.model';
import { TransactionReturn } from '../models/transactionReturn.model';
import { UploadedFile } from '../models/uploadedFile.model';
import { CompanyState } from '../shared/company/company.state';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { CalculatePipe } from '../components/calculate.pipe';
import { Transfer } from '../models/transfer.model';
import { DateFormatPipe } from '../components/date-format.pipe';

// Configure the fonts
(pdfMake as any).vfs = pdfFonts.vfs;

const footerlogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 388.58 26.87"><defs><style>.cls-1{fill:#ff881a;}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Logo-Full"><g id="Logo-Full-2" data-name="Logo-Full"><path class="cls-1" d="M151.2.19a2.08,2.08,0,0,1,2.09,2.09h0V20.57a6.24,6.24,0,0,1-6.24,6.24H123.93a6.24,6.24,0,0,1-6.24-6.24V2.22a2.1,2.1,0,0,1,2.09-2.1h0a2.1,2.1,0,0,1,2.1,2.1h0V20.55a2.1,2.1,0,0,0,2.09,2.1h23.09a2.11,2.11,0,0,0,2.1-2.1V2.28A2.09,2.09,0,0,1,151.24.19Z"/><path class="cls-1" d="M270.91,24.78a2.1,2.1,0,0,1-2.09,2.09H241.5a6.24,6.24,0,0,1-6.24-6.24V6.42A6.24,6.24,0,0,1,241.5.18h27.38A2.09,2.09,0,0,1,271,2.27h0a2.09,2.09,0,0,1-2.09,2.1H241.5a2.08,2.08,0,0,0-2.09,2.06h0V20.59a2.1,2.1,0,0,0,2.1,2.09h27.31a2.1,2.1,0,0,1,2.09,2.1Z"/><path class="cls-1" d="M156.89,0H186.3a6.24,6.24,0,0,1,6.24,6.24V20.45a6.24,6.24,0,0,1-6.19,6.29H156.83V22.55H186.3a2.1,2.1,0,0,0,2.09-2.1V6.28a2.1,2.1,0,0,0-2.06-2.13H156.89Z"/><path class="cls-1" d="M317.88,24.79V6.4A2.1,2.1,0,0,1,320,4.3h27.32a2.09,2.09,0,0,0,2.09-2.08h0A2.08,2.08,0,0,0,347.3.13H320a6.24,6.24,0,0,0-6.24,6.24V24.79a2.08,2.08,0,0,0,2.07,2.08h0a2.08,2.08,0,0,0,2.08-2.08Z"/><path class="cls-1" d="M276.6,26.74a2.11,2.11,0,0,1-2.09-2.09V6.36A6.24,6.24,0,0,1,280.75.12h23.14a6.24,6.24,0,0,1,6.23,6.24V24.71A2.09,2.09,0,0,1,308,26.8h0a2.09,2.09,0,0,1-2.09-2.09h0V6.38a2.09,2.09,0,0,0-2.1-2.09h-23a2.09,2.09,0,0,0-2.1,2.09h0V24.65a2.1,2.1,0,0,1-2.09,2.1h0Z"/><rect class="cls-1" x="278.47" y="11.22" width="27.72" height="4.15"/><path class="cls-1" d="M317.21,15.37V11.19h25.85a2.09,2.09,0,0,1,2.09,2.09h0a2.09,2.09,0,0,1-2.09,2.09H317.21Z"/><path class="cls-1" d="M357.09,24.79V6.4a2.11,2.11,0,0,1,2.09-2.1H386.5a2.08,2.08,0,0,0,2.08-2.08h0A2.08,2.08,0,0,0,386.51.13H359.17a6.24,6.24,0,0,0-6.24,6.24V24.79A2.08,2.08,0,0,0,355,26.87h0a2.08,2.08,0,0,0,2.07-2.08Z"/><path class="cls-1" d="M356.42,15.37V11.19h25.85a2.09,2.09,0,0,1,2.1,2.09h0a2.09,2.09,0,0,1-2.1,2.09Z"/><path class="cls-1" d="M208.33,11.19h17.16a6.23,6.23,0,0,1,6.24,6.23v3.12a6.24,6.24,0,0,1-6.19,6.29h-27.4a2.09,2.09,0,0,1-2.09-2.1h0a2.09,2.09,0,0,1,2.09-2.09h27.38a2.1,2.1,0,0,0,2.08-2.1V17.42a2.07,2.07,0,0,0-2.07-2.09h-17.2Z"/><path class="cls-1" d="M219.48,15.37H202.31a6.24,6.24,0,0,1-6.24-6.23V6.42A6.24,6.24,0,0,1,202.31.18h27.38a2.09,2.09,0,0,1,2.09,2.09h0a2.09,2.09,0,0,1-2.09,2.1H202.28a2.09,2.09,0,0,0-2.08,2.09V9.14a2.08,2.08,0,0,0,2.08,2.09h17.16Z"/><rect class="cls-1" x="156.89" y="4.19" width="4.16" height="18.36"/><path class="cls-1" d="M96.38,26.87H84.79a6.24,6.24,0,0,1-6.24-6.24V6.42A6.24,6.24,0,0,1,84.79.18H96.38V4.37H84.79a2.07,2.07,0,0,0-2.07,2.09h0V20.63a2.08,2.08,0,0,0,2.07,2.05H96.38Z"/><path class="cls-1" d="M96.25.13h11.59a6.24,6.24,0,0,1,6.24,6.24V20.59a6.24,6.24,0,0,1-6.2,6.28H96.25V22.68h11.59a2.1,2.1,0,0,0,2.09-2.09V6.42a2.1,2.1,0,0,0-2.09-2.1H96.25Z"/><path class="cls-1" d="M43.47,2.21v18.4a2.1,2.1,0,0,0,2.11,2.08H72.69a2.1,2.1,0,0,1,2.09,2.1h0a2.09,2.09,0,0,1-2.09,2.08H45.58a6.24,6.24,0,0,1-6.24-6.24V2.21A2.08,2.08,0,0,1,41.42.13h0A2.07,2.07,0,0,1,43.47,2.21Z"/><path class="cls-1" d="M35.65,24.78a2.09,2.09,0,0,1-2.09,2.09H6.24A6.24,6.24,0,0,1,0,20.63V6.42A6.24,6.24,0,0,1,6.24.18H33.62a2.1,2.1,0,0,1,2.09,2.09h0a2.1,2.1,0,0,1-2.09,2.1H6.24A2.08,2.08,0,0,0,4.16,6.44h0V20.59a2.1,2.1,0,0,0,2.1,2.09h27.3a2.1,2.1,0,0,1,2.09,2.1Z"/></g></g></g></svg>`;
const hr = {
  table: {
    widths: ['100%'],
    body: [[''], ['']],
  },
  layout: {
    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 1),
    hLineColor: (i, node) =>
      i === 0 || i === node.table.body.length ? 'white' : '#c2c2c2',
    vLineWidth: (i, node) => 0,

    vLineColor: (i, node) => 'white',
    paddingTop: (i, node) => 4,
    paddingBottom: (i, node) => 4,
  },
};
const tLayout = {
  hLineWidth: () => 0.8,
  hLineColor: () => '#dcdcdc',
  vLineWidth: () => 0.8,
  vLineColor: () => '#dcdcdc',
  paddingLeft: () => 8,
  paddingRight: () => 8,
  paddingTop: () => 7,
  paddingBottom: () => 7,
  fillColor: (i) => (i === 0 ? '#f3f3f3' : 'white'),
};
const invoiceTheme = {
  accent: '#ff881a',
  border: '#dcdcdc',
  muted: '#6f6f76',
  panel: '#f7f7f7',
  text: '#30313a',
};
const invoiceTableLayout = {
  hLineWidth: () => 0.8,
  hLineColor: () => invoiceTheme.border,
  vLineWidth: () => 0.8,
  vLineColor: () => invoiceTheme.border,
  paddingLeft: () => 8,
  paddingRight: () => 8,
  paddingTop: () => 7,
  paddingBottom: () => 7,
  fillColor: (i) => (i === 0 ? '#f3f3f3' : 'white'),
};
const stylesCS = {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 0],
  },
  h2: {
    fontSize: 16,
    bold: true,
    margin: [0, 0, 0, 0],
  },

  h3: {
    bold: true,
    fontSize: 14,
  },
  h4: {
    fontSize: 10,
  },
  h5: {
    fontSize: 9,
  },
  h4b: {
    bold: true,
    fontSize: 10,
  },
  h5b: {
    bold: true,
    fontSize: 9,
  },
  h5G: {
    fontSize: 9,
    color: 'grey',
  },
  h5bG: {
    bold: true,
    fontSize: 9,
    color: 'grey',
  },
  h6: {
    fontSize: 8,
  },
  h6b: {
    bold: true,
    fontSize: 8,
  },
  h6G: {
    fontSize: 8,
    color: 'grey',
  },
  h6bG: {
    bold: true,
    fontSize: 8,
    color: 'grey',
  },
  custom: {
    bold: true,
    fontSize: 6,
  },
  tableExample: {
    margin: [0, 0, 0, 0],
  },
  i: {
    italics: true,
    color: '#555',
  },
  m10: {
    margin: [0, 10, 0, 5],
  },
  m20: {
    margin: [0, 20, 0, 5],
  },
  mb5: {
    margin: [0, 0, 0, 15],
  },
  ml20: {
    margin: [20, 0, 0, 0],
  },
  invoiceTitle: {
    fontSize: 24,
    bold: true,
    color: invoiceTheme.text,
    letterSpacing: 1,
  },
  invoiceLabel: {
    fontSize: 9,
    bold: true,
    color: invoiceTheme.muted,
  },
  invoiceValue: {
    fontSize: 10,
    color: invoiceTheme.text,
  },
  invoiceSectionTitle: {
    fontSize: 10,
    bold: true,
    color: invoiceTheme.text,
    lineHeight: 1,
  },
  invoicePartyLabel: {
    fontSize: 9,
    bold: true,
    color: invoiceTheme.muted,
    margin: [0, 0, 0, 6],
  },
  invoicePartyTitle: {
    fontSize: 13,
    bold: true,
    color: invoiceTheme.text,
    margin: [0, 0, 0, 4],
  },
  invoiceSmall: {
    fontSize: 9,
    color: invoiceTheme.text,
  },
  invoiceSmallBold: {
    fontSize: 9,
    bold: true,
    color: invoiceTheme.text,
  },
  invoiceMuted: {
    fontSize: 8,
    color: invoiceTheme.muted,
  },
  invoiceSummaryLabel: {
    fontSize: 10,
    color: invoiceTheme.text,
  },
  invoiceSummaryValue: {
    fontSize: 10,
    bold: true,
    color: invoiceTheme.text,
  },
  invoiceTotalLabel: {
    fontSize: 12,
    bold: true,
    color: invoiceTheme.text,
  },
  invoiceTotalValue: {
    fontSize: 14,
    bold: true,
    color: invoiceTheme.text,
  },
  invoiceFooter: {
    fontSize: 9,
    color: invoiceTheme.muted,
  },
};
const defaultCS = {
  fontSize: 8,
  lineHeight: 1.5,
  color: 'black',
  // alignment: 'justify'
};

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private store = inject(Store);
  constructor(
    private calcPipe: CalculatePipe,
    private dateDiffPipe: DateDiffPipe,
    private dateFormatPipe: DateFormatPipe,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private weightPipe: WeightPipe,
    private platformService: Platform,
    private fileOpenerService: FileOpener,
  ) {}

  async handlePdf(pdf: any, filename: string) {
    if (this.platformService.is('cordova')) {
      pdf.getBase64(async (data) => {
        try {
          const path = `${filename}.pdf`;
          const result = await Filesystem.writeFile({
            path,
            data,
            directory: Directory.Data,
          });
          this.fileOpenerService.open(`${result.uri}`, 'application/pdf');
          return true;
        } catch (e) {
          console.error('Unable to write file', e);
          return false;
        }
      });
    } else if (!this.platformService.is('iphone')) {
      if (environment.production) {
        pdf.download(filename);
      } else {
        pdf.open();
      }

      return true;
    } else if (this.platformService.is('mobileweb')) {
      pdf.download(filename);
    } else {
      return false;
    }
  }

  // ESTIMATE BASIC PDF
  async basicEstimate(
    estimate: EstimateV2,
    company: Company,
    terms: Term | null,
  ) {
    const items = [];
    estimate.items.forEach((item, i) => {
      items.push(this.addEstimateItem(i, company, item));
    });

    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            {
              text: 'Item Code',
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: 'Description',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Unit', style: 'h4b', alignment: 'center' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Duration / Months', style: 'h4b', alignment: 'center' },
            { text: 'Rent / Months', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
    };

    const data = {
      header: this.getPageNumbers(),
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Quotation-${estimate.code}`),
      content: [
        await this.getBillingHeader(
          'Quotation',
          estimate.code,
          `${estimate.code} - ${estimate.siteName}`,
          estimate.date,
          company,
          '',
          [],
        ),
        hr,
        this.getCompanyInfo(estimate.customer, company),
        hr,
        { text: estimate.scope },
        hr,
        summary,
        hr,
        { text: 'Note: Rental Manpower', style: 'h4b' },
        { text: estimate.note1 },
        { text: 'Note: Rental Material', style: 'h4b' },
        { text: estimate.note2 },
        hr,
        {
          table: {
            widths: ['*', '*', '*', '*'],

            body: [
              [
                {
                  text: 'Banking Details',
                  style: ['h4b'],
                  alignment: 'left',
                },
                '',
                '',
                {
                  text: 'Total Amount',
                  style: ['h4b'],
                  alignment: 'right',
                },
              ],
              [
                { text: 'Bank Name:', style: 'h6b', alignment: 'left' },
                { text: company.bankName, alignment: 'left' },
                {
                  text: 'Subtotal:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    estimate.subtotal,
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Beneficiary:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount (${estimate.discountPercentage}%):`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    estimate.discount,
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                { text: 'Account No:', style: 'h6b', alignment: 'left' },
                { text: `${company.accountNum}`, alignment: 'left' },
                {
                  text: `Contract Total:`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    estimate.subtotal - estimate.discount,
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                {
                  text: company.branchCode ? 'BSB:' : '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: company.branchCode ? company.branchCode : '',
                  alignment: 'left',
                },
                {
                  text:
                    company.vat > 0
                      ? `${company?.gst ? 'GST' : 'VAT'} (${company.vat}%):`
                      : company.salesTax > 0
                        ? `Tax (${company.salesTax}%):`
                        : '',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text:
                    company.vat > 0
                      ? `${company.currency.symbol} ${this.format(
                          estimate.vat,
                        )}`
                      : company.salesTax > 0
                        ? `${company.currency.symbol} ${this.format(
                            estimate.tax,
                          )}`
                        : '',

                  alignment: 'right',
                  style: ['h6b', 'mt5'],
                },
              ],
              [
                {
                  text: company.swiftCode ? 'SWIFT / BIC Code:' : '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: company.swiftCode ? company.swiftCode : '',
                  alignment: 'left',
                },
                {
                  text: 'Grand Total:',
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    estimate.total,
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
              ],
              // [
              //   {
              //     text: 'Grand Total in words:',
              //     style: 'h4b',
              //     alignment: 'right',
              //     colSpan: 3,
              //   },
              //   '',
              //   '',
              //   {
              //     text: this.numberToWords(estimate.total),
              //     style: 'h4b',
              //   },
              // ],
            ],
          },
          layout: 'noBorders',
        },
        await this.addUploads(estimate.uploads),
        {
          text: 'Terms & Conditions',
          style: ['h4b', 'm20'],
          pageBreak: 'before',
        },
        { text: terms ? terms.terms : '' },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
    };
    return this.generatePdf(data, company);
  }

  // ESTIMATE RENTAL PDF
  async rentalEstimate(
    estimate: InventoryEstimateRent,
    company: Company,
    terms: Term | null,
  ) {
    const items = [];
    estimate.items.forEach((item, i) => {
      items.push(this.addRentalEstimateItem(i, company, item));
    });

    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            {
              text: 'Item Code',
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: 'Description',
              style: 'h4b',
              alignment: 'left',
            },
            {
              text: 'Unit',
              style: 'h4b',
              alignment: 'center',
            },
            { text: 'Duration / Month', style: 'h4b', alignment: 'center' },
            { text: 'Rent / Month', style: 'h4b', alignment: 'center' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
    };

    const data = {
      header: this.getPageNumbers(),
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Quotation-${estimate.code}`),
      content: [
        await this.getBillingHeader(
          'Rental Quotation',
          estimate.code,
          estimate.siteName,
          estimate.date,
          company,
          '',
          [],
        ),
        hr,
        this.getCompanyInfo(estimate.customer, company),
        hr,
        { text: estimate.scope },
        hr,
        summary,
        hr,
        {
          table: {
            widths: ['*', '*', '*', '*'],

            body: [
              [
                {
                  text: 'Banking Details',
                  style: ['h4b'],
                  alignment: 'left',
                },
                '',
                '',
                {
                  text: 'Total Amount',
                  style: ['h4b'],
                  alignment: 'right',
                },
              ],
              [
                { text: 'Bank Name:', style: 'h6b', alignment: 'left' },
                { text: company.bankName, alignment: 'left' },
                {
                  text: 'Subtotal:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    estimate.subtotal,
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Beneficiary:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount (${estimate.discountPercentage}%):`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    estimate.discount,
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                { text: 'Account No:', style: 'h6b', alignment: 'left' },
                { text: `${company.accountNum}`, alignment: 'left' },
                {
                  text: `Contract Total:`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    estimate.subtotal - estimate.discount,
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                {
                  text: company.branchCode ? 'BSB:' : '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: company.branchCode ? company.branchCode : '',
                  alignment: 'left',
                },
                {
                  text:
                    company.vat > 0
                      ? `${company?.gst ? 'GST' : 'VAT'} (${company.vat}%):`
                      : company.salesTax > 0
                        ? `Tax (${company.salesTax}%):`
                        : '',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text:
                    company.vat > 0
                      ? `${company.currency.symbol} ${this.format(
                          estimate.vat,
                        )}`
                      : company.salesTax > 0
                        ? `${company.currency.symbol} ${this.format(
                            estimate.tax,
                          )}`
                        : '',

                  alignment: 'right',
                  style: ['h6b', 'mt5'],
                },
              ],
              [
                {
                  text: company.swiftCode ? 'SWIFT / BIC Code:' : '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: company.swiftCode ? company.swiftCode : '',
                  alignment: 'left',
                },
                {
                  text: 'Grand Total:',
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    estimate.total,
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
              ],
              // [
              //   {
              //     text: 'Grand Total in words:',
              //     style: 'h4b',
              //     alignment: 'right',
              //     colSpan: 3,
              //   },
              //   '',
              //   '',
              //   {
              //     text: this.numberToWords(estimate.total),
              //     style: 'h4b',
              //   },
              // ],
            ],
          },
          layout: 'noBorders',
        },
        await this.addUploads(estimate.uploads),
        {
          text: 'Terms & Conditions',
          style: ['h4b', 'm20'],
          pageBreak: 'before',
        },
        { text: terms ? terms.terms : '' },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
    };
    return this.generatePdf(data, company);
  }

  // ESTIMATE RENTAL PDF
  async saleEstimate(
    estimate: InventoryEstimateSell,
    company: Company,
    terms: Term | null,
  ) {
    const items = [];
    estimate.items.forEach((item, i) => {
      items.push(this.addSaleItem(i, company, item, false));
    });

    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            {
              text: 'Item Code',
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: 'Description',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Unit', style: 'h4b', alignment: 'center' },
            { text: 'Rate', style: 'h4b', alignment: 'center' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
    };

    const data = {
      header: this.getPageNumbers(),
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Quotation-${estimate.code}`),
      content: [
        await this.getBillingHeader(
          'Sale Quotation',
          estimate.code,
          estimate.siteName,
          estimate.date,
          company,
          '',
          [],
        ),
        hr,
        this.getCompanyInfo(estimate.customer, company),
        hr,
        { text: estimate.scope },
        hr,
        summary,
        hr,
        {
          table: {
            widths: ['*', '*', '*', '*'],

            body: [
              [
                {
                  text: 'Banking Details',
                  style: ['h4b'],
                  alignment: 'left',
                },
                '',
                '',
                {
                  text: 'Total Amount',
                  style: ['h4b'],
                  alignment: 'right',
                },
              ],
              [
                { text: 'Bank Name:', style: 'h6b', alignment: 'left' },
                { text: company.bankName, alignment: 'left' },
                {
                  text: 'Subtotal:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    estimate.subtotal,
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Beneficiary:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount (${estimate.discountPercentage}%):`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    estimate.discount,
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                { text: 'Account No:', style: 'h6b', alignment: 'left' },
                { text: `${company.accountNum}`, alignment: 'left' },
                {
                  text: `Contract Total:`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    estimate.subtotal - estimate.discount,
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                {
                  text: company.branchCode ? 'BSB:' : '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: company.branchCode ? company.branchCode : '',
                  alignment: 'left',
                },
                {
                  text:
                    company.vat > 0
                      ? `${company?.gst ? 'GST' : 'VAT'} (${company.vat}%):`
                      : company.salesTax > 0
                        ? `Tax (${company.salesTax}%):`
                        : '',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text:
                    company.vat > 0
                      ? `${company.currency.symbol} ${this.format(
                          estimate.vat,
                        )}`
                      : company.salesTax > 0
                        ? `${company.currency.symbol} ${this.format(
                            estimate.tax,
                          )}`
                        : '',

                  alignment: 'right',
                  style: ['h6b', 'mt5'],
                },
              ],
              [
                {
                  text: company.swiftCode ? 'SWIFT / BIC Code:' : '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: company.swiftCode ? company.swiftCode : '',
                  alignment: 'left',
                },
                {
                  text: 'Grand Total:',
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    estimate.total,
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
              ],
              // [
              //   {
              //     text: 'Grand Total in words:',
              //     style: 'h4b',
              //     alignment: 'right',
              //     colSpan: 3,
              //   },
              //   '',
              //   '',
              //   {
              //     text: this.numberToWords(estimate.total),
              //     style: 'h4b',
              //   },
              // ],
            ],
          },
          layout: 'noBorders',
        },
        await this.addUploads(estimate.uploads),
        {
          text: 'Terms & Conditions',
          style: ['h4b', 'm20'],
          pageBreak: 'before',
        },
        { text: terms ? terms.terms : '' },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
    };
    return this.generatePdf(data, company);
  }

  // INVOICE RENTAL PDF
  async saleInvoice(
    invoice: SaleInvoice,
    company: Company,
    terms: Term | null,
    isdraft?: boolean,
  ) {
    const items = invoice.estimate?.items || [];
    const customer = invoice.estimate?.customer;
    const invoiceTitle = isdraft ? 'INVOICE DRAFT' : 'INVOICE';
    const invoiceCode = isdraft ? 'Invoice Draft' : invoice.code;
    const content: any[] = [];

    content.push(
      await this.getRentalInvoiceHeaderBlock(
        invoiceTitle,
        invoiceCode,
        invoice,
        company,
      ),
    );
    content.push(this.getRentalInvoicePartyBlock(customer, company));

    if (invoice.estimate?.scope?.trim()) {
      content.push({
        text: invoice.estimate.scope.trim(),
        style: 'invoiceSmall',
        margin: [0, 0, 0, 6],
      });
    }

    if (items.length > 0) {
      content.push(this.getInvoiceSectionHeader('Invoice Items'));
      content.push(
        this.createInvoiceTable(
          [
            { text: 'Item', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Rate', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          items.map((item) => this.addSaleInvoiceRow(company, item)),
          ['auto', '*', 'auto', 'auto', 'auto'],
        ),
      );
    }

    content.push(
      this.getRentalInvoiceTotalsBlock(
        {
          code: invoice.code,
          subtotal: invoice.estimate?.subtotal || 0,
          discount: invoice.estimate?.discount || 0,
          creditTotal: 0,
          tax: invoice.estimate?.tax || 0,
          vat: invoice.estimate?.vat || 0,
          total: invoice.estimate?.total || 0,
        },
        company,
        customer,
      ),
    );

    const uploads = await this.addUploads(invoice.estimate?.uploads || []);
    content.push(...uploads);

    if (terms?.terms?.trim()) {
      content.push({
        text: 'Terms & Conditions',
        style: ['h4b', 'm20'],
        pageBreak: 'before',
      });
      content.push({ text: terms.terms });
    }

    const data = {
      footer: this.getRentalInvoiceFooter(),
      info: this.getMetaData(
        `${company.name}-Invoice-${invoice.estimate?.code || invoice.code}`,
      ),
      content,
      styles: stylesCS,
      defaultStyle: {
        ...defaultCS,
        lineHeight: 1.25,
      },
      pageOrientation: 'portrait',
      pageMargins: [32, 28, 32, 46],
    };
    return this.generatePdf(data, company);
  }

  // INVOICE RENTAL PDF
  async rentalInvoice(
    invoice: TransactionInvoice,
    company: Company,
    terms: Term | null,
    isdraft?: boolean,
  ) {
    const estimateSource = invoice.customInvoice
      ? (invoice.estimate?.items || []).filter((item) => item.forInvoice)
      : invoice.estimate?.items || [];
    const rentalItems = (invoice.items || []).filter(
      (item) => !item.isDamageCharge && !item.isConsumable,
    );
    const consumableItems = (invoice.items || []).filter(
      (item) => item.isConsumable,
    );
    const damageItems = (invoice.items || []).filter(
      (item) => item.isDamageCharge,
    );
    const creditItems = invoice.creditItems || [];
    const customer = invoice.estimate?.customer || invoice.site?.customer;
    const invoiceTitle = isdraft ? 'INVOICE DRAFT' : 'INVOICE';
    const invoiceCode = isdraft ? 'Invoice Draft' : invoice.code;
    const content: any[] = [];

    content.push(
      await this.getRentalInvoiceHeaderBlock(
        invoiceTitle,
        invoiceCode,
        invoice,
        company,
      ),
    );

    content.push(this.getRentalInvoicePartyBlock(customer, company));

    if (invoice.type !== 'Rental' && estimateSource.length > 0) {
      content.push(this.getInvoiceSectionHeader('Contract Items'));
      content.push(
        this.createInvoiceTable(
          [
            { text: 'Item', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Duration', style: 'h4b', alignment: 'center' },
            { text: 'Rate', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          estimateSource.map((item) =>
            this.addEstimateInvoiceRow(company, item),
          ),
          ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        ),
      );
    }

    if (rentalItems.length > 0) {
      content.push(this.getInvoiceSectionHeader('Rental Items'));
      content.push(
        this.createInvoiceTable(
          invoice.customInvoice
            ? [
                { text: 'Docket', style: 'h4b', alignment: 'left' },
                { text: 'Item', style: 'h4b', alignment: 'left' },
                { text: 'Description', style: 'h4b', alignment: 'left' },
                { text: 'Delivered', style: 'h4b', alignment: 'center' },
                { text: 'Returned', style: 'h4b', alignment: 'center' },
                { text: 'Balance', style: 'h4b', alignment: 'center' },
                { text: 'Hire Period', style: 'h4b', alignment: 'center' },
              ]
            : [
                { text: 'Docket', style: 'h4b', alignment: 'left' },
                { text: 'Item', style: 'h4b', alignment: 'left' },
                { text: 'Description', style: 'h4b', alignment: 'left' },
                { text: 'Qty', style: 'h4b', alignment: 'center' },
                { text: 'Hire Period', style: 'h4b', alignment: 'center' },
                { text: 'Details', style: 'h4b', alignment: 'center' },
                { text: 'Rate', style: 'h4b', alignment: 'center' },
                { text: 'Total', style: 'h4b', alignment: 'right' },
              ],
          rentalItems.map((item) =>
            this.addRentalInvoiceRow(company, item, invoice.customInvoice),
          ),
          invoice.customInvoice
            ? ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto']
            : ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        ),
      );
    }

    if (consumableItems.length > 0) {
      content.push(this.getInvoiceSectionHeader('Consumables'));
      content.push(
        this.createInvoiceTable(
          invoice.customInvoice
            ? [
                { text: 'Docket', style: 'h4b', alignment: 'left' },
                { text: 'Item', style: 'h4b', alignment: 'left' },
                { text: 'Description', style: 'h4b', alignment: 'left' },
                { text: 'Unit', style: 'h4b', alignment: 'center' },
              ]
            : [
                { text: 'Docket', style: 'h4b', alignment: 'left' },
                { text: 'Item', style: 'h4b', alignment: 'left' },
                { text: 'Description', style: 'h4b', alignment: 'left' },
                { text: 'Qty', style: 'h4b', alignment: 'center' },
                { text: 'Unit Cost', style: 'h4b', alignment: 'center' },
                { text: 'Total', style: 'h4b', alignment: 'right' },
              ],
          consumableItems.map((item) =>
            this.addConsumableInvoiceRow(company, item, invoice.customInvoice),
          ),
          invoice.customInvoice
            ? ['auto', 'auto', '*', 'auto']
            : ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
        ),
      );
    }

    if (damageItems.length > 0) {
      content.push(this.getInvoiceSectionHeader('Damage Charges'));
      content.push(
        this.createInvoiceTable(
          invoice.customInvoice
            ? [
                { text: 'Docket', style: 'h4b', alignment: 'left' },
                { text: 'Item', style: 'h4b', alignment: 'left' },
                { text: 'Description', style: 'h4b', alignment: 'left' },
                { text: 'Unit', style: 'h4b', alignment: 'center' },
              ]
            : [
                { text: 'Docket', style: 'h4b', alignment: 'left' },
                { text: 'Item', style: 'h4b', alignment: 'left' },
                { text: 'Description', style: 'h4b', alignment: 'left' },
                { text: 'Qty', style: 'h4b', alignment: 'center' },
                { text: 'Unit Cost', style: 'h4b', alignment: 'center' },
                { text: 'Total', style: 'h4b', alignment: 'right' },
              ],
          damageItems.map((item) =>
            this.addDamageInvoiceRow(company, item, invoice.customInvoice),
          ),
          invoice.customInvoice
            ? ['auto', 'auto', '*', 'auto']
            : ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
        ),
      );
    }

    if (creditItems.length > 0) {
      content.push(this.getInvoiceSectionHeader('Credit Items'));
      content.push(
        this.createInvoiceTable(
          [
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          creditItems.map((item) => [
            { text: item.description, style: 'h6' },
            {
              text: `-${this.currency(item.total, company.currency?.symbol || '')}`,
              style: 'h6',
              alignment: 'right',
            },
          ]),
          ['*', 'auto'],
        ),
      );
    }

    content.push(this.getRentalInvoiceTotalsBlock(invoice, company, customer));

    const uploads = await this.addUploads(invoice.estimate?.uploads || []);
    content.push(...uploads);
    if (terms?.terms?.trim()) {
      content.push({
        text: 'Terms & Conditions',
        style: ['h4b', 'm20'],
      });
      content.push({ text: terms.terms });
    }

    const data = {
      footer: this.getRentalInvoiceFooter(),
      info: this.getMetaData(`${company.name}-Invoice-${invoice.code}`),
      content,
      styles: stylesCS,
      defaultStyle: {
        ...defaultCS,
        lineHeight: 1.25,
      },
      pageOrientation: 'portrait',
      pageMargins: [32, 28, 32, 46],
    };
    return this.generatePdf(data, company);
  }

  // INVOICE RENTAL PDF
  async mixedInvoice(
    invoice: TransactionInvoice,
    company: Company,
    terms: Term | null,
    isdraft?: boolean,
  ) {
    const estimateSource = (invoice.estimate?.items || []).filter(
      (item) => item.forInvoice,
    );
    const rentalItems = (invoice.items || []).filter(
      (item) => !item.isDamageCharge && !item.isConsumable,
    );
    const consumableItems = (invoice.items || []).filter(
      (item) => item.isConsumable,
    );
    const damageItems = (invoice.items || []).filter(
      (item) => item.isDamageCharge,
    );
    const creditItems = invoice.creditItems || [];
    const customer = invoice.estimate?.customer || invoice.site?.customer;
    const invoiceTitle = isdraft ? 'INVOICE DRAFT' : 'INVOICE';
    const invoiceCode = isdraft ? 'Invoice Draft' : invoice.code;
    const content: any[] = [];

    content.push(
      await this.getRentalInvoiceHeaderBlock(
        invoiceTitle,
        invoiceCode,
        invoice,
        company,
      ),
    );
    content.push(this.getRentalInvoicePartyBlock(customer, company));

    if (invoice.estimate?.scope?.trim()) {
      content.push({
        text: invoice.estimate.scope.trim(),
        style: 'invoiceSmall',
        margin: [0, 0, 0, 6],
      });
    }

    if (estimateSource.length > 0) {
      content.push(this.getInvoiceSectionHeader('Contract Items'));
      content.push(
        this.createInvoiceTable(
          [
            { text: 'Item', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Duration', style: 'h4b', alignment: 'center' },
            { text: 'Rate', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          estimateSource.map((item) =>
            this.addEstimateInvoiceRow(company, item),
          ),
          ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        ),
      );
    }

    if (rentalItems.length > 0) {
      content.push(this.getInvoiceSectionHeader('Rental Items'));
      content.push(
        this.createInvoiceTable(
          [
            { text: 'Docket', style: 'h4b', alignment: 'left' },
            { text: 'Item', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Hire Period', style: 'h4b', alignment: 'center' },
            { text: 'Details', style: 'h4b', alignment: 'center' },
            { text: 'Rate', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          rentalItems.map((item) =>
            this.addRentalInvoiceRow(company, item, false),
          ),
          ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
        ),
      );
    }

    if (consumableItems.length > 0) {
      content.push(this.getInvoiceSectionHeader('Consumables'));
      content.push(
        this.createInvoiceTable(
          [
            { text: 'Docket', style: 'h4b', alignment: 'left' },
            { text: 'Item', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Unit Cost', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          consumableItems.map((item) =>
            this.addConsumableInvoiceRow(company, item, false),
          ),
          ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
        ),
      );
    }

    if (damageItems.length > 0) {
      content.push(this.getInvoiceSectionHeader('Damage Charges'));
      content.push(
        this.createInvoiceTable(
          [
            { text: 'Docket', style: 'h4b', alignment: 'left' },
            { text: 'Item', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Unit Cost', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          damageItems.map((item) =>
            this.addDamageInvoiceRow(company, item, false),
          ),
          ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
        ),
      );
    }

    if (creditItems.length > 0) {
      content.push(this.getInvoiceSectionHeader('Credit Items'));
      content.push(
        this.createInvoiceTable(
          [
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          creditItems.map((item) => [
            { text: item.description, style: 'h6' },
            {
              text: `-${this.currency(item.total, company.currency?.symbol || '')}`,
              style: 'h6',
              alignment: 'right',
            },
          ]),
          ['*', 'auto'],
        ),
      );
    }

    content.push(this.getRentalInvoiceTotalsBlock(invoice, company, customer));

    const uploads = await this.addUploads(invoice.estimate?.uploads || []);
    content.push(...uploads);

    if (terms?.terms?.trim()) {
      content.push({
        text: 'Terms & Conditions',
        style: ['h4b', 'm20'],
      });
      content.push({ text: terms.terms });
    }

    const data = {
      footer: this.getRentalInvoiceFooter(),
      info: this.getMetaData(`${company.name}-Invoice-${invoice.code}`),
      content,
      styles: stylesCS,
      defaultStyle: {
        ...defaultCS,
        lineHeight: 1.25,
      },
      pageOrientation: 'portrait',
      pageMargins: [32, 28, 32, 46],
    };
    return this.generatePdf(data, company);
  }

  // INSPECTION PDF
  async inspection(
    inspection: Inspection,
    company: Company,
    terms: Term | null,
  ) {
    const attachments = [];
    inspection.scaffold.attachments.forEach((a, i) => {
      attachments.push([
        '',
        {
          text: `${company.terminology.scaffold} Level ${a.level}${company.measurement.symbol}`,
          style: 'h6',
        },
        {
          text: `${a.length}${company.measurement.symbol} x ${a.width}${company.measurement.symbol} x ${a.height}${company.measurement.symbol}`,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: a.qty,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: a.safe,
          style: 'h6',
          alignment: 'center',
        },
      ]);
    });
    const boards = [];
    inspection.scaffold.boards.forEach((b, i) => {
      boards.push([
        '',
        {
          text: `${company.terminology.boards}`,
          style: 'h6',
        },
        {
          text: `${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol} - Level ${b.height}${company.measurement.symbol}`,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: b.qty,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: 'Yes',
          style: 'h6',
          alignment: 'center',
        },
      ]);
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', '*', '*', '*'],
        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Detail', style: 'h4b', alignment: 'center' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Safe', style: 'h4b', alignment: 'center' },
          ],
          [
            {
              text: 1,
              style: 'h4b',
            },
            {
              text: `${company.terminology.scaffold} Details`,
              style: 'h4b',
              colSpan: 4,
            },
          ],
          [
            '',
            {
              text: `${company.terminology.scaffold} Level ${
                inspection.scaffold.scaffold.level || 0
              }${company.measurement.symbol}`,
              style: 'h6',
            },
            {
              text: `${inspection.scaffold.scaffold.length}${company.measurement.symbol} x ${inspection.scaffold.scaffold.width}${company.measurement.symbol} x ${inspection.scaffold.scaffold.height}${company.measurement.symbol}`,
              style: 'h6',
              alignment: 'center',
            },
            {
              text: '1',
              style: 'h6',
              alignment: 'center',
            },
            {
              text: inspection.scaffold.scaffold.safe,
              style: 'h6',
              alignment: 'center',
            },
          ],
          ...attachments,
          ...boards,
        ],
      },
      layout: tLayout,
    };
    const checklist = [];
    inspection?.questions?.categories.forEach((c) => {
      const items = [];
      c.items.forEach((i, j) => {
        items.push([
          {
            text: j + 1,
            style: 'h6',
            alignment: 'left',
          },
          {
            text: i.question,
            style: 'h6',
            alignment: 'left',
          },
          {
            text: i.value ? i.value : 'N/A',
            style: 'h6',
            alignment: 'center',
          },
        ]);
      });
      const questions = {
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          widths: ['auto', '*', 'auto'],
          body: [
            [
              { text: '#', style: 'h4b', alignment: 'left' },
              { text: 'Question', style: 'h4b', alignment: 'left' },
              { text: 'Checklist', style: 'h4b', alignment: 'center' },
            ],
            ...items,
          ],
        },
        layout: tLayout,
      };
      checklist.push(hr, { text: c.name, style: 'h4b' }, questions);
    });

    const signature = inspection.signature
      ? {
          image: await this.getBase64ImageFromURL(
            inspection.signature,
            300,
            200,
            0.6,
            true,
          ),
          width: 100,
          alignment: 'right',
        }
      : {
          text: 'Needs Signature',
          style: 'h4b',
          alignment: 'Right',
          color: 'red',
        };

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Inspection-${inspection.code}`),
      content: [
        await this.getHeader(
          'Inspection',
          inspection.code,
          inspection.scaffold.siteCode,
          inspection.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          `https://app.cloudscaff.com/viewInspection/${company.id}-${inspection.id}`,
          [
            [
              { text: 'Site Address', style: 'h6b' },
              `${inspection?.scaffold?.siteName || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Scaffold:', style: 'h6b' },
              `${inspection.scaffold.code}`,
              '',
              '',
            ],
            [
              {
                text: 'Status:',
                style: 'h6b',
              },
              {
                text: inspection.status,
                style: 'h6b',
                color: inspection.status === 'Passed' ? 'green' : 'red',
              },
              '',
              '',
            ],
            [
              { text: 'Created By:', style: 'h6b' },
              `${inspection?.createdByName}`,
              '',
              '',
            ],
          ],
        ),
        hr,
        this.getCompanyInfo(inspection.customer, company),
        hr,
        { text: inspection.notes },
        hr,
        summary,
        checklist,
        hr,
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['auto', '*'],
            body: [
              [
                { text: 'Status', style: 'h4b', alignment: 'left' },
                {
                  text: inspection.status,
                  style: 'h4b',
                  alignment: 'right',
                  color: inspection.status === 'Passed' ? 'green' : 'red',
                },
              ],
            ],
          },
          layout: tLayout,
          fillColor: inspection.status === 'Passed' ? '#EEF5EC' : '#FAECED',
        },
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                {
                  text: `Signed by ${inspection.signedBy}`,
                  style: 'h4b',
                  alignment: 'left',
                },
                signature,
              ],
            ],
          },
          layout: tLayout,
          fillColor: '#ffffff',
        },
        await this.addUploads(inspection.uploads),
        {
          text: 'Terms & Conditions',
          style: ['h4b', 'm20'],
          pageBreak: 'before',
        },
        { text: terms ? terms.terms : '', style: { fontSize: 6 } },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data, company);
  }

  // HANDOVER PDF
  async handover(handover: Handover, company: Company, terms: Term | null) {
    const attachments = [];
    handover.scaffold.attachments.forEach((a, i) => {
      attachments.push([
        '',
        {
          text: `${company.terminology.scaffold} Level ${a.level}${company.measurement.symbol}`,
          style: 'h6',
        },
        {
          text: `${a.length}${company.measurement.symbol} x ${a.width}${company.measurement.symbol} x ${a.height}${company.measurement.symbol}`,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: a.qty,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: a.safe,
          style: 'h6',
          alignment: 'center',
        },
      ]);
    });
    const boards = [];
    handover.scaffold.boards.forEach((b, i) => {
      boards.push([
        '',
        {
          text: `${company.terminology.boards}`,
          style: 'h6',
        },
        {
          text: `${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol} - Level ${b.height}${company.measurement.symbol}`,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: b.qty,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: 'Yes',
          style: 'h6',
          alignment: 'center',
        },
      ]);
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', '*', '*', '*'],
        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Detail', style: 'h4b', alignment: 'center' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Safe', style: 'h4b', alignment: 'center' },
          ],
          [
            {
              text: 1,
              style: 'h4b',
            },
            {
              text: `${company.terminology.scaffold} Details`,
              style: 'h4b',
              colSpan: 4,
            },
          ],
          [
            '',
            {
              text: `${company.terminology.scaffold} Level ${
                handover.scaffold.scaffold.level || 0
              }${company.measurement.symbol}`,
              style: 'h6',
            },
            {
              text: `${handover.scaffold.scaffold.length}${company.measurement.symbol} x ${handover.scaffold.scaffold.width}${company.measurement.symbol} x ${handover.scaffold.scaffold.height}${company.measurement.symbol}`,
              style: 'h6',
              alignment: 'center',
            },
            {
              text: '1',
              style: 'h6',
              alignment: 'center',
            },
            {
              text: handover.scaffold.scaffold.safe,
              style: 'h6',
              alignment: 'center',
            },
          ],
          ...attachments,
          ...boards,
        ],
      },
      layout: tLayout,
    };
    const checklist = [];
    if (handover.questions) {
      handover.questions.categories.forEach((c) => {
        const items = [];
        c.items.forEach((i, j) => {
          items.push([
            {
              text: j + 1,
              style: 'h6',
              alignment: 'left',
            },
            {
              text: i.question,
              style: 'h6',
              alignment: 'left',
            },
            {
              text: i.value ? i.value : 'N/A',
              style: 'h6',
              alignment: 'center',
            },
          ]);
        });
        const questions = {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['auto', '*', 'auto'],
            body: [
              [
                { text: '#', style: 'h4b', alignment: 'left' },
                { text: 'Question', style: 'h4b', alignment: 'left' },
                { text: 'Checklist', style: 'h4b', alignment: 'center' },
              ],
              ...items,
            ],
          },
          layout: tLayout,
        };
        checklist.push(hr, { text: c.name, style: 'h4b' }, questions);
      });
    }

    const signature = handover.signature
      ? {
          image: await this.getBase64ImageFromURL(
            handover.signature,
            300,
            200,
            0.6,
            true,
          ),
          width: 100,
          alignment: 'right',
        }
      : {
          text: 'Needs Signature',
          style: 'h4b',
          alignment: 'Right',
          color: 'red',
        };

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Handover-${handover.code}`),
      content: [
        await this.getHeader(
          'Handover',
          handover.code,
          handover.scaffold.siteCode,
          handover.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          `https://app.cloudscaff.com/viewHandover/${company.id}-${handover.id}`,
          [
            [
              { text: 'Site Address', style: 'h6b' },
              `${handover?.scaffold?.siteName || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Scaffold:', style: 'h6b' },
              `${handover.scaffold.code}`,
              '',
              '',
            ],
            [
              {
                text: 'Status:',
                style: 'h6b',
              },
              {
                text: handover.safe,
                style: 'h6b',
                color: handover.safe === 'Passed' ? 'green' : 'red',
              },
              '',
              '',
            ],
            [
              { text: 'Created By:', style: 'h6b' },
              `${handover?.createdByName}`,
              '',
              '',
            ],
          ],
        ),
        hr,
        this.getCompanyInfo(handover.customer, company),
        hr,
        { text: handover.notes },
        hr,
        summary,
        checklist,
        hr,
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  text: 'Handover Details',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: handover.detail,
                },
              ],
            ],
          },
          layout: tLayout,
        },
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                {
                  text: 'Status',
                  style: 'h4b',
                  alignment: 'left',
                  colSpan: 2,
                },
                {
                  text: '',
                  style: 'h4b',
                  alignment: 'right',
                },
              ],
              [
                {
                  text: 'Maximum load of the scaffold?',
                  style: 'h4b',
                  alignment: 'left',
                },
                {
                  text: handover.maxLoad,
                  style: 'h4b',
                  alignment: 'right',
                },
              ],
              [
                {
                  text: 'Is the scaffold safe for use?	',
                  style: 'h4b',
                  alignment: 'left',
                },
                {
                  text: handover.safe,
                  style: 'h4b',
                  alignment: 'right',
                  color: handover.safe === 'Passed' ? 'green' : 'red',
                },
              ],
              [
                {
                  text: `Signed by ${handover.signedBy}`,
                  style: 'h4b',
                  alignment: 'left',
                },
                signature,
              ],
            ],
          },
          layout: tLayout,
        },
        hr,
        await this.addUploads(handover.uploads),
        {
          text: 'Terms & Conditions',
          style: ['h4b', 'm20'],
          pageBreak: 'before',
        },

        { text: terms ? terms.terms : '', style: { fontSize: 6 } },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data, company);
  }

  // HANDOVER PDF
  async dismantle(dismantle: Handover, company: Company, terms: Term | null) {
    const attachments = [];
    dismantle.scaffold.attachments.forEach((a, i) => {
      attachments.push([
        '',
        {
          text: `${company.terminology.scaffold} Level ${a.level}`,
          style: 'h6',
        },
        {
          text: `${a.length}${company.measurement.symbol} x ${a.width}${company.measurement.symbol} x ${a.height}${company.measurement.symbol}`,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: a.qty,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: a.safe,
          style: 'h6',
          alignment: 'center',
        },
      ]);
    });
    const boards = [];
    dismantle.scaffold.boards.forEach((b, i) => {
      boards.push([
        '',
        {
          text: `${company.terminology.boards}`,
          style: 'h6',
        },
        {
          text: `${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol} - Level ${b.height}${company.measurement.symbol}`,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: b.qty,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: 'Yes',
          style: 'h6',
          alignment: 'center',
        },
      ]);
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', '*', '*', '*'],
        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Detail', style: 'h4b', alignment: 'center' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Safe', style: 'h4b', alignment: 'center' },
          ],
          [
            {
              text: 1,
              style: 'h4b',
            },
            {
              text: `${company.terminology.scaffold} Details`,
              style: 'h4b',
              colSpan: 4,
            },
          ],
          [
            '',
            {
              text: `${company.terminology.scaffold} Level 0`,
              style: 'h6',
            },
            {
              text: `${dismantle.scaffold.scaffold.length}${company.measurement.symbol} x ${dismantle.scaffold.scaffold.width}${company.measurement.symbol} x ${dismantle.scaffold.scaffold.height}${company.measurement.symbol}`,
              style: 'h6',
              alignment: 'center',
            },
            {
              text: '1',
              style: 'h6',
              alignment: 'center',
            },
            {
              text: dismantle.scaffold.scaffold.safe,
              style: 'h6',
              alignment: 'center',
            },
          ],
          ...attachments,
          ...boards,
        ],
      },
      layout: tLayout,
    };
    const checklist = [];
    // if (dismantle.questions) {
    //   dismantle.questions.categories.forEach((c) => {
    //     const items = [];
    //     c.items.forEach((i, j) => {
    //       items.push([
    //         {
    //           text: j + 1,
    //           style: 'h6',
    //           alignment: 'left',
    //         },
    //         {
    //           text: i.question,
    //           style: 'h6',
    //           alignment: 'left',
    //         },
    //         {
    //           text: i.value ? i.value : 'N/A',
    //           style: 'h6',
    //           alignment: 'center',
    //         },
    //       ]);
    //     });
    //     const questions = {
    //       table: {
    //         // headers are automatically repeated if the table spans over multiple pages
    //         // you can declare how many rows should be treated as headers
    //         headerRows: 1,
    //         widths: ['auto', '*', 'auto'],
    //         body: [
    //           [
    //             { text: '#', style: 'h4b', alignment: 'left' },
    //             { text: 'Question', style: 'h4b', alignment: 'left' },
    //             { text: 'Checklist', style: 'h4b', alignment: 'center' },
    //           ],
    //           ...items,
    //         ],
    //       },
    //       layout: tLayout,
    //     };
    //     checklist.push(hr, { text: c.name, style: 'h4b' }, questions);
    //   });
    // }

    const signature = dismantle.signature
      ? {
          image: await this.getBase64ImageFromURL(
            dismantle.signature,
            300,
            200,
            0.6,
            true,
          ),
          width: 100,
          alignment: 'right',
        }
      : {
          text: 'Needs Signature',
          style: 'h4b',
          alignment: 'Right',
          color: 'red',
        };

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Dismantle-${dismantle.code}`),
      content: [
        await this.getHeader(
          'Dismantle',
          dismantle.code,
          dismantle.scaffold.siteCode,
          dismantle.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          `https://app.cloudscaff.com/viewDismantle/${company.id}-${dismantle.id}`,
          [
            [
              { text: 'Scaffold:', style: 'h6b' },
              `${dismantle.scaffold.code}`,
              '',
              '',
            ],
            [
              {
                text: 'Status:',
                style: 'h6b',
              },
              {
                text: dismantle.safe,
                style: 'h6b',
                color: dismantle.safe === 'Passed' ? 'green' : 'red',
              },
              '',
              '',
            ],
          ],
        ),
        hr,
        this.getCompanyInfo(dismantle.customer, company),
        // hr,
        // { text: dismantle.notes },
        hr,
        summary,
        // checklist,
        hr,
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              // [
              //   {
              //     text: 'Status',
              //     style: 'h4b',
              //     alignment: 'left',
              //     colSpan: 2,
              //   },
              //   {
              //     text: '',
              //     style: 'h4b',
              //     alignment: 'right',
              //   },
              // ],
              // [
              //   {
              //     text: 'Maximum load of the scaffold?',
              //     style: 'h4b',
              //     alignment: 'left',
              //   },
              //   {
              //     text: dismantle.maxLoad,
              //     style: 'h4b',
              //     alignment: 'right',
              //   },
              // ],
              // [
              //   {
              //     text: 'Is the scaffold safe for use?	',
              //     style: 'h4b',
              //     alignment: 'left',
              //   },
              //   {
              //     text: dismantle.safe,
              //     style: 'h4b',
              //     alignment: 'right',
              //     color: dismantle.safe === 'Passed' ? 'green' : 'red',
              //   },
              // ],
              [
                {
                  text: 'Signature',
                  style: 'h4b',
                  alignment: 'left',
                },
                signature,
              ],
            ],
          },
          layout: tLayout,
        },
        // hr,
        // await this.addUploads(dismantle.uploads),
        {
          text: 'Terms & Conditions',
          style: ['h4b', 'm20'],
          pageBreak: 'before',
        },

        { text: terms ? terms.terms : '', style: { fontSize: 6 } },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data, company);
  }

  // DELIVERY INVENTORY PDF
  async delivery(delivery: Delivery, company: Company, terms: Term | null) {
    const summary = this.createShipmentTable(delivery.items);
    const itemCount = delivery.items.reduce(
      (acc, item) => acc + item.shipmentQty,
      0,
    );
    const deliveryCompany = {
      ...company,
      rep: delivery.companyRepName || company.rep,
    };
    const deliveryCustomer = delivery.site?.customer
      ? {
          ...delivery.site.customer,
          rep: delivery.customerRepName || delivery.site.customer.rep,
          email: delivery.customerRepEmail || delivery.site.customer.email,
          phone: delivery.customerRepContact || delivery.site.customer.phone,
        }
      : undefined;
    // Handle DD-MM-YYYY format
    let expectedDeliveryDate = null;
    if (delivery?.endDate) {
      if (typeof delivery.endDate === 'string') {
        const parts = delivery.endDate.split('-');
        if (parts.length === 3) {
          expectedDeliveryDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        }
      } else {
        expectedDeliveryDate = this.dateFormatPipe.transform(delivery.endDate);
      }
    }
    const content: any[] = [
      await this.getDeliveryHeaderBlock(
        delivery,
        company,
        expectedDeliveryDate,
      ),
      this.getDeliveryPartyBlock(deliveryCustomer, deliveryCompany),
      this.getDeliveryContactBlock(delivery),
      this.getInvoiceSectionHeader('Project Notes'),
      {
        text: delivery.notes || 'N/A',
        style: 'invoiceSmall',
        margin: [8, 2, 8, 10],
      },
      this.getInvoiceSectionHeader('Delivered Items'),
      summary,
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Total Items', style: 'invoiceSummaryLabel' },
              {
                text: this.decimalPipe.transform(itemCount),
                style: 'invoiceSummaryValue',
                alignment: 'right',
              },
            ],
            [
              { text: 'Total Weight', style: 'invoiceTotalLabel' },
              {
                text: this.weightPipe.transform(delivery.items, true),
                style: 'invoiceTotalValue',
                alignment: 'right',
              },
            ],
          ],
        },
        layout: {
          hLineWidth: (i) => (i === 1 ? 0.8 : 0),
          hLineColor: () => invoiceTheme.border,
          vLineWidth: () => 0,
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 6,
          paddingBottom: () => 6,
          fillColor: () => invoiceTheme.panel,
        },
        margin: [280, 0, 0, 12],
      },
      ...(delivery.status !== 'received'
        ? [
            this.getInvoiceSectionHeader('Delivery Confirmation'),
            {
              table: {
                headerRows: 1,
                widths: ['*', '*'],
                body: [
                  [
                    {
                      text: 'Order received by Company:',
                      style: 'invoiceSmallBold',
                    },
                    {
                      text: 'Order delivered by Company:',
                      style: 'invoiceSmallBold',
                    },
                  ],
                  [
                    { text: 'Name:', style: 'invoiceSmallBold' },
                    { text: 'Name:', style: 'invoiceSmallBold' },
                  ],
                  [
                    { text: 'Date:', style: 'invoiceSmallBold' },
                    { text: 'Date:', style: 'invoiceSmallBold' },
                  ],
                  [
                    {
                      text: 'Sign:',
                      style: 'invoiceSmallBold',
                      margin: [0, 0, 0, 22],
                    },
                    {
                      text: 'Sign:',
                      style: 'invoiceSmallBold',
                      margin: [0, 0, 0, 22],
                    },
                  ],
                ],
              },
              layout: invoiceTableLayout,
              margin: [0, 0, 0, 10],
            },
          ]
        : []),
    ];

    const uploads = await this.addUploads(delivery.uploads);
    content.push(...uploads);

    const data = {
      footer: this.getRentalInvoiceFooter(),
      info: this.getMetaData(`${company.name}-Delivery-${delivery.code}`),
      content,
      styles: stylesCS,
      defaultStyle: {
        ...defaultCS,
        lineHeight: 1.25,
      },
      pageOrientation: 'portrait',
      pageMargins: [32, 28, 32, 46],
    };
    return this.generatePdf(data, company);
  }

  // SITE INVENTORY PDF
  async inventoryList(
    site: Site,
    inventory: InventoryItem[],
    company: Company,
  ) {
    const items = [];
    inventory.forEach((item) => {
      items.push([
        { text: item.code, style: 'h4b', alignment: 'left' },
        {
          text: item.category,
          style: 'h4b',
          alignment: 'left',
        },
        { text: item.name, style: 'h4b', alignment: 'left' },
        { text: item.availableQty, style: 'h4b', alignment: 'center' },
      ]);
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', '*', 'auto'],

        body: [
          [
            { text: 'Code', style: 'h4b', alignment: 'left' },
            {
              text: 'Category',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Total Qty', style: 'h4b', alignment: 'center' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
    };
    const data = {
      footer: await this.getFooter(),
      // info: this.getMetaData(`${site.code}-${site.name}-Inventory List`),
      content: [
        await this.getHeader(
          'Inventory List',
          site.code,
          site.name,
          new Date(),
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [],
        ),
        hr,
        summary,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data, company);
  }

  // INVENTORY MATRIX PDF
  async inventoryMatrix(
    company: Company,
    matrix: any[], // Data transformed from downloadMasterlistMatrix
    sites: any[], // Array of all unique site addresss
  ) {
    const items = [];

    // Generate the table rows dynamically
    matrix.forEach((matrixCell) => {
      const item = matrixCell.item;
      const site = matrixCell.site;

      // Check if the item row already exists
      let row = items.find((r) => r[0].text === item.code);

      if (!row) {
        // Create a new row if not found
        row = [
          { text: item.code, style: 'h4b', alignment: 'left' },
          { text: item.category, style: 'h4b', alignment: 'left' },
          { text: item.name, style: 'h4b', alignment: 'left' },
          ...sites.map(() => ({
            text: '0',
            style: 'h4b',
            alignment: 'center',
          })), // Add a placeholder '0' for each site
        ];
        items.push(row);
      }

      // Find the index of the site in the row and add the quantity
      const siteIndex = sites.indexOf(site);
      if (siteIndex !== -1) {
        row[3 + siteIndex] = {
          text: matrixCell.availableQty.toString(),
          style: 'h4b',
          alignment: 'center',
        };
      }
    });

    // Build the table headers
    const headers = [
      { text: 'Code', style: 'h4b', alignment: 'left' },
      { text: 'Category', style: 'h4b', alignment: 'left' },
      { text: 'Name', style: 'h4b', alignment: 'left' },
      ...sites.map((site) => ({
        text: site.name,
        style: 'h4b',
        alignment: 'center',
      })),
    ];

    // Define the summary table
    const summary = {
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', ...sites.map(() => 'auto')],
        body: [headers, ...items],
      },
      layout: tLayout,
    };

    // Prepare the PDF data
    const data = {
      footer: await this.getFooter(),
      content: [
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*', '*', '*'],

            body: [
              [
                { text: 'Master Site Inventory', style: 'header', colSpan: 2 },
                '',
                {
                  colSpan: 2,
                  width: 100,
                  image: await this.getBase64ImageFromURL(
                    company.logoUrl.length > 0
                      ? company.logoUrl
                      : 'assets/icon/default.webp',
                    400,
                    300,
                    0.8,
                  ),
                  alignment: 'right',
                },
                '',
              ],
            ],
          },
          layout: 'noBorders',
        },
        hr,
        summary,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
    };

    // Generate the PDF
    return this.generatePdf(data, company);
  }

  // SITE INVENTORY PDF
  async inventoryTransactionList(
    site: Site,
    inventory: TransactionItem[],
    company: Company,
  ) {
    const items = [];
    inventory.forEach((item, i) => {
      // Calculate total returns (regular + overage)
      const totalReturns =
        (item.returnTotal || 0) + (item.overageReturnTotal || 0);

      items.push([
        { text: i + 1, style: 'h4b', alignment: 'left' },
        { text: item.code, style: 'h4b', alignment: 'left' },
        { text: item.name, style: 'h4b', alignment: 'left' },
        {
          text: item.weight ? `${item.weight} kg` : 'N/A',
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(item.deliveredQty),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(item.adjustmentTotal),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(item.returnTotal || 0),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(item.overageReturnTotal || 0),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(totalReturns),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(item.balanceQty || 0),
          style: 'h4b',
          alignment: 'center',
        },
      ]);
    });

    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: [
          'auto',
          'auto',
          '*',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
        ],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Code', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Weight', style: 'h4b', alignment: 'center' },
            { text: 'Delivered', style: 'h4b', alignment: 'center' },
            { text: 'Adjusted', style: 'h4b', alignment: 'center' },
            { text: 'Returned', style: 'h4b', alignment: 'center' },
            { text: 'Overage', style: 'h4b', alignment: 'center' },
            { text: 'Total Ret.', style: 'h4b', alignment: 'center' },
            { text: 'Balance', style: 'h4b', alignment: 'center' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
    };

    const data = {
      footer: await this.getFooter(),
      // info: this.getMetaData(`${site.code}-${site.name}-Inventory List`),
      content: [
        await this.getHeader(
          'Inventory List',
          site.code,
          site.name,
          new Date(),
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [],
        ),
        hr,
        summary,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
    };
    return this.generatePdf(data, company);
  }

  // STOCK LOCATIONS PDF
  async stockLocations(
    item: InventoryItem,
    locations: { site: any; item: InventoryItem }[],
    company: Company,
  ) {
    // Create locations table
    const locationsTable = {
      table: {
        headerRows: 1,
        widths: ['auto', '*', '*', 'auto', 'auto', 'auto'],
        body: [
          // Header row
          [
            { text: 'Site Code', style: 'h4b', alignment: 'left' },
            { text: 'Site Address', style: 'h4b', alignment: 'left' },
            { text: 'Customer', style: 'h4b', alignment: 'left' },
            { text: 'Item Code', style: 'h4b', alignment: 'center' },
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Available Qty', style: 'h4b', alignment: 'center' },
          ],
          // Data rows
          ...locations.map((location) => [
            { text: location.site.code || 'N/A', style: 'h6' },
            { text: location.site.name || 'N/A', style: 'h6' },
            { text: location.site.customer?.name || 'N/A', style: 'h6' },
            {
              text: location.item.code || 'N/A',
              style: 'h6',
              alignment: 'center',
            },
            { text: location.item.name || 'N/A', style: 'h6' },
            {
              text: location.item.availableQty?.toString() || '0',
              style: 'h6',
              alignment: 'center',
            },
          ]),
        ],
      },
      layout: tLayout,
    };

    // Calculate totals
    const totalAvailableQty = locations.reduce(
      (sum, location) => sum + (location.item.availableQty || 0),
      0,
    );

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Stock-Locations-${item.code}`),
      content: [
        await this.getHeader(
          'Item Locations Report',
          item.code,
          'Stock Locations',
          new Date(),
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          undefined,
          [
            [
              { text: 'Total Locations:', style: 'h6b' },
              `${locations.length}`,
              '',
              '',
            ],
          ],
        ),
        hr,
        // Item summary table
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto'],
            body: [
              [
                { text: 'Item Code', style: 'h4b', alignment: 'left' },
                { text: 'Name', style: 'h4b', alignment: 'left' },
                { text: 'Total Qty', style: 'h4b', alignment: 'center' },
                { text: 'Available Qty', style: 'h4b', alignment: 'center' },
              ],
              [
                { text: item.code, style: 'h6' },
                { text: item.name, style: 'h6' },
                {
                  text: item.yardQty?.toString() || '0',
                  style: 'h6',
                  alignment: 'center',
                },
                {
                  text: this.calcPipe.transform(item)?.toString() || '0',
                  style: 'h6',
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: tLayout,
          margin: [0, 0, 0, 20],
        },
        // Locations section
        {
          text: 'Location Details',
          style: 'h2',
          alignment: 'left',
          margin: [0, 10, 0, 10],
        },
        locationsTable,
        hr,
        // Summary section
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Total Locations', style: 'h4b', alignment: 'left' },
                {
                  text: locations.length.toString(),
                  style: 'h4b',
                  alignment: 'right',
                },
              ],
              [
                {
                  text: 'Total Available Quantity',
                  style: 'h4b',
                  alignment: 'left',
                },
                {
                  text: totalAvailableQty.toString(),
                  style: 'h4b',
                  alignment: 'right',
                },
              ],
            ],
          },
          layout: tLayout,
          margin: [0, 10, 0, 10],
        },
        {
          text: `Generated on ${this.toDate(new Date())}`,
          style: 'h6G',
          alignment: 'center',
          margin: [0, 20, 0, 0],
        },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };

    return this.generatePdf(data, company);
  }

  // DELIVERY PICKLIST PDF
  async pickList(
    docData: Delivery | any,
    inventory: InventoryItem[],
    company: Company,
  ) {
    const items = [];
    inventory.forEach((item) => {
      items.push([
        { text: item.code, style: 'h4b', alignment: 'left' },
        {
          text: item.category,
          style: 'h4b',
          alignment: 'left',
        },
        { text: item.name, style: 'h4b', alignment: 'left' },
        {
          text: this.decimalPipe.transform(
            (+item?.weight || 0) * (+item?.shipmentQty || 0),
          ),
          style: 'h4b',
          alignment: 'center',
        },
        { text: item.shipmentQty, style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
      ]);
    });
    const blankCell = (alignment = 'left') => ({
      text: '',
      style: 'h4b',
      alignment,
      margin: [0, 8, 0, 8],
    });
    const blankRow = () => [
      blankCell('left'),
      blankCell('left'),
      blankCell('left'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
    ];
    items.push(blankRow(), blankRow());
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],

        body: [
          [
            { text: 'Code', style: 'h4b', alignment: 'left' },
            {
              text: 'Category',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Weight', style: 'h4b', alignment: 'left' },
            { text: 'Qty Needed', style: 'h4b', alignment: 'center' },
            { text: 'Picked Qty', style: 'h4b', alignment: 'center' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
    };

    const itemCount = inventory.reduce(
      (acc, item) => acc + item.shipmentQty,
      0,
    );
    // Handle DD-MM-YYYY format
    let expectedDeliveryDate = null;
    if (docData?.endDate) {
      if (typeof docData.endDate === 'string') {
        const parts = docData.endDate.split('-');
        if (parts.length === 3) {
          expectedDeliveryDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        }
      } else {
        expectedDeliveryDate = this.dateFormatPipe.transform(docData.endDate);
      }
    }
    const data = {
      footer: await this.getFooter(),
      // info: this.getMetaData(`${site.code}-${site.name}-Inventory List`),
      content: [
        {
          text: `Expected Delivery Date: ${
            expectedDeliveryDate
              ? this.datePipe.transform(expectedDeliveryDate, 'longDate')
              : 'N/A'
          }`,
          style: ['h4b'],
        },
        await this.getHeader(
          `Picklist - JR - ${docData.jobReference}`,
          docData.code,
          docData.site.name,
          new Date(),
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [
            // [
            //   { text: 'Site Code', style: 'h6b' },
            //   `${docData?.site.code || 'N/A'}`,
            //   '',
            //   '',
            // ],
          ],
        ),
        hr,
        {
          text: 'Project Notes',
          style: ['h4b'],
        },
        { text: docData.notes },
        hr,
        summary,
        hr,
        {
          text: `Total Items: ${itemCount}`,
          style: 'h3',
          alignment: 'right',
        },
        {
          text: `Total Weight : ${this.weightPipe.transform(
            docData.items,
            true,
          )}`,
          style: ['h3', 'mt3'],
          alignment: 'right',
        },
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  text: 'Load Prepared By: ',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'Name:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'Date:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'Sign:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'I have confirmed all quantities picked are correct:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
            ],
          },
          layout: tLayout,
        },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data, company);
  }

  // RETURN PICKLIST PDF

  async returnPickList(
    docData: Delivery | TransactionReturn,
    inventory: InventoryItem[] | TransactionItem[],
    company: Company,
  ) {
    const items = [];
    const blankCell = (alignment = 'left') => ({
      text: '',
      style: 'h4b',
      alignment,
      margin: [0, 8, 0, 8],
    });
    const blankRow = () => [
      blankCell('left'),
      blankCell('left'),
      blankCell('left'),
      blankCell('left'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
      blankCell('center'),
    ];
    inventory.forEach((item) => {
      items.push([
        { text: item.code, style: 'h4b', alignment: 'left' },
        {
          text: item.category,
          style: 'h4b',
          alignment: 'left',
        },
        { text: item.name, style: 'h4b', alignment: 'left' },
        { text: item.location, style: 'h4b', alignment: 'left' },
        { text: item.balanceQty, style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
      ]);
    });
    items.push(blankRow(), blankRow());

    const damageRows = Array.from({ length: 4 }, () => [
      { text: '', style: 'h4b', alignment: 'left', margin: [0, 8, 0, 8] },
      { text: '', style: 'h4b', alignment: 'left', margin: [0, 8, 0, 8] },
      { text: '', style: 'h4b', alignment: 'center', margin: [0, 8, 0, 8] },
      { text: '', style: 'h4b', alignment: 'left', margin: [0, 8, 0, 8] },
    ]);

    const damageSection = {
      table: {
        headerRows: 2,
        widths: ['auto', '*', 'auto', '*'],
        body: [
          [
            {
              text: 'Damage / Writeoffs',
              style: 'h4b',
              alignment: 'left',
              colSpan: 4,
            },
            {},
            {},
            {},
          ],
          [
            { text: 'Cost', style: 'h4b', alignment: 'left' },
            { text: 'Item', style: 'h4b', alignment: 'left' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Details of damage', style: 'h4b', alignment: 'left' },
          ],
          ...damageRows,
        ],
      },
      layout: tLayout,
      margin: [0, 12, 0, 0],
    };
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: [
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
        ],

        body: [
          [
            { text: 'Code', style: 'h4b', alignment: 'left' },
            {
              text: 'Category',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Location', style: 'h4b', alignment: 'left' },
            { text: 'Site Avail Qty', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
    };
    const data = {
      footer: await this.getFooter(),
      // info: this.getMetaData(`${site.code}-${site.name}-Inventory List`),
      content: [
        await this.getHeader(
          `Return Count Sheet - JR - ${docData.jobReference}`,
          docData.code,
          docData.site.name,
          new Date(),
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [
            [
              { text: 'Site Code', style: 'h6b' },
              `${docData?.site.code || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Job Reference', style: 'h6b' },
              `${docData?.jobReference || 'N/A'}`,
              '',
              '',
            ],
          ],
        ),
        hr,
        summary,
        hr,
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  text: 'Return Processed By: ',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'Name:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'Date:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'Sign:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'I have confirmed all quantities returned are correct:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
            ],
          },
          layout: tLayout,
        },
        hr,
        damageSection,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'portrait',
    };
    return this.generatePdf(data, company);
  }

  // RETURN INVENTORY PDF
  async returnDoc(
    returnDoc: TransactionReturn,
    company: Company,
    terms: Term | null,
  ) {
    const summary = this.createTransactionReturnTable(returnDoc.items, false);
    const damageItems =
      returnDoc.items?.filter((item) => (item.damagedQty || 0) > 0) || [];
    const overageItems = returnDoc.overageItems || [];
    const content: any[] = [
      await this.getLogisticsHeaderBlock('RETURN NOTE', company, [
        ['Docket Reference', returnDoc.code || 'N/A'],
        ['Site Address', returnDoc.site?.name || 'N/A'],
        ['Date Issued', this.toDate(returnDoc.returnDate)],
        ['Driver', returnDoc.driverName || 'N/A'],
        ['Driver Contact', returnDoc.driverNo || 'N/A'],
        ['Vehicle Reg', returnDoc.vehicleReg || 'N/A'],
      ]),
      this.getDeliveryPartyBlock(company, returnDoc.site.customer),
      this.getInvoiceSectionHeader('Returned Items'),
      summary,
      this.getLogisticsSummaryBlock([
        [
          'Total Weight',
          this.weightPipe.transform(returnDoc.items, false, false, false, true),
        ],
      ]),
    ];

    if (damageItems.length > 0) {
      content.push(
        this.getInvoiceSectionHeader('Damaged Items'),
        this.createInvoiceTable(
          [
            { text: 'Code', style: 'h5b' },
            { text: 'Name', style: 'h5b' },
            { text: 'Damaged Qty', style: 'h5b', alignment: 'right' },
          ],
          damageItems.map((item) => [
            { text: item.code || 'N/A', style: 'h6' },
            { text: item.name || 'N/A', style: 'h6' },
            {
              text: this.decimalPipe.transform(+(item.damagedQty || 0)),
              style: 'h6',
              alignment: 'right',
            },
          ]),
          ['auto', '*', 'auto'],
        ),
      );
    }

    if (overageItems.length > 0) {
      content.push(
        this.getInvoiceSectionHeader('Overage Items'),
        this.createInvoiceTable(
          [
            { text: 'Code', style: 'h5b' },
            { text: 'Name', style: 'h5b' },
            { text: 'Category', style: 'h5b' },
            { text: 'Location', style: 'h5b' },
            { text: 'Overage Qty', style: 'h5b' },
            { text: 'Weight (kg)', style: 'h5b' },
          ],
          overageItems.map((item) => [
            { text: item.code || 'N/A', style: 'h6' },
            { text: item.name || 'N/A', style: 'h6' },
            { text: item.category || 'N/A', style: 'h6' },
            { text: item.location || 'N/A', style: 'h6' },
            {
              text: item.shipmentQty?.toString() || '0',
              style: 'h6',
              alignment: 'right',
            },
            {
              text: item.weight?.toString() || '0',
              style: 'h6',
              alignment: 'right',
            },
          ]),
          ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
        ),
        this.getLogisticsSummaryBlock([
          [
            'Total Overage Weight',
            `${overageItems
              .reduce((sum, item) => sum + (item.weight || 0), 0)
              .toFixed(2)} kg`,
          ],
        ]),
      );
    }

    content.push(
      this.getInvoiceSectionHeader('Return Confirmation'),
      this.getDocumentConfirmationBlock(
        'Return Processed By:',
        'I have confirmed all quantities returned are correct:',
      ),
    );

    const uploads = await this.addUploads(returnDoc.uploads);
    content.push(...uploads);

    const data = {
      footer: this.getRentalInvoiceFooter(),
      info: this.getMetaData(`${company.name}-Return-${returnDoc.code}`),
      content,
      styles: stylesCS,
      defaultStyle: {
        ...defaultCS,
        lineHeight: 1.25,
      },
      pageOrientation: 'portrait',
      pageMargins: [32, 28, 32, 46],
    };
    return this.generatePdf(data, company);
  }

  async transferDoc(
    transferDoc: Transfer,
    company: Company,
    terms: Term | null,
  ) {
    const summary = this.createTransactionReturnTable(transferDoc.items);
    const transferDate = transferDoc?.transferDate
      ? transferDoc.transferDate.seconds
        ? new Date(transferDoc.transferDate.seconds * 1000).toLocaleDateString()
        : new Date(transferDoc.transferDate).toLocaleDateString()
      : 'N/A';
    const content: any[] = [
      await this.getLogisticsHeaderBlock('TRANSFER NOTE', company, [
        ['Docket Reference', transferDoc.code || 'N/A'],
        ['Site Address', transferDoc.fromSite?.code || 'N/A'],
        ['Date Issued', this.toDate(transferDoc.date)],
        ['Transfer Date', transferDate],
        ['From Job Reference', transferDoc.fromJobReference || 'N/A'],
        ['To Job Reference', transferDoc.toJobReference || 'N/A'],
        ['Created By', transferDoc.createdByName || 'N/A'],
      ]),
      this.getDeliveryPartyBlock(
        transferDoc.toSite?.customer,
        transferDoc.fromSite?.customer,
      ),
      this.getInvoiceSectionHeader('Transfer Notes'),
      {
        text: transferDoc.notes || '',
        style: 'invoiceSmall',
        margin: [8, 2, 8, 10],
      },
      this.getInvoiceSectionHeader('Transferred Items'),
      summary,
      this.getLogisticsSummaryBlock([
        ['Status', transferDoc.status || 'N/A'],
        [
          'Total Weight',
          this.weightPipe.transform(
            transferDoc.items,
            false,
            false,
            false,
            true,
          ),
        ],
      ]),
    ];

    const uploads = await this.addUploads(transferDoc.uploads);
    content.push(...uploads);

    const data = {
      footer: this.getRentalInvoiceFooter(),
      info: this.getMetaData(`${company.name}-Transfer-${transferDoc.code}`),
      content,
      styles: stylesCS,
      defaultStyle: {
        ...defaultCS,
        lineHeight: 1.25,
      },
      pageOrientation: 'portrait',
      pageMargins: [32, 28, 32, 46],
    };
    return this.generatePdf(data, company);
  }

  async overReturnDoc(
    overReturnDoc: TransactionReturn,
    company: Company,
    terms: Term | null,
  ) {
    const signature1 = overReturnDoc.signature
      ? {
          image: await this.getBase64ImageFromURL(
            overReturnDoc.signature,
            300,
            200,
            0.6,
            true,
          ),
          width: 100,
          alignment: 'right',
        }
      : {
          text: 'Needs Signature',
          style: 'h4b',
          alignment: 'Right',
          color: 'red',
        };
    const signature2 = overReturnDoc.signature2
      ? {
          image: await this.getBase64ImageFromURL(
            overReturnDoc.signature2,
            300,
            200,
            0.6,
            true,
          ),
          width: 100,
          alignment: 'right',
        }
      : {
          text: 'Needs Signature',
          style: 'h4b',
          alignment: 'Right',
          color: 'red',
        };

    // Create overage items table - this is the main content for over returns
    const overageSection =
      overReturnDoc.overageItems && overReturnDoc.overageItems.length > 0
        ? [
            {
              text: 'Over Return Items',
              style: 'h2',
              alignment: 'left',
              margin: [0, 10, 0, 5],
            },
            {
              table: {
                headerRows: 1,
                widths: overReturnDoc.isReversal
                  ? ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto']
                  : [
                      'auto',
                      '*',
                      'auto',
                      'auto',
                      'auto',
                      'auto',
                      'auto',
                      'auto',
                      'auto',
                    ],
                body: [
                  // Header row
                  overReturnDoc.isReversal
                    ? [
                        { text: 'Code', style: 'h5b' },
                        { text: 'Name', style: 'h5b' },
                        { text: 'Category', style: 'h5b' },
                        { text: 'Size', style: 'h5b' },
                        { text: 'Location', style: 'h5b' },
                        { text: 'Weight (kg)', style: 'h5b' },
                        { text: 'Return Qty', style: 'h5b' },
                      ]
                    : [
                        { text: 'Code', style: 'h5b' },
                        { text: 'Name', style: 'h5b' },
                        { text: 'Category', style: 'h5b' },
                        { text: 'Size', style: 'h5b' },
                        { text: 'Location', style: 'h5b' },
                        { text: 'Weight (kg)', style: 'h5b' },
                        { text: 'Overage Qty', style: 'h5b' },
                        { text: 'Reversed Qty', style: 'h5b' },
                        { text: 'Balance', style: 'h5b' },
                      ],
                  // Data rows
                  ...overReturnDoc.overageItems.map((item) =>
                    overReturnDoc.isReversal
                      ? [
                          { text: item.code || 'N/A', style: 'h6' },
                          { text: item.name || 'N/A', style: 'h6' },
                          { text: item.category || 'N/A', style: 'h6' },
                          { text: item.size || 'N/A', style: 'h6' },
                          { text: item.location || 'N/A', style: 'h6' },
                          {
                            text: item.weight?.toString() || '0',
                            style: 'h6',
                            alignment: 'right',
                          },
                          {
                            text: item.returnQty?.toString() || '0',
                            style: 'h6',
                            alignment: 'right',
                          },
                        ]
                      : [
                          { text: item.code || 'N/A', style: 'h6' },
                          { text: item.name || 'N/A', style: 'h6' },
                          { text: item.category || 'N/A', style: 'h6' },
                          { text: item.size || 'N/A', style: 'h6' },
                          { text: item.location || 'N/A', style: 'h6' },
                          {
                            text: item.weight?.toString() || '0',
                            style: 'h6',
                            alignment: 'right',
                          },
                          {
                            text: item.shipmentQty?.toString() || '0',
                            style: 'h6',
                            alignment: 'right',
                          },
                          {
                            text: item.reversedQty?.toString() || '0',
                            style: 'h6',
                            alignment: 'right',
                          },
                          {
                            text: item.overageBalanceQty?.toString() || '0',
                            style: 'h6',
                            alignment: 'right',
                          },
                        ],
                  ),
                ],
              },
              layout: tLayout,
              margin: [0, 5, 0, 10],
            },
            {
              text: `Total Over Return Weight: ${overReturnDoc.overageItems
                .reduce((sum, item) => {
                  const qty = overReturnDoc.isReversal
                    ? item.returnQty || 0
                    : item.overageBalanceQty || 0;
                  return sum + qty * (item.weight || 0);
                }, 0)
                .toFixed(2)} kg`,
              style: 'h3',
              alignment: 'right',
              margin: [0, 5, 0, 0],
            },
          ]
        : [
            {
              text: 'No over return items found',
              style: 'h4',
              alignment: 'center',
              margin: [0, 20, 0, 20],
              color: 'red',
            },
          ];

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(
        `${company.name}-OverReturn-${overReturnDoc.code}`,
      ),
      content: [
        await this.getHeader(
          'Over Return Note',
          overReturnDoc.code,
          overReturnDoc.site.name,
          overReturnDoc.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [
            [
              { text: 'Site Address', style: 'h6b' },
              `${overReturnDoc?.site.name || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Driver:', style: 'h6b' },
              `${overReturnDoc?.driverName || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Driver Contact:', style: 'h6b' },
              `${overReturnDoc?.driverNo || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Vehicle Reg:', style: 'h6b' },
              `${overReturnDoc?.vehicleReg || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Return Date:', style: 'h6b' },
              `${overReturnDoc?.returnDate || 'N/A'}`,
              '',
              '',
            ],
          ],
        ),
        hr,
        this.getCompanyInfo(company, overReturnDoc.site.customer),
        hr,
        ...overageSection, // Main content - over return items
        hr,
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              [
                {
                  text: 'Status',
                  style: 'h4b',
                  alignment: 'left',
                },
                {
                  text: overReturnDoc.status,
                  style: 'h4b',
                  alignment: 'center',
                },
              ],
              [
                {
                  text: `Sent By ${overReturnDoc?.signedBy || 'N/A'}`,
                  style: 'h4b',
                  alignment: 'left',
                },
                signature1,
              ],
              [
                {
                  text: `Received By ${overReturnDoc?.signedBy2 || 'N/A'}`,
                  style: 'h4b',
                  alignment: 'left',
                },
                signature2,
              ],
            ],
          },
          layout: tLayout,
        },

        await this.addUploads(overReturnDoc.uploads),
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'portrait',
    };
    return this.generatePdf(data, company);
  }

  async overReturnedItemsReport(
    returns: TransactionReturn[],
    company: Company,
    terms: Term | null,
  ) {
    // Filter returns that have overage items
    const returnsWithOverage = returns.filter(
      (returnDoc) =>
        returnDoc.overageItems && returnDoc.overageItems.length > 0,
    );

    // Collect all overage items with return information
    const allOverageItems: any[] = [];
    returnsWithOverage.forEach((returnDoc) => {
      returnDoc.overageItems.forEach((item) => {
        allOverageItems.push({
          ...item,
          returnCode: returnDoc.code,
          returnDate: returnDoc.returnDate,
          siteName: returnDoc.site.name,
          customerName: returnDoc.site.customer?.name,
          jobReference: returnDoc.jobReference,
          driverName: returnDoc.driverName,
        });
      });
    });

    // Calculate totals
    const totalOverageQty = allOverageItems.reduce(
      (sum, item) => sum + (item.shipmentQty || 0),
      0,
    );
    const totalOverageWeight = allOverageItems.reduce(
      (sum, item) => sum + (item.shipmentQty || 0) * (item.weight || 0),
      0,
    );
    const totalOverageValue = allOverageItems.reduce(
      (sum, item) => sum + (item.shipmentQty || 0) * (item.hireCost || 0),
      0,
    );

    // Create overage items table
    const overageTableBody: any = [
      // Header row
      [
        { text: 'Return Code', style: 'h6b', alignment: 'center' },
        { text: 'Return Date', style: 'h6b', alignment: 'center' },
        { text: 'Site Address', style: 'h6b', alignment: 'center' },
        { text: 'Item Code', style: 'h6b', alignment: 'center' },
        { text: 'Item Name', style: 'h6b', alignment: 'center' },
        { text: 'Category', style: 'h6b', alignment: 'center' },
        { text: 'Size', style: 'h6b', alignment: 'center' },
        { text: 'Location', style: 'h6b', alignment: 'center' },
        { text: 'Over Qty', style: 'h6b', alignment: 'center' },
        { text: 'Weight (ea)', style: 'h6b', alignment: 'center' },
        { text: 'Total Weight', style: 'h6b', alignment: 'center' },
        { text: 'Hire Cost', style: 'h6b', alignment: 'center' },
      ],
    ];

    // Add data rows
    allOverageItems.forEach((item) => {
      const totalWeight = (item.shipmentQty || 0) * (item.weight || 0);
      overageTableBody.push([
        { text: item.returnCode || 'N/A', style: 'h6' },
        { text: item.returnDate || 'N/A', style: 'h6' },
        { text: item.siteName || 'N/A', style: 'h6' },
        { text: item.code || 'N/A', style: 'h6' },
        { text: item.name || 'N/A', style: 'h6' },
        { text: item.category || 'N/A', style: 'h6' },
        { text: item.size || 'N/A', style: 'h6' },
        { text: item.location || 'N/A', style: 'h6' },
        {
          text: (item.shipmentQty || 0).toString(),
          style: 'h6',
          alignment: 'center',
        },
        {
          text: Number(item.weight || 0).toFixed(2),
          style: 'h6',
          alignment: 'center',
        },
        { text: totalWeight.toFixed(2), style: 'h6', alignment: 'center' },
        {
          text: `${company.currency?.symbol || '$'}${(
            item.hireCost || 0
          ).toFixed(2)}`,
          style: 'h6',
          alignment: 'center',
        },
      ]);
    });

    const currentDate = new Date().toISOString().split('T')[0];

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-OverageReport-${currentDate}`),
      content: [
        await this.getHeader(
          'Over-Returned Items Report',
          `Generated: ${currentDate}`,
          `${returnsWithOverage.length} Returns with Overage`,
          currentDate,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [
            [
              { text: 'Total Returns Processed:', style: 'h6b' },
              `${returns.length}`,
              '',
              '',
            ],
            [
              { text: 'Returns with Overage:', style: 'h6b' },
              `${returnsWithOverage.length}`,
              '',
              '',
            ],
            [
              { text: 'Total Overage Items:', style: 'h6b' },
              `${allOverageItems.length}`,
              '',
              '',
            ],
            [
              { text: 'Report Generated:', style: 'h6b' },
              `${new Date().toLocaleString()}`,
              '',
              '',
            ],
          ],
        ),

        {
          text: 'OVER-RETURNED ITEMS SUMMARY',
          style: 'h2b',
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        {
          text: `Analysis of ${allOverageItems.length} over-returned items from ${returnsWithOverage.length} return transactions`,
          style: 'h4',
          alignment: 'center',
          margin: [0, 0, 0, 15],
        },
        // Overage items table
        {
          table: {
            headerRows: 1,
            widths: [
              'auto',
              'auto',
              '*',
              'auto',
              '*',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
            ],
            body: overageTableBody,
          },
          layout: tLayout,
          margin: [0, 10, 0, 10],
        },
        hr,
        // Summary totals table
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'SUMMARY TOTALS', style: 'h4b', alignment: 'center' },
                { text: 'Quantity', style: 'h4b', alignment: 'center' },
                { text: 'Weight', style: 'h4b', alignment: 'center' },
                { text: 'Value', style: 'h4b', alignment: 'center' },
              ],
              [
                { text: 'Total Over-Returned Items', style: 'h4b' },
                {
                  text: totalOverageQty.toString(),
                  style: 'h4',
                  alignment: 'center',
                },
                {
                  text: `${totalOverageWeight.toFixed(2)} ${
                    company.mass?.symbol || 'kg'
                  }`,
                  style: 'h4',
                  alignment: 'center',
                },
                {
                  text: `${
                    company.currency?.symbol || '$'
                  }${totalOverageValue.toFixed(2)}`,
                  style: 'h4',
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: tLayout,
          margin: [0, 10, 0, 10],
        },
        // Action required section
        {
          text: 'ACTION REQUIRED',
          style: 'h3b',
          alignment: 'center',
          margin: [0, 20, 0, 10],
          color: 'red',
        },
        {
          ul: [
            'Review all over-returned items listed above by return code',
            'Verify quantities and condition of returned items at each location',
            'Update inventory records for over-returned items in system',
            'Process any necessary adjustments or credits for affected customers',
            'Contact site managers if clarification is needed for specific returns',
            'Investigate patterns in over-returns to prevent future occurrences',
          ],
          margin: [20, 0, 0, 10],
          style: 'h5',
        },
        // Processing checklist
        {
          text: 'PROCESSING CHECKLIST',
          style: 'h4b',
          margin: [0, 15, 0, 5],
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto'],
            body: [
              [
                { text: '☐', style: 'h4b', alignment: 'center' },
                {
                  text: 'All overage items physically verified and counted',
                  style: 'h5',
                },
                { text: 'Date: ________', style: 'h6' },
              ],
              [
                { text: '☐', style: 'h4b', alignment: 'center' },
                {
                  text: 'Inventory system updated with overage quantities',
                  style: 'h5',
                },
                { text: 'Date: ________', style: 'h6' },
              ],
              [
                { text: '☐', style: 'h4b', alignment: 'center' },
                {
                  text: 'Customer notifications sent for significant overages',
                  style: 'h5',
                },
                { text: 'Date: ________', style: 'h6' },
              ],
              [
                { text: '☐', style: 'h4b', alignment: 'center' },
                {
                  text: 'Credits/adjustments processed as required',
                  style: 'h5',
                },
                { text: 'Date: ________', style: 'h6' },
              ],
              [
                { text: '☐', style: 'h4b', alignment: 'center' },
                {
                  text: 'Report reviewed and approved by supervisor',
                  style: 'h5',
                },
                { text: 'Date: ________', style: 'h6' },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 5, 0, 10],
        },
        // Signature section
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  text: 'Processed By:',
                  style: 'h4b',
                  alignment: 'left',
                },
                {
                  text: 'Reviewed By:',
                  style: 'h4b',
                  alignment: 'left',
                },
                {
                  text: 'Date Completed:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: '____________________',
                  style: 'h4',
                  alignment: 'left',
                  margin: [0, 20, 0, 0],
                },
                {
                  text: '____________________',
                  style: 'h4',
                  alignment: 'left',
                  margin: [0, 20, 0, 0],
                },
                {
                  text: '____________________',
                  style: 'h4',
                  alignment: 'left',
                  margin: [0, 20, 0, 0],
                },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 20, 0, 0],
        },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
    };

    return this.generatePdf(data, company);
  }

  async masterInventoryList(
    inventory: InventoryItem[],
    location: string,
    company: Company,
  ) {
    const items = [];
    inventory.forEach((item) => {
      items.push([
        { text: item.code, style: 'h4b', alignment: 'left' },
        { text: item.category, style: 'h4b', alignment: 'left' },
        { text: item.size, style: 'h4b', alignment: 'left' },
        { text: item.name, style: 'h4b', alignment: 'left' },
        { text: item.location, style: 'h4b', alignment: 'left' },
        {
          text: this.decimalPipe.transform(item.yardQty),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(this.calcPipe.transform(item)),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(item.inUseQty),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(item.reservedQty),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(item.inMaintenanceQty),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(item.damagedQty),
          style: 'h4b',
          alignment: 'center',
        },
        {
          text: this.decimalPipe.transform(item.lostQty),
          style: 'h4b',
          alignment: 'center',
        },
      ]);
    });

    // Optimize column widths based on content
    const summary = {
      table: {
        headerRows: 1,
        // Adjust column widths - use percentages and smaller widths for numeric columns
        widths: [
          '7%', // Code
          '10%', // Category
          '6%', // Size
          '20%', // Name (flexible with *)
          '10%', // Location
          '7%', // Total Qty
          '7%', // Available Qty
          '7%', // In Use Qty
          '7%', // Reserved Qty
          '7%', // Maintenance Qty
          '6%', // Damaged Qty
          '6%', // Lost Qty
        ],

        body: [
          [
            { text: 'Code', style: 'h4b', alignment: 'left' },
            { text: 'Category', style: 'h4b', alignment: 'left' },
            { text: 'Size', style: 'h4b', alignment: 'left' },
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Location', style: 'h4b', alignment: 'left' },
            { text: 'Total', style: 'h4b', alignment: 'center' }, // Shortened header text
            { text: 'Available', style: 'h4b', alignment: 'center' }, // Shortened header text
            { text: 'In Use', style: 'h4b', alignment: 'center' }, // Shortened header text
            { text: 'Reserved', style: 'h4b', alignment: 'center' }, // Shortened header text
            { text: 'Maint.', style: 'h4b', alignment: 'center' }, // Shortened header text
            { text: 'Damaged', style: 'h4b', alignment: 'center' }, // Shortened header text
            { text: 'Lost', style: 'h4b', alignment: 'center' }, // Shortened header text
          ],
          ...items,
          [
            {
              text: 'Total Weight',
              style: 'h4b',
              alignment: 'right',
              colSpan: 6,
            },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            {
              text: this.weightPipe.transform(inventory),
              style: 'h4b',
              alignment: 'left',
              colSpan: 6,
            },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
          ],
        ],
      },
      layout: tLayout,
    };

    // Add margins to ensure content fits within page bounds
    const data = {
      footer: await this.getFooter(),
      content: [
        await this.getHeader(
          'Master Inventory List',
          company.name,
          location,
          new Date(),
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [],
        ),
        hr,
        summary,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
      // Add explicit page margins to give more space
      pageMargins: [15, 40, 15, 40], // [left, top, right, bottom]
    };

    return this.generatePdf(data, company);
  }

  async inventoryCountSheet(inventory: InventoryItem[], company: Company) {
    const blankCell = (alignment = 'center') => ({
      text: '',
      style: 'h4b',
      alignment,
      margin: [0, 8, 0, 8],
    });
    const blankRow = () => [
      blankCell('left'),
      blankCell('left'),
      blankCell('left'),
      blankCell('left'),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
    ];
    const items = inventory.map((item) => [
      { text: item.code || '', style: 'h4b', alignment: 'left' },
      { text: item.category || '', style: 'h4b', alignment: 'left' },
      { text: item.name || '', style: 'h4b', alignment: 'left' },
      {
        text: item.location || 'Main Yard',
        style: 'h4b',
        alignment: 'left',
      },
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
      blankCell(),
    ]);
    items.push(blankRow(), blankRow());

    const damageRows = Array.from({ length: 4 }, () => [
      blankCell('left'),
      blankCell('left'),
      blankCell(),
      blankCell('left'),
    ]);
    const damageSection = {
      table: {
        headerRows: 2,
        widths: ['auto', '*', 'auto', '*'],
        body: [
          [
            {
              text: 'Damage / Writeoffs',
              style: 'h4b',
              alignment: 'left',
              colSpan: 4,
            },
            {},
            {},
            {},
          ],
          [
            { text: 'Cost', style: 'h4b', alignment: 'left' },
            { text: 'Item', style: 'h4b', alignment: 'left' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            {
              text: 'Details of damage',
              style: 'h4b',
              alignment: 'left',
            },
          ],
          ...damageRows,
        ],
      },
      layout: tLayout,
      margin: [0, 12, 0, 0],
    };
    const summary = {
      table: {
        headerRows: 1,
        widths: [
          'auto',
          'auto',
          'auto',
          'auto',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
        ],
        body: [
          [
            { text: 'Code', style: 'h4b', alignment: 'left' },
            { text: 'Category', style: 'h4b', alignment: 'left' },
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Location', style: 'h4b', alignment: 'left' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
    };
    const data = {
      footer: await this.getFooter(),
      content: [
        await this.getHeader(
          'Inventory Count Sheet',
          company.name,
          'All Locations',
          new Date(),
          company.logoUrl?.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [],
        ),
        hr,
        summary,
        hr,
        {
          table: {
            headerRows: 1,
            widths: ['*'],
            body: [
              [
                {
                  text: 'Inventory Counted By: ',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'Name:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'Date:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'Sign:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
              [
                {
                  text: 'I have confirmed all inventory quantities counted are correct:',
                  style: 'h4b',
                  alignment: 'left',
                },
              ],
            ],
          },
          layout: tLayout,
        },
        hr,
        damageSection,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'portrait',
      pageMargins: [15, 40, 15, 40],
    };

    return this.generatePdf(data, company);
  }

  // UTILITY FUNCTIONS

  async generatePdf(data, company?: Company) {
    const documentCompany =
      company || this.store.selectSnapshot(CompanyState.company);
    const accentColor = this.getPdfAccentColor(documentCompany);
    this.applyPdfTheme(data, accentColor);
    return pdfMake.createPdf(data);
  }

  private getPdfAccentColor(company?: Company) {
    const color = company?.pdfAccentColor || invoiceTheme.accent;
    return /^#[0-9a-f]{6}$/i.test(color) ? color : invoiceTheme.accent;
  }

  private applyPdfTheme(data: any, accentColor: string) {
    const themeNode = (node: any): any => {
      if (Array.isArray(node)) {
        node.forEach(themeNode);
        return node;
      }

      if (!node || typeof node !== 'object') {
        return node;
      }

      Object.keys(node).forEach((key) => {
        const value = node[key];
        if (typeof value === 'string') {
          node[key] = value.replace(
            new RegExp(invoiceTheme.accent, 'gi'),
            accentColor,
          );
        } else if (typeof value !== 'function') {
          themeNode(value);
        }
      });

      if (
        typeof node.fillColor === 'string' &&
        node.fillColor.toLowerCase() === accentColor.toLowerCase() &&
        node.text
      ) {
        node.color = this.getContrastColor(accentColor);
      }

      return node;
    };

    themeNode(data);

    ['header', 'footer', 'background'].forEach((property) => {
      const renderer = data[property];
      if (typeof renderer === 'function') {
        data[property] = (...args: any[]) => themeNode(renderer(...args));
      }
    });
  }

  private getContrastColor(color: string) {
    const red = parseInt(color.slice(1, 3), 16);
    const green = parseInt(color.slice(3, 5), 16);
    const blue = parseInt(color.slice(5, 7), 16);
    const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
    return luminance >= 150 ? invoiceTheme.text : '#ffffff';
  }

  private async getHeader(
    title: string,
    code: string,
    siteName: string,
    date: any,
    url: string,
    link?: string,
    data?: any,
  ) {
    const company =
      this.store.selectSnapshot(CompanyState.company) ||
      ({ logoUrl: url } as Company);
    const details: Array<[string, any]> = [
      ['Docket Reference', code || 'N/A'],
      ['Site Address', siteName || 'N/A'],
      ...(data || []).map((row) => [
        String(row?.[0]?.text || '').replace(/:$/, ''),
        row?.[1] ?? 'N/A',
      ]),
      ['Date Issued', this.toDate(date)],
    ];

    if (link) {
      details.push([
        'View Online',
        {
          text: 'Click here to view online',
          link,
          color: 'blue',
          decoration: 'underline',
        },
      ]);
    }

    return this.getLogisticsHeaderBlock(title.toUpperCase(), company, details);
  }
  private async getBillingHeader(
    title: string,
    code: string,
    siteName: string,
    date: any,
    company: Company,
    link?: string,
    data?: any,
  ) {
    const details: Array<[string, any]> = [
      ...(data || []).map((row) => [
        String(row?.[0]?.text || '').replace(/:$/, ''),
        row?.[1] ?? 'N/A',
      ]),
      ['Code', code || 'N/A'],
      ['Site Address', siteName || 'N/A'],
      ['Date Issued', this.toDate(date)],
    ];

    if (link) {
      details.push([
        'View Online',
        {
          text: 'Click here to view online',
          link,
          color: 'blue',
          decoration: 'underline',
        },
      ]);
    }

    return this.getLogisticsHeaderBlock(title.toUpperCase(), company, details);
  }

  private getCompanyInfo(
    customer: Customer | Company,
    company: Company | Customer,
  ) {
    const address = {
      style: 'tableExample',

      table: {
        widths: ['auto', '*', 'auto', '*'],
        headerRows: 1,
        // keepWithHeaderRows: 1,
        body: [
          [
            {
              text: 'TO',
              style: 'h5G',
              colSpan: 2,
              alignment: 'left',
            },
            {},
            {
              text: 'FROM',
              style: 'h5G',
              colSpan: 2,
              alignment: 'left',
            },
            {},
          ],
          [
            {
              text: `${customer.name}`,
              style: 'h4',
              colSpan: 2,
              alignment: 'left',
            },
            {},
            {
              text: `${company.name}`,
              style: 'h4',
              colSpan: 2,
              alignment: 'left',
            },
            {},
          ],
          [
            { text: 'Representative:', style: 'h6b' },
            customer?.rep || 'N/A',
            { text: 'Representative:', style: 'h6b' },
            company?.rep || 'N/A',
          ],
          [
            { text: 'Email:', style: 'h6b' },
            customer.email,
            { text: 'Email:', style: 'h6b' },
            company.email,
          ],
          [
            { text: 'Contact No:', style: 'h6b' },
            customer.phone,
            { text: 'Contact No:', style: 'h6b' },
            {
              text: company.phone,
            },
          ],
          [
            { text: 'ABN:', style: 'h6b' },
            customer.abnNumber ? customer.abnNumber : 'N/A',
            { text: 'ABN:', style: 'h6b' },
            company.abnNumber ? company.abnNumber : 'N/A',
          ],

          [
            { text: 'Address:', style: 'h6b' },
            this.getAddress(customer),

            { text: 'Address:', style: 'h6b' },
            this.getAddress(company),
          ],
        ],
      },
      layout: 'noBorders',
    };
    return address;
  }

  private async addUploads(uploads: UploadedFile[]) {
    // Return empty array if uploads is undefined or empty
    if (!uploads || uploads.length === 0) {
      return [];
    }

    const data: any[] = [
      {
        text: 'Attachments',
        style: ['h4b', 'm20'],
      },
    ];

    // Add table listing all uploads with download options
    const tableBody: any = [
      // Table header
      [
        { text: 'File Name', style: 'tableHeader', bold: true },
        { text: 'Type', style: 'tableHeader', bold: true },
        { text: 'Download', style: 'tableHeader', bold: true },
      ],
    ];

    // Add all uploads to the table
    for (const upload of uploads) {
      tableBody.push([
        { text: upload.file || 'Unnamed File' },
        { text: upload.type || 'Unknown' },
        {
          text: 'Download',
          link: upload.downloadUrl,
          color: 'blue',
          decoration: 'underline',
        },
      ]);
    }

    // Add the table to data
    data.push({
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto'],
        body: tableBody,
      },
      margin: [0, 0, 0, 20],
      layout: tLayout,
    });

    // Separate image uploads from other files
    const imageUploads = uploads.filter((upload) =>
      upload.type?.startsWith('image'),
    );

    // Process image uploads with better page break handling
    if (imageUploads.length > 0) {
      // Process images in groups of 3 for landscape layout
      const batchSize = 3;

      for (let i = 0; i < imageUploads.length; i += batchSize) {
        const batch = imageUploads.slice(i, i + batchSize);
        const imageRow: any[] = [];

        // Process each image in the batch
        for (const upload of batch) {
          try {
            const imgObj = {
              stack: [
                {
                  image: await this.getBase64ImageFromURL(
                    upload.downloadUrl,
                    400,
                    300,
                    0.6,
                  ),
                  width: 180, // Reduced width for 3-column landscape layout
                  alignment: 'center',
                  margin: [0, 0, 0, 5],
                },
                {
                  text: upload.file || 'Attachment',
                  style: 'h6',
                  alignment: 'center',
                  margin: [0, 5, 0, 10],
                },
              ],
              margin: [5, 5, 5, 10],
              width: '*',
            };

            imageRow.push(imgObj);
          } catch (error) {
            console.error('Error loading image:', error);
            // Add error placeholder instead of failing
            imageRow.push({
              stack: [
                {
                  text: 'Image not available',
                  style: 'h6',
                  color: 'red',
                  alignment: 'center',
                  margin: [0, 20, 0, 5],
                },
                {
                  text: upload.file || 'Attachment',
                  style: 'h6',
                  alignment: 'center',
                  margin: [0, 5, 0, 10],
                },
              ],
              margin: [5, 5, 5, 10],
              width: '*',
            });
          }
        }

        // Fill remaining slots with empty columns for consistent layout
        while (imageRow.length < 3) {
          imageRow.push({ text: '', width: '*' });
        }

        // Add the row with page break control
        data.push({
          columns: imageRow,
          margin: [0, 0, 0, 10],
          unbreakable: true, // Keep image rows together
          pageBreak: 'auto', // Allow natural page breaks between rows
        });
      }
    }

    return data;
  }

  private async getRentalInvoiceHeaderBlock(
    title: string,
    code: string,
    invoice: TransactionInvoice | SaleInvoice,
    company: Company,
  ) {
    const transactionInvoice = invoice as TransactionInvoice;
    const saleInvoice = invoice as SaleInvoice;
    const siteName =
      transactionInvoice.site?.name ||
      transactionInvoice.site?.code ||
      saleInvoice.estimate?.siteName;
    const detailRows: any[] = [
      [
        { text: 'Invoice No', style: 'invoiceLabel' },
        { text: code || 'N/A', style: 'invoiceValue', alignment: 'right' },
      ],
      [
        { text: 'Job Ref', style: 'invoiceLabel' },
        {
          text: invoice.jobReference || 'N/A',
          style: 'invoiceValue',
          alignment: 'right',
        },
      ],
      [
        { text: 'Issue Date', style: 'invoiceLabel' },
        {
          text: this.toDate(invoice.date, true),
          style: 'invoiceValue',
          alignment: 'right',
        },
      ],
    ];

    if (siteName) {
      detailRows.push([
        { text: 'Site', style: 'invoiceLabel' },
        { text: siteName, style: 'invoiceValue', alignment: 'right' },
      ]);
    }

    const companyDetails = this.getInvoiceContactLines(company);

    return {
      stack: [
        {
          table: {
            widths: ['*', 220],
            body: [
              [
                {
                  stack: [
                    {
                      stack: [await this.getInvoiceLogoNode(company)],
                    },
                    {
                      stack: companyDetails,
                      margin: [0, 4, 0, 0],
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: title,
                      style: 'invoiceTitle',
                      alignment: 'right',
                      margin: [0, 0, 0, 4],
                    },
                    {
                      table: {
                        widths: [58, '*'],
                        body: detailRows,
                      },
                      layout: 'noBorders',
                    },
                  ],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: '',
                  fillColor: invoiceTheme.accent,
                  border: [false, false, false, false],
                },
              ],
            ],
          },
          layout: {
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
          margin: [0, 4, 0, 6],
        },
      ],
    };
  }

  private async getDeliveryHeaderBlock(
    delivery: Delivery,
    company: Company,
    expectedDeliveryDate: Date | null,
  ) {
    const detailRows = [
      [
        { text: 'Docket Reference', style: 'invoiceLabel' },
        {
          text: delivery.code || 'N/A',
          style: 'invoiceValue',
          alignment: 'right',
        },
      ],
      [
        { text: 'Job Reference', style: 'invoiceLabel' },
        {
          text: delivery.jobReference || 'N/A',
          style: 'invoiceValue',
          alignment: 'right',
        },
      ],
      [
        { text: 'Site Address', style: 'invoiceLabel' },
        {
          text: delivery.site?.name || 'N/A',
          style: 'invoiceValue',
          alignment: 'right',
        },
      ],
      [
        { text: 'Date Issued', style: 'invoiceLabel' },
        {
          text: this.toDate(delivery.date),
          style: 'invoiceValue',
          alignment: 'right',
        },
      ],
      [
        { text: 'Expected Delivery', style: 'invoiceLabel' },
        {
          text: expectedDeliveryDate
            ? this.datePipe.transform(expectedDeliveryDate, 'longDate')
            : 'N/A',
          style: 'invoiceValue',
          alignment: 'right',
        },
      ],
    ];

    return {
      stack: [
        {
          table: {
            widths: ['*', 240],
            body: [
              [
                {
                  stack: [
                    await this.getInvoiceLogoNode(company),
                    {
                      stack: this.getInvoiceContactLines(company),
                      margin: [0, 4, 0, 0],
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: 'DELIVERY NOTE',
                      style: 'invoiceTitle',
                      alignment: 'right',
                      margin: [0, 0, 0, 4],
                    },
                    {
                      table: {
                        widths: [92, '*'],
                        body: detailRows,
                      },
                      layout: 'noBorders',
                    },
                  ],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: '',
                  fillColor: invoiceTheme.accent,
                  border: [false, false, false, false],
                },
              ],
            ],
          },
          layout: {
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
          margin: [0, 4, 0, 8],
        },
      ],
    };
  }

  private async getLogisticsHeaderBlock(
    title: string,
    company: Company,
    details: Array<[string, any]>,
  ) {
    return {
      stack: [
        {
          table: {
            widths: ['*', 240],
            body: [
              [
                {
                  stack: [
                    await this.getInvoiceLogoNode(company),
                    {
                      stack: this.getInvoiceContactLines(company),
                      margin: [0, 4, 0, 0],
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: title,
                      style: 'invoiceTitle',
                      alignment: 'right',
                      margin: [0, 0, 0, 4],
                    },
                    {
                      table: {
                        widths: [92, '*'],
                        body: details.map(([label, value]) => [
                          { text: label, style: 'invoiceLabel' },
                          value && typeof value === 'object'
                            ? {
                                ...value,
                                style: value.style || 'invoiceValue',
                                alignment: value.alignment || 'right',
                              }
                            : {
                                text: value ?? 'N/A',
                                style: 'invoiceValue',
                                alignment: 'right',
                              },
                        ]),
                      },
                      layout: 'noBorders',
                    },
                  ],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  text: '',
                  fillColor: invoiceTheme.accent,
                  border: [false, false, false, false],
                },
              ],
            ],
          },
          layout: {
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
          margin: [0, 4, 0, 8],
        },
      ],
    };
  }

  private getDeliveryPartyBlock(
    customer?: Customer | Company,
    company?: Customer | Company,
  ) {
    const partyStack = (title: string, entity?: Customer | Company): any[] => [
      { text: title, style: 'invoicePartyLabel' },
      {
        text: entity?.name || 'N/A',
        style: 'invoicePartyTitle',
      },
      ...[
        ['Representative', entity?.rep || 'N/A'],
        ['Email', entity?.email || 'N/A'],
        ['Contact No', entity?.phone || 'N/A'],
        ['ABN', entity?.abnNumber || 'N/A'],
        ['Address', entity ? this.getAddress(entity) || 'N/A' : 'N/A'],
      ].map(([label, value]) => ({
        text: [{ text: `${label}: `, bold: true }, { text: value }],
        style: 'invoiceSmall',
        margin: [0, 0, 0, 3],
      })),
    ];

    return {
      table: {
        widths: ['*', '*'],
        body: [
          [
            { stack: partyStack('TO', customer) },
            { stack: partyStack('FROM', company) },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: (i) => (i === 1 ? 0.8 : 0),
        vLineColor: () => invoiceTheme.border,
        paddingLeft: (i) => (i === 0 ? 0 : 18),
        paddingRight: (i, node) =>
          i === node.table.widths.length - 1 ? 0 : 18,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 0, 0, 10],
    };
  }

  private getLogisticsSummaryBlock(rows: Array<[string, any]>) {
    return {
      table: {
        widths: ['*', 'auto'],
        body: rows.map(([label, value], index) => [
          {
            text: label,
            style:
              index === rows.length - 1
                ? 'invoiceTotalLabel'
                : 'invoiceSummaryLabel',
          },
          {
            text: value ?? 'N/A',
            style:
              index === rows.length - 1
                ? 'invoiceTotalValue'
                : 'invoiceSummaryValue',
            alignment: 'right',
          },
        ]),
      },
      layout: {
        hLineWidth: (i) => (i > 0 ? 0.8 : 0),
        hLineColor: () => invoiceTheme.border,
        vLineWidth: () => 0,
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 6,
        paddingBottom: () => 6,
        fillColor: () => invoiceTheme.panel,
      },
      margin: [280, 0, 0, 12],
    };
  }

  private getDocumentConfirmationBlock(title: string, confirmation: string) {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: title, style: 'invoiceSmallBold' }],
          [{ text: 'Name:', style: 'invoiceSmallBold' }],
          [{ text: 'Date:', style: 'invoiceSmallBold' }],
          [
            {
              text: 'Sign:',
              style: 'invoiceSmallBold',
              margin: [0, 0, 0, 22],
            },
          ],
          [{ text: confirmation, style: 'invoiceSmallBold' }],
        ],
      },
      layout: invoiceTableLayout,
      margin: [0, 0, 0, 10],
    };
  }

  private getDeliveryContactBlock(delivery: Delivery) {
    const contactStack = (title: string, values: any[]) => ({
      stack: [
        { text: title, style: 'invoicePartyLabel' },
        ...values.map((value) => ({
          text: value || 'N/A',
          style: 'invoiceSmall',
          margin: [0, 0, 0, 3],
        })),
      ],
      fillColor: invoiceTheme.panel,
    });

    return {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            contactStack('SITE MAIN CONTACT', [
              delivery.companyRepName,
              delivery.companyRepEmail,
              delivery.companyRepContact,
            ]),
            contactStack('SITE FOREMAN', [
              delivery.customerRepName,
              delivery.customerRepEmail,
              delivery.customerRepContact,
            ]),
            contactStack('CREATED BY', [delivery.createdByName]),
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 8,
        paddingBottom: () => 8,
      },
      margin: [0, 0, 0, 10],
    };
  }

  private async getInvoiceLogoNode(company: Company) {
    if (company.logoUrl) {
      try {
        return {
          image: await this.getBase64ImageFromURL(
            company.logoUrl,
            240,
            240,
            1,
            true,
          ),
          fit: [150, 150],
        };
      } catch (error) {
        console.error('Unable to load company logo for invoice', error);
      }
    }

    return {
      text: company.name || 'Company',
      style: 'h4b',
    };
  }

  private getInvoiceContactLines(company: Company) {
    return [
      this.getAddress(company)
        ? {
            text: this.getAddress(company),
            style: 'invoiceValue',
            margin: [0, 0, 0, 0],
          }
        : null,
      company.email
        ? {
            text: company.email,
            style: 'invoiceValue',
            margin: [0, 1, 0, 0],
          }
        : null,
      company.phone
        ? {
            text: company.phone,
            style: 'invoiceValue',
            margin: [0, 1, 0, 0],
          }
        : null,
    ].filter(Boolean);
  }

  private getRentalInvoicePartyBlock(
    customer: Customer | undefined,
    company: Company,
  ) {
    return {
      table: {
        widths: ['*', '*'],
        body: [
          [
            {
              stack: this.getInvoicePartyStack('BILL TO', customer),
            },
            {
              stack: this.getInvoicePartyStack('ISSUED BY', company, true),
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: (i) => (i === 1 ? 0.8 : 0),
        vLineColor: () => invoiceTheme.border,
        paddingLeft: (i) => (i === 0 ? 0 : 18),
        paddingRight: (i, node) =>
          i === node.table.widths.length - 1 ? 0 : 18,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 0, 0, 6],
    };
  }

  private getInvoicePartyStack(
    title: string,
    entity?: Customer | Company,
    isCompany = false,
  ) {
    const customerEntity = entity as Customer | undefined;
    const name =
      customerEntity?.tradingName ||
      entity?.name ||
      (isCompany ? 'N/A' : 'Customer');
    const address = entity ? this.getAddress(entity) : null;
    const taxValue = this.getEntityTaxValue(entity);
    const stack: any[] = [
      { text: title, style: 'invoicePartyLabel' },
      { text: name, style: 'invoicePartyTitle' },
    ];

    if (entity?.rep) {
      stack.push({
        text: entity.rep,
        style: 'invoiceSmall',
        margin: [0, 0, 0, 4],
      });
    }

    if (entity?.email) {
      stack.push({
        text: entity.email,
        style: 'invoiceSmall',
        margin: [0, 0, 0, 4],
      });
    }

    if (entity?.phone) {
      stack.push({
        text: entity.phone,
        style: 'invoiceSmall',
        margin: [0, 0, 0, 4],
      });
    }

    if (address) {
      stack.push({
        text: address,
        style: 'invoiceSmall',
        margin: [0, 0, 0, 4],
      });
    }

    if (taxValue) {
      stack.push({
        text: `${this.getEntityTaxLabel(entity)}: ${taxValue}`,
        style: 'invoiceSmall',
        margin: [0, 0, 0, 4],
      });
    }

    return stack;
  }

  private getEntityTaxLabel(entity?: Customer | Company) {
    if (entity?.vatNum) {
      return 'VAT';
    }

    if (entity?.abnNumber) {
      return 'ABN';
    }

    return 'Tax ID';
  }

  private getEntityTaxValue(entity?: Customer | Company) {
    return entity?.vatNum || entity?.abnNumber || null;
  }

  private getInvoiceSectionHeader(title: string) {
    return {
      table: {
        widths: ['*'],
        body: [
          [
            {
              text: title,
              style: 'invoiceSectionTitle',
              fillColor: invoiceTheme.accent,
              border: [false, false, false, false],
            },
          ],
        ],
      },
      layout: {
        paddingLeft: () => 12,
        paddingRight: () => 12,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
      margin: [0, 0, 0, 3],
    };
  }

  private createInvoiceTable(headers: any[], rows: any[], widths: any[]) {
    return {
      table: {
        headerRows: 1,
        widths,
        body: [headers, ...rows],
      },
      layout: invoiceTableLayout,
      margin: [0, 0, 0, 10],
    };
  }

  private addSaleInvoiceRow(company: Company, item: any) {
    const qty = item.sellQty ?? item.qty ?? 0;
    const rate = item.sellingCost || 0;
    const total = item.totalCost ?? item.total ?? +(qty * rate).toFixed(2);

    return [
      {
        text: item.code || 'N/A',
        style: 'h6',
      },
      {
        text: item.name || item.description || 'N/A',
        style: 'h6',
      },
      {
        text: qty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.currency(rate, company.currency?.symbol || ''),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.currency(total, company.currency?.symbol || ''),
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addEstimateInvoiceRow(company: Company, item: any) {
    return [
      {
        text: item.code,
        style: 'h6',
      },
      {
        stack: item?.note
          ? [
              { text: item.description, style: 'h6' },
              { text: item.note, style: 'invoiceMuted' },
            ]
          : [{ text: item.description, style: 'h6' }],
      },
      {
        text: item.qty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.duration,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.currency(item.rate, company.currency?.symbol || ''),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.currency(item.total, company.currency?.symbol || ''),
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addRentalInvoiceRow(
    company: Company,
    item: TransactionItem,
    isCustomInvoice?: boolean,
  ) {
    const start = this.getTransactionDateValue(item.invoiceStart);
    const end = this.getTransactionDateValue(item.invoiceEnd);
    const days =
      item.days ??
      (start && end ? +this.dateDiffPipe.transform(start, end) : 0);
    const total =
      item.total ??
      +(+item.invoiceQty * +(item.hireRate || 0) * +days).toFixed(2);
    const descriptionStack: any[] = [
      { text: this.getBillingDescription(item), style: 'h6' },
    ];

    if (isCustomInvoice) {
      return [
        {
          text: this.getTransactionCode(item),
          style: 'h6',
        },
        {
          text: item.code,
          style: 'h6',
        },
        {
          stack: descriptionStack,
        },
        {
          text: item.deliveredQty,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: item.returnTotal,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: item.balanceQty,
          style: 'h6',
          alignment: 'center',
        },
        this.getHirePeriodCell(start, end, days),
      ];
    }

    return [
      {
        text: this.getTransactionCode(item),
        style: 'h6',
      },
      {
        text: item.code,
        style: 'h6',
      },
      {
        stack: descriptionStack,
      },
      {
        text: item.invoiceQty,
        style: 'h6',
        alignment: 'center',
      },
      this.getHirePeriodCell(start, end, days),
      this.getRentalInvoiceDetailsCell(item.balanceQty, days),
      {
        text: this.currency(item.hireRate, company.currency?.symbol || ''),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.currency(total, company.currency?.symbol || ''),
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addConsumableInvoiceRow(
    company: Company,
    item: TransactionItem,
    isCustomInvoice?: boolean,
  ) {
    if (isCustomInvoice) {
      return [
        {
          text: this.getTransactionCode(item),
          style: 'h6',
        },
        {
          text: item.code,
          style: 'h6',
        },
        {
          text: item.name,
          style: 'h6',
        },
        {
          text: 'EA',
          style: 'h6',
          alignment: 'center',
        },
      ];
    }

    const rate = item.sellingCost || item.hireRate || 0;
    const total = item.total ?? +(+item.invoiceQty * +rate).toFixed(2);

    return [
      {
        text: this.getTransactionCode(item),
        style: 'h6',
      },
      {
        text: item.code,
        style: 'h6',
      },
      {
        text: item.name,
        style: 'h6',
      },
      {
        text: item.invoiceQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.currency(rate, company.currency?.symbol || ''),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.currency(total, company.currency?.symbol || ''),
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addDamageInvoiceRow(
    company: Company,
    item: TransactionItem,
    isCustomInvoice?: boolean,
  ) {
    if (isCustomInvoice) {
      return [
        {
          text: this.getTransactionCode(item),
          style: 'h6',
        },
        {
          text: item.code,
          style: 'h6',
        },
        {
          text: item.name,
          style: 'h6',
        },
        {
          text: 'EA',
          style: 'h6',
          alignment: 'center',
        },
      ];
    }

    const rate = item.sellingCost || item.hireRate || 0;
    const total = item.total ?? +(+item.invoiceQty * +rate).toFixed(2);

    return [
      {
        text: this.getTransactionCode(item),
        style: 'h6',
      },
      {
        text: item.code,
        style: 'h6',
      },
      {
        text: item.name,
        style: 'h6',
      },
      {
        text: item.invoiceQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.currency(rate, company.currency?.symbol || ''),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.currency(total, company.currency?.symbol || ''),
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private getHirePeriodCell(
    start: Date | null,
    end: Date | null,
    days: number,
  ) {
    const period =
      start && end
        ? `${this.toDate(start, true)} - ${this.toDate(end, true)}`
        : 'N/A';

    return {
      text: period,
      style: 'h6',
      alignment: 'center',
    };
  }

  private getRentalInvoiceDetailsCell(balanceQty: number, days: number) {
    return {
      text: `${days || 0} ${days === 1 ? 'Day' : 'Days'}`,
      style: 'h6',
      alignment: 'center',
    };
  }

  private getRentalInvoiceTotalsBlock(
    invoice: TransactionInvoice,
    company: Company,
    customer?: Customer,
  ) {
    const currencySymbol = company.currency?.symbol || '';
    const amountRows: any[] = [
      this.getAmountSummaryRow(
        'Subtotal:',
        this.currency(invoice.subtotal, currencySymbol),
      ),
    ];

    if (+invoice.discount !== 0) {
      amountRows.push(
        this.getAmountSummaryRow(
          'Discount:',
          `-${this.currency(invoice.discount, currencySymbol)}`,
        ),
      );
    }

    amountRows.push(
      this.getAmountSummaryRow(
        'Invoice Total:',
        this.currency(
          +(+(invoice.subtotal || 0) - +(invoice.discount || 0)).toFixed(2),
          currencySymbol,
        ),
      ),
    );

    if (+invoice.creditTotal !== 0) {
      amountRows.push(
        this.getAmountSummaryRow(
          'Credit Applied:',
          `-${this.currency(invoice.creditTotal, currencySymbol)}`,
        ),
      );
    }

    if (company.salesTax > 0) {
      amountRows.push(
        this.getAmountSummaryRow(
          `Tax (${company.salesTax}%):`,
          this.currency(invoice.tax, currencySymbol),
        ),
      );
    }

    if (company.vat > 0) {
      amountRows.push(
        this.getAmountSummaryRow(
          `${company.gst ? 'GST' : 'VAT'} (${company.vat}%):`,
          this.currency(invoice.vat, currencySymbol),
        ),
      );
    }

    amountRows.push([
      {
        text: 'TOTAL DUE:',
        style: 'invoiceTotalLabel',
        fillColor: invoiceTheme.accent,
        border: [false, false, false, false],
      },
      {
        text: this.currency(invoice.total, currencySymbol),
        style: 'invoiceTotalValue',
        alignment: 'right',
        fillColor: invoiceTheme.accent,
        border: [false, false, false, false],
      },
    ]);

    const paymentRows: any[] = [
      this.getDetailRow('Payment Terms', this.getPaymentTermsText(customer)),
      this.getDetailRow('Bank', company.bankName || 'N/A'),
      this.getDetailRow('Account Name', company.name || 'N/A'),
    ];

    if (company.branchCode) {
      paymentRows.push(this.getDetailRow('BSB', company.branchCode));
    }

    if (company.accountNum) {
      paymentRows.push(this.getDetailRow('Account Number', company.accountNum));
    }

    if (company.swiftCode) {
      paymentRows.push(this.getDetailRow('SWIFT Code', company.swiftCode));
    }

    paymentRows.push(
      this.getDetailRow('Payment Reference', invoice.code || 'N/A'),
    );

    if (company.notes) {
      paymentRows.push(this.getDetailRow('Note', company.notes));
    }

    return {
      unbreakable: true,
      table: {
        widths: ['*', 190],
        body: [
          [
            {
              stack: [
                this.getInvoiceSectionHeader('Payment Details'),
                {
                  table: {
                    widths: ['auto', '*'],
                    body: paymentRows,
                  },
                  layout: 'noBorders',
                  margin: [0, 1, 0, 0],
                },
              ],
            },
            {
              table: {
                widths: ['*', 'auto'],
                body: amountRows,
              },
              layout: {
                hLineWidth: (i) => (i === 0 ? 0 : 0.8),
                hLineColor: () => invoiceTheme.border,
                vLineWidth: () => 0,
                paddingLeft: () => 8,
                paddingRight: () => 8,
                paddingTop: () => 5,
                paddingBottom: () => 5,
              },
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: (i) => (i === 0 ? 0 : 14),
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      margin: [0, 2, 0, 8],
    };
  }

  private getAmountSummaryRow(label: string, value: string) {
    return [
      {
        text: label,
        style: 'invoiceSummaryLabel',
        fillColor: invoiceTheme.panel,
        border: [false, false, false, false],
      },
      {
        text: value,
        style: 'invoiceSummaryValue',
        alignment: 'right',
        fillColor: invoiceTheme.panel,
        border: [false, false, false, false],
      },
    ];
  }

  private getDetailRow(label: string, value: string) {
    return [
      {
        text: `${label}:`,
        style: 'invoiceSmallBold',
        margin: [0, 0, 8, 2],
      },
      {
        text: value,
        style: 'invoiceSmall',
        margin: [0, 0, 0, 2],
      },
    ];
  }

  private getPaymentTermsText(customer?: Customer) {
    if (customer?.paymentDays) {
      return `Due within ${customer.paymentDays} days`;
    }

    return 'Due on receipt';
  }

  private getTransactionDateValue(value: any): Date | null {
    if (!value) {
      return null;
    }

    if (typeof value.toDate === 'function') {
      return value.toDate();
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private getTransactionCode(item: TransactionItem) {
    return item.transactionType === 'Delivery'
      ? item.deliveryCode
      : item.returnCode;
  }

  private getRentalInvoiceFooter() {
    const companyState = this.store.selectSnapshot(CompanyState.company);
    const showBranding =
      !companyState?.removeBranding && !companyState?.replaceBranding;

    return (currentPage, pageCount) => ({
      margin: [40, 0, 40, 18],
      stack: [
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: invoiceTheme.border,
            },
          ],
        },
        {
          columns: [
            showBranding
              ? {
                  text: [
                    { text: 'Powered by ', style: 'invoiceFooter' },
                    {
                      text: 'CLOUDSCAFF',
                      style: 'invoiceFooter',
                      bold: true,
                      color: invoiceTheme.accent,
                    },
                    {
                      text: ' Asset Management Software',
                      style: 'invoiceFooter',
                    },
                  ],
                }
              : { text: '' },
            {
              text: `Page ${currentPage} of ${pageCount}`,
              style: 'invoiceFooter',
              alignment: 'right',
            },
          ],
          margin: [0, 8, 0, 0],
        },
      ],
    });
  }

  private addEstimateItem(index: number, company: Company, item: any) {
    return [
      {
        text: index + 1,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.code,
        style: 'h6',
        alignment: 'center',
      },
      {
        stack: item?.note
          ? [item.description, , { text: item.note, color: 'red' }]
          : [item.description],
        style: 'h6',
      },
      {
        text: item.unit,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.qty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.duration,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(item.rate)}`,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(item.total)}`,
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addRentalEstimateItem(index: number, company: Company, item: any) {
    return [
      {
        text: index + 1,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.name,
        style: 'h6',
      },
      {
        text: 'EA',
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.duration,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(item.hireCost)}`,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.shipmentQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(item.totalCost)}`,
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addSaleItem(
    index: number,
    company: Company,
    item: any,
    isRental: boolean,
  ) {
    return [
      {
        text: index + 1,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.name,
        style: 'h6',
      },
      {
        text: 'EA',
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(
          isRental ? item.hireCost : item.sellingCost,
        )}`,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: isRental ? item.shipmentQty : item.sellQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(item.totalCost)}`,
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addRentalItemMixed(company: Company, item: any) {
    let start = null;
    let end = null;
    let days = null;
    let code = null;

    code = item.code;
    start = item.startDate;
    end = item.endDate;
    days = +this.dateDiffPipe.transform(start, end);

    const months = this.format(days / 30);
    return [
      {
        text: code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.description,
        style: 'h6',
      },
      {
        text: item.unit,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.qty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: 0,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: 0,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: 0,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.toDate(start, true),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.toDate(end, true),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: days,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: months,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(item.rate)}`,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(item.total)}`,
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addRentalItem(
    company: Company,
    item: TransactionItem,
    endDate?: any,
  ) {
    let start = null;
    let end = null;
    let days = null;
    const code =
      item.transactionType === 'Delivery' ? item.deliveryCode : item.returnCode;

    start = item.invoiceStart.toDate();
    end = item.invoiceEnd.toDate();
    days = +this.dateDiffPipe.transform(start, end);

    const months = +this.format(days / 30);
    const total = +item.invoiceQty * +item.hireRate * days;
    return [
      {
        text: code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.getBillingDescription(item),
        style: 'h6',
      },
      {
        text: 'EA',
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.invoiceQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.deliveredQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.returnTotal,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.balanceQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.toDate(start, true),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.toDate(end, true),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: days,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: months,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(item.hireRate)}`,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(total)}`,
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addRentalItemCustom(item: TransactionItem, endDate?: any) {
    let start = null;
    let end = null;
    let days = null;
    const code =
      item.transactionType === 'Delivery' ? item.deliveryCode : item.returnCode;

    start = item.invoiceStart.toDate();
    end = item.invoiceEnd.toDate();
    days = +this.dateDiffPipe.transform(start, end);
    const months = this.format(days / 30);
    return [
      {
        text: code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.getBillingDescription(item),
        style: 'h6',
      },
      {
        text: 'EA',
        style: 'h6',
        alignment: 'center',
      },

      {
        text: item.deliveredQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.returnTotal,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.balanceQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.toDate(start, true),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: this.toDate(end, true),
        style: 'h6',
        alignment: 'center',
      },
      {
        text: days,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: months,
        style: 'h6',
        alignment: 'center',
      },
    ];
  }

  private addConsumableItem(company: Company, item: TransactionItem) {
    const code =
      item.transactionType === 'Delivery' ? item.deliveryCode : item.returnCode;
    const total = +item.invoiceQty * +(item.sellingCost || item.hireRate);

    return [
      {
        text: code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.name,
        style: 'h6',
      },
      {
        text: 'EA',
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.invoiceQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(item.sellingCost || item.hireRate)}`,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(total)}`,
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addConsumableItemCustom(item: TransactionItem) {
    const code =
      item.transactionType === 'Delivery' ? item.deliveryCode : item.returnCode;

    return [
      {
        text: code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.name,
        style: 'h6',
      },
      {
        text: 'EA',
        style: 'h6',
        alignment: 'center',
      },
    ];
  }

  private addDamageItem(company: Company, item: TransactionItem) {
    const code =
      item.transactionType === 'Delivery' ? item.deliveryCode : item.returnCode;
    const total = +item.invoiceQty * +(item.sellingCost || item.hireRate);

    return [
      {
        text: code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.name,
        style: 'h6',
      },
      {
        text: 'EA',
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.invoiceQty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(item.sellingCost || item.hireRate)}`,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(total)}`,
        style: 'h6',
        alignment: 'right',
      },
    ];
  }

  private addDamageItemCustom(item: TransactionItem) {
    const code =
      item.transactionType === 'Delivery' ? item.deliveryCode : item.returnCode;

    return [
      {
        text: code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.code,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: item.name,
        style: 'h6',
      },
      {
        text: 'EA',
        style: 'h6',
        alignment: 'center',
      },
    ];
  }

  private getBillingDescription(item: TransactionItem) {
    if (item.minHireApplied) {
      return `${item.name} (Advance - Min hire applied)`;
    }

    if (item.billingMode === 'advance') {
      return `${item.name} (Advance)`;
    }

    if (item.billingMode === 'prorate') {
      return `${item.name} (Prorate)`;
    }

    return item.name;
  }

  private createShipmentTable(shipmentItems: InventoryItem[]) {
    const items = [];
    shipmentItems.forEach((item, i) => {
      items.push([
        { text: i + 1, style: 'h6', alignment: 'left' },
        { text: item.code, style: 'h6', alignment: 'left' },
        {
          text: item.category,
          style: 'h6',
          alignment: 'left',
        },
        // { text: item.size, style: 'h4b', alignment: 'center' },
        { text: item.name, style: 'h6', alignment: 'left' },
        { text: item.shipmentQty, style: 'h6', alignment: 'center' },
        {
          text: this.decimalPipe.transform(
            (+item?.weight || 0) * (+item?.shipmentQty || 0),
          ),
          style: 'h6',
          alignment: 'center',
        },
      ]);
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Code', style: 'h4b', alignment: 'left' },
            {
              text: 'Category',
              style: 'h4b',
              alignment: 'left',
            },
            // { text: 'Size', style: 'h4b', alignment: 'center' },
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Item Qty', style: 'h4b', alignment: 'center' },
            { text: 'Weight', style: 'h4b', alignment: 'center' },
          ],
          ...items,
        ],
      },
      layout: invoiceTableLayout,
      margin: [0, 0, 0, 10],
    };

    return summary;
  }

  private createTransactionReturnTable(
    transactionItems: TransactionItem[],
    includeSize = true,
  ) {
    const items = [];
    transactionItems.forEach((item, i) => {
      items.push([
        { text: i + 1, style: 'h6', alignment: 'left' },
        { text: item.code, style: 'h6', alignment: 'left' },
        {
          text: item.category,
          style: 'h6',
          alignment: 'left',
        },
        ...(includeSize
          ? [{ text: item.size, style: 'h6', alignment: 'center' }]
          : []),
        { text: item.name, style: 'h6', alignment: 'left' },
        { text: item.returnQty, style: 'h6', alignment: 'center' },
        {
          text: this.decimalPipe.transform(
            (+item?.weight || 0) * (+item?.returnQty || 0),
          ),
          style: 'h6',
          alignment: 'center',
        },
      ]);
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: includeSize
          ? ['auto', 'auto', '*', 'auto', '*', 'auto', 'auto']
          : ['auto', 'auto', '*', '*', 'auto', 'auto'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Code', style: 'h4b', alignment: 'left' },
            {
              text: 'Category',
              style: 'h4b',
              alignment: 'left',
            },
            ...(includeSize
              ? [{ text: 'Size', style: 'h4b', alignment: 'center' }]
              : []),
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Item Qty', style: 'h4b', alignment: 'center' },
            { text: 'Weight', style: 'h4b', alignment: 'center' },
          ],
          ...items,
        ],
      },
      layout: invoiceTableLayout,
      margin: [0, 0, 0, 10],
    };

    return summary;
  }

  private numberToWords(num: number): string {
    if (num === 0) {
      return 'Zero';
    }

    const belowTwenty: string[] = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];

    const tens: string[] = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];

    const thousands: string[] = ['', 'Thousand', 'Million', 'Billion'];

    const helper = (n: number): string => {
      if (n === 0) {
        return '';
      }
      if (n < 20) {
        return belowTwenty[n] + ' ';
      }
      if (n < 100) {
        return tens[Math.floor(n / 10)] + ' ' + helper(n % 10);
      }
      return belowTwenty[Math.floor(n / 100)] + ' Hundred ' + helper(n % 100);
    };

    const convertIntegerPart = (num2: number): string => {
      let word = '';
      let i = 0;

      while (num2 > 0) {
        if (num2 % 1000 !== 0) {
          word = helper(num2 % 1000) + thousands[i] + ' ' + word;
        }
        num2 = Math.floor(num2 / 1000);
        i++;
      }

      return word.trim();
    };

    const dollars = Math.floor(num); // Get the whole part (dollars)
    const halala = Math.round((num - dollars) * 100); // Get the decimal part (halala)

    // Convert dollars to words
    const dollarWords =
      convertIntegerPart(dollars) +
      (dollars === 1 ? ' Saudi Riyal' : ' Saudi Riyals');

    // Convert halala to words, if any
    const halalaWords =
      halala > 0 ? convertIntegerPart(halala) + ' Halala' : '';

    // Construct the final phrase
    if (halalaWords) {
      return `${dollarWords} and ${halalaWords} Only`;
    } else {
      return `${dollarWords} Only`;
    }
  }

  private async getFooter() {
    const companyState = this.store.selectSnapshot(CompanyState.company);
    const removeBranding = companyState?.removeBranding || false;
    const replaceBranding = companyState?.replaceBranding || null;
    const replacementImage =
      replaceBranding && !removeBranding
        ? await this.getBase64ImageFromURL(replaceBranding, 300, 200, 0.8)
        : null;

    return (currentPage, pageCount) => ({
      margin: [40, 0, 40, 18],
      stack: [
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: invoiceTheme.border,
            },
          ],
        },
        {
          columns: [
            removeBranding
              ? { text: '' }
              : replacementImage
                ? {
                    image: replacementImage,
                    fit: [100, 22],
                  }
                : {
                    text: [
                      { text: 'Powered by ', style: 'invoiceFooter' },
                      {
                        text: 'CLOUDSCAFF',
                        style: 'invoiceFooter',
                        bold: true,
                        color: invoiceTheme.accent,
                      },
                      {
                        text: ' Asset Management Software',
                        style: 'invoiceFooter',
                      },
                    ],
                  },
            {
              text: `Page ${currentPage} of ${pageCount}`,
              style: 'invoiceFooter',
              alignment: 'right',
            },
          ],
          margin: [0, 8, 0, 0],
        },
      ],
    });
  }

  private getPageNumbers() {
    return (currentPage, pageCount) => [
      {
        text: currentPage.toString() + ' of ' + pageCount,
        style: 'h4b',
        alignment: 'right',
        margin: [0, 15, 15, 0],
      },
    ];
  }
  private getMetaData(title: string) {
    const info = {
      title,
      creator: 'Cloudscaff Scaffold Management',
    };
    return info;
  }
  /**
   * Converts an image URL to base64 with compression and resizing
   *
   * @param url - Image URL to process
   * @param maxWidth - Maximum width (default: 800px)
   * @param maxHeight - Maximum height (default: 600px)
   * @param quality - JPEG quality 0-1 (default: 0.7)
   * @param preserveTransparency - Whether to preserve transparency (default: false)
   * @returns Promise<string> - Base64 encoded image
   */
  private async getBase64ImageFromURL(
    url,
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.7,
    preserveTransparency = false,
  ) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');

      img.onload = () => {
        const canvas = document.createElement('canvas');

        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Choose format based on transparency needs
        let dataURL;
        if (
          preserveTransparency ||
          url.toLowerCase().includes('.png') ||
          url.toLowerCase().includes('logo') ||
          url.toLowerCase().includes('signature')
        ) {
          // Use PNG for logos, signatures, and when transparency is needed
          dataURL = canvas.toDataURL('image/png');
        } else {
          // Use JPEG with compression for photos and other images
          dataURL = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataURL);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = url;
    });
  }

  private format(value: number) {
    return this.decimalPipe.transform(value, '0.2-2');
  }
  private currency(value: number, symbol: string) {
    return `${symbol}${
      value ? this.decimalPipe.transform(value, '0.2-2') : '0.00'
    }`;
  }
  private toDate(date, hideTimestamp?: boolean) {
    let parsedDate: Date;

    // Handle DD-MM-YYYY format (e.g., "29-01-2026")
    if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
      const [day, month, year] = date.split('-').map(Number);
      parsedDate = new Date(year, month - 1, day);
    } else {
      parsedDate = new Date(date);
    }

    return this.datePipe.transform(
      parsedDate,
      hideTimestamp ? 'dd MMM yyyy' : 'dd MMM yyyy (HH:mm)',
    );
  }
  private getAddress(data: any): string {
    const components = [
      data.address,
      data.suburb,
      data.city,
      data.zip,
      data.country,
    ];
    // Filter out null, undefined, and empty strings
    const nonEmptyComponents = components.filter((component) => component);
    return nonEmptyComponents.join(', ');
  }
}
