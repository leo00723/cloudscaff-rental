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

// Configure the fonts
(pdfMake as any).vfs = pdfFonts.vfs;

const footerlogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 388.58 26.87"><defs><style>.cls-1{fill:#fdb515;}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Logo-Full"><g id="Logo-Full-2" data-name="Logo-Full"><path class="cls-1" d="M151.2.19a2.08,2.08,0,0,1,2.09,2.09h0V20.57a6.24,6.24,0,0,1-6.24,6.24H123.93a6.24,6.24,0,0,1-6.24-6.24V2.22a2.1,2.1,0,0,1,2.09-2.1h0a2.1,2.1,0,0,1,2.1,2.1h0V20.55a2.1,2.1,0,0,0,2.09,2.1h23.09a2.11,2.11,0,0,0,2.1-2.1V2.28A2.09,2.09,0,0,1,151.24.19Z"/><path class="cls-1" d="M270.91,24.78a2.1,2.1,0,0,1-2.09,2.09H241.5a6.24,6.24,0,0,1-6.24-6.24V6.42A6.24,6.24,0,0,1,241.5.18h27.38A2.09,2.09,0,0,1,271,2.27h0a2.09,2.09,0,0,1-2.09,2.1H241.5a2.08,2.08,0,0,0-2.09,2.06h0V20.59a2.1,2.1,0,0,0,2.1,2.09h27.31a2.1,2.1,0,0,1,2.09,2.1Z"/><path class="cls-1" d="M156.89,0H186.3a6.24,6.24,0,0,1,6.24,6.24V20.45a6.24,6.24,0,0,1-6.19,6.29H156.83V22.55H186.3a2.1,2.1,0,0,0,2.09-2.1V6.28a2.1,2.1,0,0,0-2.06-2.13H156.89Z"/><path class="cls-1" d="M317.88,24.79V6.4A2.1,2.1,0,0,1,320,4.3h27.32a2.09,2.09,0,0,0,2.09-2.08h0A2.08,2.08,0,0,0,347.3.13H320a6.24,6.24,0,0,0-6.24,6.24V24.79a2.08,2.08,0,0,0,2.07,2.08h0a2.08,2.08,0,0,0,2.08-2.08Z"/><path class="cls-1" d="M276.6,26.74a2.11,2.11,0,0,1-2.09-2.09V6.36A6.24,6.24,0,0,1,280.75.12h23.14a6.24,6.24,0,0,1,6.23,6.24V24.71A2.09,2.09,0,0,1,308,26.8h0a2.09,2.09,0,0,1-2.09-2.09h0V6.38a2.09,2.09,0,0,0-2.1-2.09h-23a2.09,2.09,0,0,0-2.1,2.09h0V24.65a2.1,2.1,0,0,1-2.09,2.1h0Z"/><rect class="cls-1" x="278.47" y="11.22" width="27.72" height="4.15"/><path class="cls-1" d="M317.21,15.37V11.19h25.85a2.09,2.09,0,0,1,2.09,2.09h0a2.09,2.09,0,0,1-2.09,2.09H317.21Z"/><path class="cls-1" d="M357.09,24.79V6.4a2.11,2.11,0,0,1,2.09-2.1H386.5a2.08,2.08,0,0,0,2.08-2.08h0A2.08,2.08,0,0,0,386.51.13H359.17a6.24,6.24,0,0,0-6.24,6.24V24.79A2.08,2.08,0,0,0,355,26.87h0a2.08,2.08,0,0,0,2.07-2.08Z"/><path class="cls-1" d="M356.42,15.37V11.19h25.85a2.09,2.09,0,0,1,2.1,2.09h0a2.09,2.09,0,0,1-2.1,2.09Z"/><path class="cls-1" d="M208.33,11.19h17.16a6.23,6.23,0,0,1,6.24,6.23v3.12a6.24,6.24,0,0,1-6.19,6.29h-27.4a2.09,2.09,0,0,1-2.09-2.1h0a2.09,2.09,0,0,1,2.09-2.09h27.38a2.1,2.1,0,0,0,2.08-2.1V17.42a2.07,2.07,0,0,0-2.07-2.09h-17.2Z"/><path class="cls-1" d="M219.48,15.37H202.31a6.24,6.24,0,0,1-6.24-6.23V6.42A6.24,6.24,0,0,1,202.31.18h27.38a2.09,2.09,0,0,1,2.09,2.09h0a2.09,2.09,0,0,1-2.09,2.1H202.28a2.09,2.09,0,0,0-2.08,2.09V9.14a2.08,2.08,0,0,0,2.08,2.09h17.16Z"/><rect class="cls-1" x="156.89" y="4.19" width="4.16" height="18.36"/><path class="cls-1" d="M96.38,26.87H84.79a6.24,6.24,0,0,1-6.24-6.24V6.42A6.24,6.24,0,0,1,84.79.18H96.38V4.37H84.79a2.07,2.07,0,0,0-2.07,2.09h0V20.63a2.08,2.08,0,0,0,2.07,2.05H96.38Z"/><path class="cls-1" d="M96.25.13h11.59a6.24,6.24,0,0,1,6.24,6.24V20.59a6.24,6.24,0,0,1-6.2,6.28H96.25V22.68h11.59a2.1,2.1,0,0,0,2.09-2.09V6.42a2.1,2.1,0,0,0-2.09-2.1H96.25Z"/><path class="cls-1" d="M43.47,2.21v18.4a2.1,2.1,0,0,0,2.11,2.08H72.69a2.1,2.1,0,0,1,2.09,2.1h0a2.09,2.09,0,0,1-2.09,2.08H45.58a6.24,6.24,0,0,1-6.24-6.24V2.21A2.08,2.08,0,0,1,41.42.13h0A2.07,2.07,0,0,1,43.47,2.21Z"/><path class="cls-1" d="M35.65,24.78a2.09,2.09,0,0,1-2.09,2.09H6.24A6.24,6.24,0,0,1,0,20.63V6.42A6.24,6.24,0,0,1,6.24.18H33.62a2.1,2.1,0,0,1,2.09,2.09h0a2.1,2.1,0,0,1-2.09,2.1H6.24A2.08,2.08,0,0,0,4.16,6.44h0V20.59a2.1,2.1,0,0,0,2.1,2.09h27.3a2.1,2.1,0,0,1,2.09,2.1Z"/></g></g></g></svg>`;
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
  hLineWidth: () => 1,
  hLineColor: () => '#ccc',
  vLineWidth: () => 1,
  vLineColor: () => '#ccc',
  // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
  // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
  paddingLeft: () => 6,
  paddingRight: () => 6,
  paddingTop: () => 4,
  paddingBottom: () => 1,
  fillColor: (i, node) =>
    i === 0 || i === node.table.body.length ? '#eeeeee' : 'white',
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
};
const defaultCS = {
  fontSize: 8,
  lineHeight: 1.5,
  color: 'black',
  // alignment: 'justify'
};

const defaultSubHeader =
  'https://placehold.co/1122x80?text=Billing+Header+Placeholder&font=roboto';
@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private store = inject(Store);
  constructor(
    private calcPipe: CalculatePipe,
    private dateDiffPipe: DateDiffPipe,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private weightPipe: WeightPipe,
    private platformService: Platform,
    private fileOpenerService: FileOpener
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
    terms: Term | null
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
          []
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
                    estimate.subtotal
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
                    estimate.discount
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
                    estimate.subtotal - estimate.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                {
                  text: company.branchCode ? 'Branch:' : '',
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
                          estimate.vat
                        )}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(
                          estimate.tax
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
                    estimate.total
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
    return this.generatePdf(data);
  }

  // ESTIMATE RENTAL PDF
  async rentalEstimate(
    estimate: InventoryEstimateRent,
    company: Company,
    terms: Term | null
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
          []
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
                    estimate.subtotal
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
                    estimate.discount
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
                    estimate.subtotal - estimate.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                {
                  text: company.branchCode ? 'Branch:' : '',
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
                          estimate.vat
                        )}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(
                          estimate.tax
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
                    estimate.total
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
    return this.generatePdf(data);
  }

  // ESTIMATE RENTAL PDF
  async saleEstimate(
    estimate: InventoryEstimateSell,
    company: Company,
    terms: Term | null
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
          []
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
                    estimate.subtotal
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
                    estimate.discount
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
                    estimate.subtotal - estimate.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                {
                  text: company.branchCode ? 'Branch:' : '',
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
                          estimate.vat
                        )}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(
                          estimate.tax
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
                    estimate.total
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
    return this.generatePdf(data);
  }

  // INVOICE RENTAL PDF
  async saleInvoice(
    invoice: SaleInvoice,
    company: Company,
    terms: Term | null,
    isdraft?: boolean
  ) {
    const items = [];
    invoice.estimate.items.forEach((item, i) => {
      items.push(this.addSaleItem(i, company, item, false));
    });

    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', '*'],

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
      info: this.getMetaData(
        `${company.name}-Invoice-${invoice.estimate.code}`
      ),
      content: [
        await this.getBillingHeader(
          isdraft ? 'Invoice Draft' : 'Invoice',
          isdraft ? 'Invoice Draft' : invoice.code,
          invoice.estimate.siteName,
          isdraft ? invoice.date : invoice.date,
          company,
          '',
          [
            [
              { text: 'Job Reference', style: 'h6b' },
              `${invoice.jobReference || 'N/A'}`,
              '',
              '',
            ],
          ]
        ),
        hr,
        this.getCompanyInfo(invoice.estimate.customer, company),
        hr,
        { text: invoice.estimate.scope },
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
                    invoice.estimate.subtotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Beneficiary:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount (${invoice.estimate.discountPercentage}%):`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    invoice.estimate.discount
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
                    invoice.estimate.subtotal - invoice.estimate.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                {
                  text: company.branchCode ? 'Branch:' : '',
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
                          invoice.estimate.vat
                        )}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(
                          invoice.estimate.tax
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
                    invoice.estimate.total
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
              //     text: this.numberToWords(invoice.estimate.total),
              //     style: 'h4b',
              //   },
              // ],
            ],
          },
          layout: 'noBorders',
        },
        await this.addUploads(invoice.estimate.uploads),
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
    return this.generatePdf(data);
  }

  // INVOICE RENTAL PDF
  async rentalInvoice(
    invoice: TransactionInvoice,
    company: Company,
    terms: Term | null,
    isdraft?: boolean,
    dataUrl?: any
  ) {
    const estimateItems = [];
    const items = [];

    if (!invoice.customInvoice) {
      // If customInvoice is false, include all items
      invoice.estimate.items.forEach((item, i) => {
        estimateItems.push(this.addEstimateItem(i, company, item));
      });

      invoice.items.forEach((item) => {
        items.push(this.addRentalItem(company, item, invoice.endDate));
      });
    } else {
      // If customInvoice is true, filter out items without the forInvoice flag
      invoice.estimate.items
        .filter((item) => item.forInvoice)
        .forEach((item, i) => {
          estimateItems.push(this.addEstimateItem(i, company, item));
        });

      invoice.items.forEach((item) => {
        items.push(this.addRentalItemCustom(item, invoice.endDate));
      });
    }
    const estimateSummary = {
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
          ...estimateItems,
        ],
      },
      layout: tLayout,
    };

    // Define table headers based on customInvoice flag
    const summaryTableHeaders = invoice.customInvoice
      ? [
          { text: 'Docket', style: 'h4b', alignment: 'left' },
          { text: 'Item Code', style: 'h4b', alignment: 'center' },
          { text: 'Description', style: 'h4b', alignment: 'left' },
          { text: 'Unit', style: 'h4b', alignment: 'center' },
          { text: 'Delivered', style: 'h4b', alignment: 'center' },
          { text: 'Returned', style: 'h4b', alignment: 'center' },
          { text: 'Balance', style: 'h4b', alignment: 'center' },
          { text: 'Start Date', style: 'h4b', alignment: 'center' },
          { text: 'End Date', style: 'h4b', alignment: 'center' },
          { text: 'Days', style: 'h4b', alignment: 'center' },
          { text: 'Months', style: 'h4b', alignment: 'center' },
        ]
      : [
          { text: 'Docket', style: 'h4b', alignment: 'left' },
          { text: 'Item Code', style: 'h4b', alignment: 'center' },
          { text: 'Description', style: 'h4b', alignment: 'left' },
          { text: 'Unit', style: 'h4b', alignment: 'center' },
          { text: 'Invoice Qty', style: 'h4b', alignment: 'center' },
          { text: 'Delivered', style: 'h4b', alignment: 'center' },
          { text: 'Returned', style: 'h4b', alignment: 'center' },
          { text: 'Balance', style: 'h4b', alignment: 'center' },
          { text: 'Start Date', style: 'h4b', alignment: 'center' },
          { text: 'End Date', style: 'h4b', alignment: 'center' },
          { text: 'Days', style: 'h4b', alignment: 'center' },
          { text: 'Months', style: 'h4b', alignment: 'center' },
          { text: 'Daily Rent Rate', style: 'h4b', alignment: 'center' },
          { text: 'Total', style: 'h4b', alignment: 'right' },
        ];

    // Define the table body, filtering out the columns based on customInvoice flag

    const summary = {
      table: {
        headerRows: 1,
        widths: invoice.customInvoice
          ? [
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
              'auto',
            ]
          : [
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
              'auto',
              'auto',
              '*',
              'auto',
            ],
        body: [summaryTableHeaders, ...items],
      },
      layout: tLayout,
    };

    const credit = [];
    invoice.creditItems.forEach((item, i) => {
      credit.push([
        {
          text: i + 1,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: item.description,
          style: 'h6',
          alignment: 'left',
        },
        {
          text: `-${company.currency.symbol} ${this.format(item.total)}`,
          style: 'h6',
          alignment: 'right',
        },
      ]);
    });

    const creditSummary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'center' },
            {
              text: 'Description',
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: 'Total',
              style: 'h4b',
              alignment: 'left',
            },
          ],
          ...credit,
        ],
      },
      layout: tLayout,
    };

    const data = {
      header: this.getPageNumbers(),
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Invoice-${invoice.code}`),
      content: [
        await this.getBillingHeader(
          isdraft ? 'Invoice Draft' : 'Invoice',
          isdraft ? 'Invoice Draft' : invoice.code,
          invoice.site.name,
          isdraft ? invoice.date : invoice.date,
          company,
          '',
          [
            dataUrl
              ? [
                  '',
                  '',
                  {
                    image: dataUrl,
                    width: 100,
                    rowSpan: 5,
                  },
                  '',
                ]
              : ['', '', '', ''], // Empty text if no image
            [
              { text: 'Job Reference', style: 'h6b' },
              `${invoice?.jobReference || 'N/A'}`,
              '',
              '',
            ],
          ]
        ),
        hr,
        this.getCompanyInfo(invoice.estimate.customer, company),
        hr,

        invoice.type !== 'Rental' ? [hr, estimateSummary] : [],
        hr,
        { text: 'Invoice Items', style: 'h4b' },
        summary,
        hr,
        { text: 'Credit Items', style: 'h4b' },
        creditSummary,
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
                '',
                '',
                {
                  text: 'Subtotal:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    invoice.subtotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Bank Name:', style: 'h6b', alignment: 'left' },
                { text: company.bankName, alignment: 'left' },
                {
                  text: 'Credit:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `-${company.currency.symbol} ${this.format(
                    invoice.creditTotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Beneficiary:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount:`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    invoice.discount
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
                    invoice.subtotal - invoice.discount - invoice.creditTotal
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                {
                  text: company.branchCode ? 'Branch:' : '',
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
                      ? `${company.currency.symbol} ${this.format(invoice.vat)}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(invoice.tax)}`
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
                    invoice.total
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
              //     text: this.numberToWords(invoice.total),
              //     style: 'h4b',
              //   },
              // ],
            ],
          },
          layout: 'noBorders',
        },
        await this.addUploads(invoice.estimate.uploads || []),
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
    return this.generatePdf(data);
  }

  // INVOICE RENTAL PDF
  async mixedInvoice(
    invoice: TransactionInvoice,
    company: Company,
    terms: Term | null,
    isdraft?: boolean,
    dataUrl?: any
  ) {
    const items = [];

    invoice.estimate.items
      .filter((item) => item.forInvoice)
      .forEach((item, i) => {
        items.push(this.addRentalItemMixed(company, item));
      });

    invoice.items.forEach((item) => {
      items.push(this.addRentalItem(company, item, invoice.endDate));
    });

    // Define table headers based on customInvoice flag
    const summaryTableHeaders = [
      { text: 'Docket', style: 'h4b', alignment: 'left' },
      { text: 'Item Code', style: 'h4b', alignment: 'center' },
      { text: 'Description', style: 'h4b', alignment: 'left' },
      { text: 'Unit', style: 'h4b', alignment: 'center' },
      { text: 'Invoice Qty', style: 'h4b', alignment: 'center' },
      { text: 'Delivered', style: 'h4b', alignment: 'center' },
      { text: 'Returned', style: 'h4b', alignment: 'center' },
      { text: 'Balance', style: 'h4b', alignment: 'center' },
      { text: 'Start Date', style: 'h4b', alignment: 'center' },
      { text: 'End Date', style: 'h4b', alignment: 'center' },
      { text: 'Days', style: 'h4b', alignment: 'center' },
      { text: 'Months', style: 'h4b', alignment: 'center' },
      { text: 'Montly Rent Rate', style: 'h4b', alignment: 'center' },
      { text: 'Total', style: 'h4b', alignment: 'right' },
    ];

    // Define the table body, filtering out the columns based on customInvoice flag

    const summary = {
      table: {
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
          'auto',
          'auto',
          '*',
          '*',
        ],
        body: [summaryTableHeaders, ...items],
      },
      layout: tLayout,
    };

    const data = {
      header: this.getPageNumbers(),
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Invoice-${invoice.code}`),
      content: [
        await this.getBillingHeader(
          isdraft ? 'Invoice Draft' : 'Invoice',
          isdraft ? 'Invoice Draft' : invoice.code,
          invoice.site.name,
          isdraft ? invoice.date : invoice.date,
          company,
          '',
          [
            dataUrl
              ? [
                  '',
                  '',
                  {
                    image: dataUrl,
                    width: 100,
                    rowSpan: 5,
                  },
                  '',
                ]
              : ['', '', '', ''], // Empty text if no image
            [
              { text: 'Job Reference', style: 'h6b' },
              `${invoice?.jobReference || 'N/A'}`,
              '',
              '',
            ],
          ]
        ),
        hr,
        this.getCompanyInfo(invoice.estimate.customer, company),
        hr,
        { text: 'Invoice Items', style: 'h4b', pageBreak: 'before' },
        summary,
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
                    invoice.subtotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Beneficiary:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount:`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    invoice.discount
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
                    invoice.subtotal - invoice.discount - invoice.creditTotal
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                {
                  text: company.branchCode ? 'Branch:' : '',
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
                      ? `${company.currency.symbol} ${this.format(invoice.vat)}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(invoice.tax)}`
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
                    invoice.total
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
              //     text: this.numberToWords(invoice.total),
              //     style: 'h4b',
              //   },
              // ],
            ],
          },
          margin: [0, 10, 0, 0],
          layout: 'noBorders',
        },
        await this.addUploads(invoice.estimate.uploads || []),
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
    return this.generatePdf(data);
  }

  // INVOICE RENTAL MERGED PDF
  async rentalInvoiceMerged(
    invoice: TransactionInvoice,
    company: Company,
    terms: Term | null,
    isdraft?: boolean,
    dataUrl?: any
  ) {
    const estimateItems = [];
    const items = [];
    const mergedItems: TransactionItem[] = [];

    // Iterate over each item in the list
    invoice.items.forEach((item) => {
      // Try to find an existing item in the mergedItems array with the same `itemId` and `invoiceStart`
      const existingItem = mergedItems.find(
        (mergedItem) =>
          mergedItem.itemId === item.itemId &&
          mergedItem.invoiceStart.toDate().toDateString() ===
            item.invoiceStart.toDate().toDateString() &&
          item.transactionType !== 'Return'
      );

      if (existingItem) {
        // If the item exists, merge the quantities
        existingItem.deliveryCode.concat(item.deliveryCode);
        existingItem.invoiceQty += item.invoiceQty;
        existingItem.deliveredQty += item.deliveredQty;
        existingItem.returnTotal += item.returnTotal;
        existingItem.balanceQty += item.balanceQty;
      } else {
        // If no matching item is found, add the current item as is
        mergedItems.push({ ...item });
      }
    });

    if (!invoice.customInvoice) {
      // If customInvoice is false, include all items
      invoice.estimate.items.forEach((item, i) => {
        estimateItems.push(this.addEstimateItem(i, company, item));
      });

      mergedItems.forEach((item) => {
        items.push(this.addRentalItem(company, item, invoice.endDate));
      });
    } else {
      // If customInvoice is true, filter out items without the forInvoice flag
      invoice.estimate.items
        .filter((item) => item.forInvoice)
        .forEach((item, i) => {
          estimateItems.push(this.addEstimateItem(i, company, item));
        });

      mergedItems.forEach((item) => {
        items.push(this.addRentalItemCustom(item, invoice.endDate));
      });
    }
    const estimateSummary = {
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
          ...estimateItems,
        ],
      },
      layout: tLayout,
    };

    // Define table headers based on customInvoice flag
    const summaryTableHeaders = invoice.customInvoice
      ? [
          { text: 'Docket', style: 'h4b', alignment: 'left' },
          { text: 'Item Code', style: 'h4b', alignment: 'center' },
          { text: 'Description', style: 'h4b', alignment: 'left' },
          { text: 'Unit', style: 'h4b', alignment: 'center' },
          { text: 'Delivered', style: 'h4b', alignment: 'center' },
          { text: 'Returned', style: 'h4b', alignment: 'center' },
          { text: 'Balance', style: 'h4b', alignment: 'center' },
          { text: 'Start Date', style: 'h4b', alignment: 'center' },
          { text: 'End Date', style: 'h4b', alignment: 'center' },
          { text: 'Days', style: 'h4b', alignment: 'center' },
          { text: 'Months', style: 'h4b', alignment: 'center' },
        ]
      : [
          { text: 'Docket', style: 'h4b', alignment: 'left' },
          { text: 'Item Code', style: 'h4b', alignment: 'center' },
          { text: 'Description', style: 'h4b', alignment: 'left' },
          { text: 'Unit', style: 'h4b', alignment: 'center' },
          { text: 'Invoice Qty', style: 'h4b', alignment: 'center' },
          { text: 'Delivered', style: 'h4b', alignment: 'center' },
          { text: 'Returned', style: 'h4b', alignment: 'center' },
          { text: 'Balance', style: 'h4b', alignment: 'center' },
          { text: 'Start Date', style: 'h4b', alignment: 'center' },
          { text: 'End Date', style: 'h4b', alignment: 'center' },
          { text: 'Days', style: 'h4b', alignment: 'center' },
          { text: 'Months', style: 'h4b', alignment: 'center' },
          { text: 'Monthly Rent Rate', style: 'h4b', alignment: 'center' },
          { text: 'Total', style: 'h4b', alignment: 'right' },
        ];

    // Define the table body, filtering out the columns based on customInvoice flag

    const summary = {
      table: {
        headerRows: 1,
        widths: invoice.customInvoice
          ? [
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
              'auto',
            ]
          : [
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
              'auto',
              'auto',
              '*',
              'auto',
            ],
        body: [summaryTableHeaders, ...items],
      },
      layout: tLayout,
    };

    const credit = [];
    invoice.creditItems.forEach((item, i) => {
      credit.push([
        {
          text: i + 1,
          style: 'h6',
          alignment: 'center',
        },
        {
          text: item.description,
          style: 'h6',
          alignment: 'left',
        },
        {
          text: `-${company.currency.symbol} ${this.format(item.total)}`,
          style: 'h6',
          alignment: 'right',
        },
      ]);
    });

    const creditSummary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'center' },
            {
              text: 'Description',
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: 'Total',
              style: 'h4b',
              alignment: 'left',
            },
          ],
          ...credit,
        ],
      },
      layout: tLayout,
    };

    const data = {
      header: this.getPageNumbers(),
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Invoice-${invoice.code}`),
      content: [
        await this.getBillingHeader(
          isdraft ? 'Invoice Draft' : 'Invoice',
          isdraft ? 'Invoice Draft' : invoice.code,
          invoice.site.name,
          isdraft ? invoice.date : invoice.date,
          company,
          '',
          [
            dataUrl
              ? [
                  '',
                  '',
                  {
                    image: dataUrl,
                    width: 100,
                    rowSpan: 5,
                  },
                  '',
                ]
              : ['', '', '', ''], // Empty text if no image
            [
              { text: 'Job Reference', style: 'h6b' },
              `${invoice?.jobReference || 'N/A'}`,
              '',
              '',
            ],
          ]
        ),
        hr,
        this.getCompanyInfo(invoice.estimate.customer, company),
        hr,
        { text: invoice.estimate.scope },

        invoice.type !== 'Rental' ? [hr, estimateSummary] : [],
        hr,
        { text: 'Invoice Items', style: 'h4b' },
        summary,
        hr,
        { text: 'Credit Items', style: 'h4b' },
        creditSummary,
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
                '',
                '',
                {
                  text: 'Subtotal:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    invoice.subtotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Bank Name:', style: 'h6b', alignment: 'left' },
                { text: company.bankName, alignment: 'left' },
                {
                  text: 'Credit:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `-${company.currency.symbol} ${this.format(
                    invoice.creditTotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Beneficiary:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount:`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    invoice.discount
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
                    invoice.subtotal - invoice.discount - invoice.creditTotal
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                {
                  text: company.branchCode ? 'Branch:' : '',
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
                      ? `${company.currency.symbol} ${this.format(invoice.vat)}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(invoice.tax)}`
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
                    invoice.total
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
              //     text: this.numberToWords(invoice.total),
              //     style: 'h4b',
              //   },
              // ],
            ],
          },
          layout: 'noBorders',
        },
        await this.addUploads(invoice.estimate.uploads || []),
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
    return this.generatePdf(data);
  }

  // INSPECTION PDF
  async inspection(
    inspection: Inspection,
    company: Company,
    terms: Term | null
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
            true
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
              { text: 'Site Name', style: 'h6b' },
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
          ]
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
    return this.generatePdf(data);
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
            true
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
              { text: 'Site Name', style: 'h6b' },
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
          ]
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
    return this.generatePdf(data);
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
            true
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
          ]
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
    return this.generatePdf(data);
  }

  // DELIVERY INVENTORY PDF
  async delivery(delivery: Delivery, company: Company, terms: Term | null) {
    const summary = this.createShipmentTable(delivery.items);
    const signature1 = delivery.signature
      ? {
          image: await this.getBase64ImageFromURL(
            delivery.signature,
            300,
            200,
            0.6,
            true
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
    const signature2 = delivery.signature2
      ? {
          image: await this.getBase64ImageFromURL(
            delivery.signature2,
            300,
            200,
            0.6,
            true
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
      info: this.getMetaData(`${company.name}-Delivery-${delivery.code}`),
      content: [
        await this.getHeader(
          'Delivery Note',
          delivery.code,
          delivery.site.code,
          delivery.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [
            [
              { text: 'Site Name', style: 'h6b' },
              `${delivery?.site.name || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Job Reference:', style: 'h6b' },
              `${delivery?.jobReference || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Driver:', style: 'h6b' },
              `${delivery?.driverName || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Driver Contact:', style: 'h6b' },
              `${delivery?.driverNo || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Vehicle Reg:', style: 'h6b' },
              `${delivery?.vehicleReg || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Created By:', style: 'h6b' },
              `${delivery?.createdByName || 'N/A'}`,
              '',
              '',
            ],
          ]
        ),
        hr,
        this.getCompanyInfo(delivery.site.customer, company),
        hr,
        summary,
        hr,
        {
          text: `Total Weight : ${this.weightPipe.transform(
            delivery.items,
            true
          )}`,
          style: 'h3',
          alignment: 'right',
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
                },
                {
                  text: delivery.status,
                  style: 'h4b',
                  alignment: 'center',
                },
              ],
              [
                {
                  text: `Sent By ${delivery?.signedBy || 'N/A'}`,
                  style: 'h4b',
                  alignment: 'left',
                },
                signature1,
              ],
              [
                {
                  text: `Received By ${delivery?.signedBy2 || 'N/A'}`,
                  style: 'h4b',
                  alignment: 'left',
                },
                signature2,
              ],
            ],
          },
          layout: tLayout,
        },

        await this.addUploads(delivery.uploads),
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
    };
    return this.generatePdf(data);
  }

  // SITE INVENTORY PDF
  async inventoryList(
    site: Site,
    inventory: InventoryItem[],
    company: Company
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
          []
        ),
        hr,
        summary,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // INVENTORY MATRIX PDF
  async inventoryMatrix(
    company: Company,
    matrix: any[], // Data transformed from downloadMasterlistMatrix
    sites: any[] // Array of all unique site names
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
                    0.8
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
    return this.generatePdf(data);
  }

  // SITE INVENTORY PDF
  async inventoryTransactionList(
    site: Site,
    inventory: TransactionItem[],
    company: Company
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
          []
        ),
        hr,
        summary,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
    };
    return this.generatePdf(data);
  }

  // STOCK LOCATIONS PDF
  async stockLocations(
    item: InventoryItem,
    locations: { site: any; item: InventoryItem }[],
    company: Company
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
            { text: 'Site Name', style: 'h4b', alignment: 'left' },
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
      0
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
          ]
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

    return this.generatePdf(data);
  }

  // DELIVERY PICKLIST PDF
  async pickList(
    docData: Delivery | TransactionReturn,
    inventory: InventoryItem[],
    company: Company
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
        { text: item.location, style: 'h4b', alignment: 'left' },
        { text: item.shipmentQty, style: 'h4b', alignment: 'center' },
        { text: '', style: 'h4b', alignment: 'center' },
      ]);
    });
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
            { text: 'Location', style: 'h4b', alignment: 'left' },
            { text: 'Qty Needed', style: 'h4b', alignment: 'center' },
            { text: 'Picked Qty', style: 'h4b', alignment: 'center' },
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
          'Picklist',
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
          ]
        ),
        hr,
        summary,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // RETURN PICKLIST PDF

  async returnPickList(
    docData: Delivery | TransactionReturn,
    inventory: InventoryItem[] | TransactionItem[],
    company: Company
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
        { text: item.location, style: 'h4b', alignment: 'left' },
        { text: '', style: 'h4b', alignment: 'center' },
      ]);
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', 'auto', '*', 'auto', 'auto'],

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
            { text: 'Picked Qty', style: 'h4b', alignment: 'center' },
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
          'Picklist',
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
          ]
        ),
        hr,
        summary,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // RETURN INVENTORY PDF
  async returnDoc(
    returnDoc: TransactionReturn,
    company: Company,
    terms: Term | null
  ) {
    const signature1 = returnDoc.signature
      ? {
          image: await this.getBase64ImageFromURL(
            returnDoc.signature,
            300,
            200,
            0.6,
            true
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
    const signature2 = returnDoc.signature2
      ? {
          image: await this.getBase64ImageFromURL(
            returnDoc.signature2,
            300,
            200,
            0.6,
            true
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

    const summary = this.createTransactionReturnTable(returnDoc.items);

    // Create overage items table if overage items exist
    const overageSection =
      returnDoc.overageItems && returnDoc.overageItems.length > 0
        ? [
            hr,
            {
              text: 'Overage Items',
              style: 'h2',
              alignment: 'left',
              margin: [0, 10, 0, 5],
            },
            {
              table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: [
                  // Header row
                  [
                    { text: 'Code', style: 'h5b' },
                    { text: 'Name', style: 'h5b' },
                    { text: 'Category', style: 'h5b' },
                    { text: 'Size', style: 'h5b' },
                    { text: 'Location', style: 'h5b' },
                    { text: 'Overage Qty', style: 'h5b' },
                    { text: 'Weight (kg)', style: 'h5b' },
                  ],
                  // Data rows
                  ...returnDoc.overageItems.map((item) => [
                    { text: item.code || 'N/A', style: 'h6' },
                    { text: item.name || 'N/A', style: 'h6' },
                    { text: item.category || 'N/A', style: 'h6' },
                    { text: item.size || 'N/A', style: 'h6' },
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
                ],
              },
              layout: tLayout,
              margin: [0, 5, 0, 10],
            },
            {
              text: `Total Overage Weight: ${returnDoc.overageItems
                .reduce((sum, item) => sum + (item.weight || 0), 0)
                .toFixed(2)} kg`,
              style: 'h4',
              alignment: 'right',
              margin: [0, 5, 0, 0],
            },
          ]
        : [];

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Return-${returnDoc.code}`),
      content: [
        await this.getHeader(
          'Return Note',
          returnDoc.code,
          returnDoc.site.name,
          returnDoc.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [
            [
              { text: 'Site Name', style: 'h6b' },
              `${returnDoc?.site.name || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Driver:', style: 'h6b' },
              `${returnDoc?.driverName || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Driver Contact:', style: 'h6b' },
              `${returnDoc?.driverNo || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Vehicle Reg:', style: 'h6b' },
              `${returnDoc?.vehicleReg || 'N/A'}`,
              '',
              '',
            ],
          ]
        ),
        hr,
        this.getCompanyInfo(company, returnDoc.site.customer),
        hr,
        summary,
        hr,
        {
          text: `Total Weight : ${this.weightPipe.transform(
            returnDoc.items,
            false,
            false,
            false,
            true
          )}`,
          style: 'h3',
          alignment: 'right',
        },
        ...overageSection, // Add overage section here
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
                  text: returnDoc.status,
                  style: 'h4b',
                  alignment: 'center',
                },
              ],
              [
                {
                  text: `Sent By ${returnDoc?.signedBy || 'N/A'}`,
                  style: 'h4b',
                  alignment: 'left',
                },
                signature1,
              ],
              [
                {
                  text: `Received By ${returnDoc?.signedBy2 || 'N/A'}`,
                  style: 'h4b',
                  alignment: 'left',
                },
                signature2,
              ],
            ],
          },
          layout: tLayout,
        },

        await this.addUploads(returnDoc.uploads),
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
    };
    return this.generatePdf(data);
  }

  async transferDoc(
    transferDoc: Transfer,
    company: Company,
    terms: Term | null
  ) {
    const summary = this.createTransactionReturnTable(transferDoc.items);

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Transfer-${transferDoc.code}`),
      content: [
        await this.getHeader(
          'Transfer Note',
          transferDoc.code,
          transferDoc.fromSite?.code || 'N/A',
          transferDoc.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/default.webp',
          null,
          [
            [
              { text: 'Transfer Date', style: 'h6b' },
              `${
                transferDoc?.transferDate
                  ? transferDoc.transferDate.seconds
                    ? new Date(
                        transferDoc.transferDate.seconds * 1000
                      ).toLocaleDateString()
                    : new Date(transferDoc.transferDate).toLocaleDateString()
                  : 'N/A'
              }`,
              '',
              '',
            ],
            [
              { text: 'From PO:', style: 'h6b' },
              `${transferDoc?.fromPO || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'To PO:', style: 'h6b' },
              `${transferDoc?.toPO || 'N/A'}`,
              '',
              '',
            ],
            [
              { text: 'Created By:', style: 'h6b' },
              `${transferDoc?.createdByName || 'N/A'}`,
              '',
              '',
            ],
          ]
        ),
        hr,
        this.getCompanyInfo(
          transferDoc.toSite?.customer,
          transferDoc.fromSite?.customer
        ),

        hr,
        { text: transferDoc.notes || '', style: 'h6', margin: [0, 10, 0, 10] },
        hr,
        summary,
        hr,
        {
          text: `Total Weight : ${this.weightPipe.transform(
            transferDoc.items,
            false,
            false,
            false,
            true
          )}`,
          style: 'h3',
          alignment: 'right',
        },
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
                  text: transferDoc.status,
                  style: 'h4b',
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: tLayout,
        },

        await this.addUploads(transferDoc.uploads),
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
      pageOrientation: 'landscape',
    };
    return this.generatePdf(data);
  }

  async overReturnDoc(
    overReturnDoc: TransactionReturn,
    company: Company,
    terms: Term | null
  ) {
    const signature1 = overReturnDoc.signature
      ? {
          image: await this.getBase64ImageFromURL(
            overReturnDoc.signature,
            300,
            200,
            0.6,
            true
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
            true
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
                        ]
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
        `${company.name}-OverReturn-${overReturnDoc.code}`
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
              { text: 'Site Name', style: 'h6b' },
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
          ]
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
      pageOrientation: 'landscape',
    };
    return this.generatePdf(data);
  }

  async overReturnedItemsReport(
    returns: TransactionReturn[],
    company: Company,
    terms: Term | null
  ) {
    // Filter returns that have overage items
    const returnsWithOverage = returns.filter(
      (returnDoc) => returnDoc.overageItems && returnDoc.overageItems.length > 0
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
      0
    );
    const totalOverageWeight = allOverageItems.reduce(
      (sum, item) => sum + (item.shipmentQty || 0) * (item.weight || 0),
      0
    );
    const totalOverageValue = allOverageItems.reduce(
      (sum, item) => sum + (item.shipmentQty || 0) * (item.hireCost || 0),
      0
    );

    // Create overage items table
    const overageTableBody: any = [
      // Header row
      [
        { text: 'Return Code', style: 'h6b', alignment: 'center' },
        { text: 'Return Date', style: 'h6b', alignment: 'center' },
        { text: 'Site Name', style: 'h6b', alignment: 'center' },
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
          ]
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

    return this.generatePdf(data);
  }

  async masterInventoryList(
    inventory: InventoryItem[],
    location: string,
    company: Company
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
          []
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

    return this.generatePdf(data);
  }

  // UTILITY FUNCTIONS

  async generatePdf(data) {
    return pdfMake.createPdf(data);
  }
  private async getHeader(
    title: string,
    code: string,
    siteName: string,
    date: any,
    url: string,
    link?: string,
    data?: any
  ) {
    const linkData = link
      ? [
          { text: 'View Online:', style: 'h6b' },
          {
            text: 'Click here to view online',
            style: ['h6b', { color: 'blue' }],
            link,
          },
          '',
          '',
        ]
      : ['', '', '', ''];

    const header = {
      style: 'tableExample',
      table: {
        widths: ['*', '*', '*', '*'],

        body: [
          [
            { text: title, style: 'header', colSpan: 2 },
            '',

            {
              colSpan: 2,
              rowSpan: 5,
              width: 100,
              image: await this.getBase64ImageFromURL(url, 400, 300, 0.8),
              alignment: 'right',
            },
            '',
          ],
          [{ text: 'Code:', style: 'h6b' }, `${code}`, '', ''],
          [{ text: 'Project:', style: 'h6b' }, `${siteName}`, '', ''],
          ...data,
          [
            { text: 'Date Issued:', style: 'h6b' },
            `${this.toDate(date)}`,
            '',
            '',
          ],
          linkData,
        ],
      },
      layout: 'noBorders',
    };
    return header;
  }
  private async getBillingHeader(
    title: string,
    code: string,
    siteName: string,
    date: any,
    company: Company,
    link?: string,
    data?: any
  ) {
    const linkData = link
      ? [
          { text: 'View Online:', style: 'h6b' },
          {
            text: 'Click here to view online',
            style: ['h6b', { color: 'blue' }],
            link,
          },
          '',
          '',
        ]
      : ['', '', '', ''];

    const header = {
      style: 'tableExample',
      table: {
        widths: ['*', '*', '*', '*'],

        body: [
          [
            {
              fit: [760, 200],
              image: await this.getBase64ImageFromURL(
                company.subHeaderUrl || defaultSubHeader,
                760,
                200,
                0.8
              ),
              colSpan: 4,
            },
            '',
            '',
            '',
          ],

          [{ text: title, style: 'header', colSpan: 2 }, '', '', ''],
          ...data,
          [{ text: 'Code:', style: 'h6b' }, `${code}`, '', ''],
          [{ text: 'Project:', style: 'h6b' }, `${siteName}`, '', ''],
          [
            { text: 'Date Issued:', style: 'h6b' },
            `${this.toDate(date)}`,
            '',
            '',
          ],
          linkData,
        ],
      },
      layout: 'noBorders',
    };
    return header;
  }

  private getCompanyInfo(
    customer: Customer | Company,
    company: Company | Customer
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
            { text: 'Registration No:', style: 'h6b' },
            customer.regNumber ? customer.regNumber : 'N/A',
            { text: 'Registration No:', style: 'h6b' },
            company.regNumber ? company.regNumber : 'N/A',
          ],
          [
            { text: 'VAT No:', style: 'h6b' },
            customer.vatNum ? customer.vatNum : 'N/A',
            { text: 'VAT No:', style: 'h6b' },
            company.vatNum ? company.vatNum : 'N/A',
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
      upload.type?.startsWith('image')
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
                    0.6
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
    isRental: boolean
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
          isRental ? item.hireCost : item.sellingCost
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
    endDate?: any
  ) {
    let start = null;
    let end = null;
    let days = null;
    let code = null;
    if (item.transactionType === 'Delivery') {
      code = item.deliveryCode;
      start = item.invoiceStart.toDate();
      end = endDate;
      days = +this.dateDiffPipe.transform(start, end);
    } else {
      code = item.returnCode;
      start = item.invoiceStart.toDate();
      end = item.invoiceEnd.toDate();
      days = +this.dateDiffPipe.transform(start, end);
    }
    const months = +this.format(days / 30);
    const total = +item.invoiceQty * +item.hireRate * months;
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
    let code = null;
    if (item.transactionType === 'Delivery') {
      code = item.deliveryCode;
      start = item.invoiceStart.toDate();
      end = endDate;
      days = +this.dateDiffPipe.transform(start, end);
    } else {
      code = item.returnCode;
      start = item.invoiceStart.toDate();
      end = item.invoiceEnd.toDate();
      days = +this.dateDiffPipe.transform(start, end);
    }
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
        text: item.name,
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

  private createShipmentTable(shipmentItems: InventoryItem[]) {
    const items = [];
    shipmentItems.forEach((item, i) => {
      items.push([
        { text: i + 1, style: 'h4b', alignment: 'left' },
        { text: item.code, style: 'h4b', alignment: 'left' },
        {
          text: item.category,
          style: 'h4b',
          alignment: 'left',
        },
        { text: item.size, style: 'h4b', alignment: 'center' },
        { text: item.name, style: 'h4b', alignment: 'left' },
        { text: item.shipmentQty, style: 'h4b', alignment: 'center' },
        {
          text: this.decimalPipe.transform(
            (+item?.weight || 0) * (+item?.shipmentQty || 0)
          ),
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
        widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Code', style: 'h4b', alignment: 'left' },
            {
              text: 'Category',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Size', style: 'h4b', alignment: 'center' },
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Item Qty', style: 'h4b', alignment: 'center' },
            { text: 'Weight', style: 'h4b', alignment: 'center' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
    };

    return summary;
  }

  private createTransactionReturnTable(transactionItems: TransactionItem[]) {
    const items = [];
    transactionItems.forEach((item, i) => {
      items.push([
        { text: i + 1, style: 'h4b', alignment: 'left' },
        { text: item.code, style: 'h4b', alignment: 'left' },
        {
          text: item.category,
          style: 'h4b',
          alignment: 'left',
        },
        { text: item.size, style: 'h4b', alignment: 'center' },
        { text: item.name, style: 'h4b', alignment: 'left' },
        { text: item.returnQty, style: 'h4b', alignment: 'center' },
        {
          text: this.decimalPipe.transform(
            (+item?.weight || 0) * (+item?.returnQty || 0)
          ),
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
        widths: ['auto', 'auto', '*', 'auto', '*', 'auto', 'auto'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Code', style: 'h4b', alignment: 'left' },
            {
              text: 'Category',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Size', style: 'h4b', alignment: 'center' },
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Item Qty', style: 'h4b', alignment: 'center' },
            { text: 'Weight', style: 'h4b', alignment: 'center' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
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
    const footerCS = [];
    if (removeBranding) {
      return footerCS;
    } else if (replaceBranding) {
      footerCS.push([
        {
          image: await this.getBase64ImageFromURL(
            replaceBranding,
            300,
            200,
            0.8
          ),
          width: 100,
          alignment: 'right',
          margin: [0, -10, 20, 0],
        },
      ]);
    } else if (!removeBranding && !replaceBranding && companyState) {
      footerCS.push([
        {
          svg: footerlogo,
          width: 150,
          alignment: 'right',
          margin: [0, 5, 20, 0],
        },
      ]);
    }
    return footerCS;
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
    preserveTransparency = false
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
    return this.datePipe.transform(
      new Date(date),
      hideTimestamp ? 'dd MMM yyyy' : 'dd MMM yyyy (HH:mm)'
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
