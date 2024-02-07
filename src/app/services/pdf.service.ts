/* eslint-disable max-len */
import { DecimalPipe } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Platform } from '@ionic/angular';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Term } from 'src/app/models/term.model';
import { environment } from 'src/environments/environment';
import { BulkEstimate } from '../models/bulkEstimate.model';
import { BulkInventoryEstimate } from '../models/bulkInventoryEstimate.model';
import { Credit } from '../models/credit.model';
import { Handover } from '../models/handover.model';
import { Inspection } from '../models/inspection.model';
import { InventoryEstimate } from '../models/inventoryEstimate.model';
import { Invoice } from '../models/invoice.model';
import { Modification } from '../models/modification.model';
import { PaymentApplication } from '../models/paymentApplication.model';
import { Statement } from '../models/statement.mode';
import { Item } from '../models/item.model';
import { Shipment } from '../models/shipment.model';
import { InventoryItem } from '../models/inventoryItem.model';
import { Site } from '../models/site.model';
import { AdditionalItem } from '../models/additionalItem.model';
import { LabourItem } from '../models/labourItem.model';
import { TransportItem } from '../models/transport.model';
import { UploadedFile } from '../models/uploadedFile.model';
import { Return } from '../models/return.model';
import { Store } from '@ngxs/store';
import { CompanyState } from '../shared/company/company.state';
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
@Injectable({
  providedIn: 'root',
})
export class PdfService {
  pdfMake: any;
  private store = inject(Store);
  constructor(
    private decimalPipe: DecimalPipe,
    private platformService: Platform,
    private fileOpenerService: FileOpener
  ) {}

  handlePdf(pdf: any, filename: string) {
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
    } else {
      return false;
    }
  }
  // ESTIMATE STANDARD PDF
  async generateEstimate(
    estimate: Estimate,
    company: Company,
    terms: Term | null
  ) {
    const attachments = [];
    estimate.attachments.forEach((a) => {
      attachments.push(
        this.addEstimateItem(
          company,
          `${company.terminology.scaffold} Level ${a.level} - (${a.length}${
            company.measurement.symbol
          } x ${a.width}${company.measurement.symbol} x ${a.height}${
            company.measurement.symbol
          }) ${a.lifts > 0 ? '(' + a.lifts + ' Lifts)' : ''} ${
            a.boardedLifts > 0 ? '(' + a.boardedLifts + ' Boarded lifts)' : ''
          } - ${a.type} ${a.description}`,
          1,
          a.total
        )
      );
      attachments.push(
        this.addEstimateItem(
          company,
          ` - ${company.terminology.hire} ${a.description} - (${
            a.daysStanding
          } ${a.isWeeks ? 'weeks' : 'days'})`,
          a.daysStanding,
          a.hireTotal
        )
      );
    });
    const platforms = [];
    estimate.boards.forEach((b) => {
      platforms.push(
        this.addEstimateItem(
          company,
          `${company.terminology.boards} - (${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol}) - Level (${b.height}${company.measurement.symbol})`,
          b.qty,
          b.total
        )
      );
    });
    const labour = [];
    estimate.labour.forEach((l) => {
      labour.push(
        this.addEstimateItem(
          company,
          `${l.type.name} - ${l.rate.name}`,
          l.qty,
          l.total
        )
      );
    });
    const transport = [];
    estimate.transport.forEach((l) => {
      transport.push(
        this.addEstimateItem(
          company,
          `${l.type.name} - ${l.type.maxLoad}${company.mass.symbol}`,
          l.qty,
          l.total
        )
      );
    });
    const additionals = [];
    estimate.additionals.forEach((a) => {
      additionals.push(this.addEstimateItem(company, a.name, a.qty, a.total));
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', 'auto', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            {
              text: estimate.scaffold.description
                ? estimate.scaffold.description
                : 'Description',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          [
            {
              text: 1,
              style: 'h4b',
            },
            {
              text: `${company.terminology.scaffold} Details`,
              style: 'h4b',
              colSpan: 3,
            },
          ],
          this.addEstimateItem(
            company,
            `${company.terminology.scaffold} Level 0 - (${
              estimate.scaffold.length
            }${company.measurement.symbol} x ${estimate.scaffold.width}${
              company.measurement.symbol
            } x ${estimate.scaffold.height}${company.measurement.symbol}) ${
              estimate.scaffold.lifts > 0
                ? '(' + estimate.scaffold.lifts + ' lifts)'
                : ''
            } ${
              estimate.scaffold.boardedLifts > 0
                ? '(' + estimate.scaffold.boardedLifts + ' Boarded lifts)'
                : ''
            } - ${estimate.scaffold.type} ${estimate.scaffold.description}`,
            1,
            estimate.scaffold.total
          ),
          this.addEstimateItem(
            company,
            ` - ${company.terminology.hire} ${
              estimate.scaffold.description
            } - (${estimate.scaffold.daysStanding} ${
              estimate.scaffold.isWeeks ? 'weeks' : 'days'
            })`,
            estimate.scaffold.daysStanding,
            estimate.scaffold.hireTotal
          ),
          ...attachments,
          ...platforms,
          this.addEstimateItem(
            company,
            `${company.terminology.hire} - (${estimate.hire.daysStanding} ${
              estimate.hire.isWeeks ? 'weeks' : 'days'
            })`,
            estimate.hire.daysStanding,
            estimate.hire.total
          ),
          [
            {
              text: 2,
              style: 'h4b',
            },
            {
              text: 'Labor Details',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...labour,
          [
            {
              text: 3,
              style: 'h4b',
            },
            {
              text: 'Transport Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...transport,
          [
            {
              text: 4,
              style: 'h4b',
            },
            {
              text: 'Additionals Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...additionals,
        ],
      },
      layout: tLayout,
    };

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Estimate-${estimate.code}`),
      content: [
        await this.getHeader(
          'Estimate',
          estimate.code,
          estimate.siteName,
          estimate.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/favicon.png',
          `https://app.cloudscaff.com/viewEstimate/${company.id}-${estimate.id}`,
          []
        ),
        hr,
        this.getSubHeader(estimate.customer, company),
        hr,
        { text: estimate.message },
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
                { text: 'Bank:', style: 'h6b', alignment: 'left' },
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
                { text: 'Account Name:', style: 'h6b', alignment: 'left' },
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
                { text: 'Account Number:', style: 'h6b', alignment: 'left' },
                { text: company.accountNum, alignment: 'left' },
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
                  text: company.swiftCode ? 'SWIFT / BIC Code:' : '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: company.swiftCode ? company.swiftCode : '',
                  alignment: 'left',
                },
                {
                  text:
                    company.vat > 0
                      ? `${company.gst ? 'GST' : 'VAT'} (${company.vat}%):`
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
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
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
              [
                {
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
                  alignment: 'left',
                },
                {
                  text: 'Extra Hire:',
                  style: 'h3',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    estimate.extraHire ? estimate.extraHire : 0
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                },
              ],
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
    };
    return this.generatePdf(data);
  }

  // ESTIMATE BULK PDF
  async generateBulkEstimate(
    bulkEstimate: BulkEstimate,
    company: Company,
    terms: Term | null
  ) {
    const scaffolds = [];
    bulkEstimate.estimates.forEach((e, i) => {
      const summary = this.createEstimateTable(e, company);
      scaffolds.push({ text: `Scaffold ${i + 1}`, style: ['h4b'] });
      scaffolds.push(summary);
      scaffolds.push(hr);
    });

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Estimate-${bulkEstimate.code}`),
      content: [
        await this.getHeader(
          'Estimate',
          bulkEstimate.code,
          bulkEstimate.siteName,
          bulkEstimate.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/favicon.png',
          `https://app.cloudscaff.com/viewBulkEstimate/${company.id}-${bulkEstimate.id}`,
          []
        ),
        hr,
        this.getSubHeader(bulkEstimate.customer, company),
        hr,
        { text: bulkEstimate.message },
        hr,
        ...scaffolds,
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
                { text: 'Bank:', style: 'h6b', alignment: 'left' },
                { text: company.bankName, alignment: 'left' },
                {
                  text: 'Subtotal:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    bulkEstimate.subtotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Account Name:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount (${bulkEstimate.discountPercentage}%):`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    bulkEstimate.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                { text: 'Account Number:', style: 'h6b', alignment: 'left' },
                { text: company.accountNum, alignment: 'left' },
                {
                  text: `Contract Total:`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    bulkEstimate.subtotal - bulkEstimate.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
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
                  text:
                    company.vat > 0
                      ? `${company.gst ? 'GST' : 'VAT'} (${company.vat}%):`
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
                          bulkEstimate.vat
                        )}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(
                          bulkEstimate.tax
                        )}`
                      : '',

                  alignment: 'right',
                  style: ['h6b', 'mt5'],
                },
              ],
              [
                {
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
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
                    bulkEstimate.total
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
              ],
              [
                {
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
                  alignment: 'left',
                },
                {
                  text: 'Extra Hire:',
                  style: 'h3',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    bulkEstimate.extraHire ? bulkEstimate.extraHire : 0
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        await this.addUploads(bulkEstimate.uploads),
        {
          text: 'Terms & Conditions',
          style: ['h4b', 'm20'],
          pageBreak: 'before',
        },
        { text: terms ? terms.terms : '' },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // ESTIMATE BULK PDF
  async generatePaymentApplication(
    paymentApplication: PaymentApplication,
    company: Company,
    terms: Term | null
  ) {
    const scaffolds = [];
    const type1 = [
      {
        text: 'Measured Work',
        style: ['h6b', { fillColor: '#fafafa', color: '#2cac76' }],
        colSpan: 21,
      },
    ];
    scaffolds.push(type1);
    let counterT1 = 0;
    paymentApplication.estimates.forEach((e) => {
      if (e.type === 'measured') {
        counterT1 = this.addPAScaffold(e, scaffolds, counterT1, company);
      }
      if (e.type === 'bulk-measured') {
        counterT1 = this.addPAScaffold(e, scaffolds, counterT1, company);
      }
      if (e.type === 'measured-custom') {
        counterT1 = this.addPAScaffold(e, scaffolds, counterT1, company);
      }
    });
    const type2 = [
      {
        text: 'Variation Orders',
        style: ['h6b', { fillColor: '#fafafa', color: '#2cac76' }],
        colSpan: 21,
      },
    ];
    scaffolds.push(type2);
    let counterT2 = 0;
    paymentApplication.estimates.forEach((e, i) => {
      if (e.type === 'variation') {
        counterT2 = this.addPAScaffold(e, scaffolds, counterT2, company);
      }
      if (e.type === 'variation-custom') {
        counterT2 = this.addPAScaffold(e, scaffolds, counterT2, company);
      }
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: [
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
          'auto',
          'auto',
          'auto',
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
            { text: '#', style: 'custom', alignment: 'left' },
            {
              text: 'Description',
              style: 'custom',
              alignment: 'left',
            },
            { text: 'Value	', style: 'custom', alignment: 'center' },
            { text: 'On Hire Date	', style: 'custom', alignment: 'center' },
            { text: 'Handover No.', style: 'custom', alignment: 'center' },
            { text: 'Erect Value', style: 'custom', alignment: 'center' },
            {
              text: 'Erect % Applied For',
              style: 'custom',
              alignment: 'center',
            },
            {
              text: 'Erect Value Applied For',
              style: 'custom',
              alignment: 'center',
            },
            { text: 'Weeks Hire Inc', style: 'custom', alignment: 'center' },
            { text: 'Hire End', style: 'custom', alignment: 'center' },
            { text: 'Off Hire Date', style: 'custom', alignment: 'center' },
            { text: 'Dismantle Value', style: 'custom', alignment: 'center' },
            {
              text: 'Dismantle % Applied For',
              style: 'custom',
              alignment: 'center',
            },
            {
              text: 'Dismantle Value Applied For',
              style: 'custom',
              alignment: 'center',
            },

            { text: 'EH %', style: 'custom', alignment: 'center' },
            {
              text: 'EH Rate PW',
              style: 'custom',
              alignment: 'center',
            },
            {
              text: 'Inspect/EH Weeks',
              style: 'custom',
              alignment: 'center',
            },
            {
              text: 'Inspect/EH Charge',
              style: 'custom',
              alignment: 'center',
            },
            { text: 'Previous Gross', style: 'custom', alignment: 'center' },
            { text: 'Total Gross', style: 'custom', alignment: 'center' },
            { text: 'Current Total', style: 'custom', alignment: 'center' },
          ],
          ...scaffolds,
        ],
      },
      layout: tLayout,
      pageBreak: 'before',
    };

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-PA-${paymentApplication.code}`),
      content: [
        await this.getHeader(
          'Payment Application',
          paymentApplication.code,
          `${paymentApplication.site.code}-${paymentApplication.site.name}`,
          paymentApplication.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/favicon.png',
          null,
          [
            [
              { text: 'Due Date:', style: 'h6b' },
              this.toDate(paymentApplication.dueDate),
              '',
              '',
            ],
          ]
        ),
        hr,
        this.getSubHeader(paymentApplication.site.customer, company),
        hr,
        // { text: paymentApplication.message },
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
                { text: 'Bank:', style: 'h6b', alignment: 'left' },
                { text: company.bankName, alignment: 'left' },
                {
                  text: 'Subtotal:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    paymentApplication.currentTotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Account Name:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount (0%):`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(0)}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                { text: 'Account Number:', style: 'h6b', alignment: 'left' },
                { text: company.accountNum, alignment: 'left' },
                {
                  text: `Contract Total:`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    paymentApplication.currentTotal
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
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
                  text:
                    company.vat > 0
                      ? `${company.gst ? 'GST' : 'VAT'} (${company.vat}%):`
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
                          paymentApplication.vat
                        )}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(
                          paymentApplication.tax
                        )}`
                      : '',

                  alignment: 'right',
                  style: ['h6b', 'mt5'],
                },
              ],
              [
                {
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
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
                    paymentApplication.total
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        hr,

        summary,
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

  // ESTIMATE INVENTORY PDF
  async generateInventoryEstimate(
    inventoryEstimate: BulkInventoryEstimate,
    company: Company,
    terms: Term | null
  ) {
    const shipments = [];
    inventoryEstimate.estimates.forEach((e, i) => {
      const summary = this.createInventoryTable(e, company);
      shipments.push({
        text: `Shipment ${i + 1} (${e.startDate} - ${e.endDate})`,
        style: ['h4b'],
      });
      shipments.push(summary);
      shipments.push(hr);
    });

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(
        `${company.name}-Estimate-${inventoryEstimate.code}`
      ),
      content: [
        await this.getHeader(
          'Estimate',
          inventoryEstimate.code,
          inventoryEstimate.siteName,
          inventoryEstimate.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/favicon.png',
          `https://app.cloudscaff.com/viewInventoryEstimate/${company.id}-${inventoryEstimate.id}`,
          []
        ),
        hr,
        this.getSubHeader(inventoryEstimate.customer, company),
        hr,
        { text: inventoryEstimate.message },
        hr,
        ...shipments,
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
                { text: 'Bank:', style: 'h6b', alignment: 'left' },
                { text: company.bankName, alignment: 'left' },
                {
                  text: 'Subtotal:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    inventoryEstimate.subtotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Account Name:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount (${inventoryEstimate.discountPercentage}%):`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    inventoryEstimate.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                { text: 'Account Number:', style: 'h6b', alignment: 'left' },
                { text: company.accountNum, alignment: 'left' },
                {
                  text: `Contract Total:`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    inventoryEstimate.subtotal - inventoryEstimate.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
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
                  text:
                    company.vat > 0
                      ? `${company.gst ? 'GST' : 'VAT'} (${company.vat}%):`
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
                          inventoryEstimate.vat
                        )}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(
                          inventoryEstimate.tax
                        )}`
                      : '',

                  alignment: 'right',
                  style: ['h6b', 'mt5'],
                },
              ],
              [
                {
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
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
                    inventoryEstimate.total
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
              ],
              [
                {
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
                  alignment: 'left',
                },
                {
                  text: 'Extra Hire:',
                  style: 'h3',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    inventoryEstimate.extraHire
                      ? inventoryEstimate.extraHire
                      : 0
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        await this.addUploads(inventoryEstimate.uploads),
        {
          text: 'Terms & Conditions',
          style: ['h4b', 'm20'],
          pageBreak: 'before',
        },
        { text: terms ? terms.terms : '' },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // BUDGET STANDARD PDF
  async generateBudget(
    estimate:
      | Estimate
      | BulkEstimate
      | InventoryEstimate
      | BulkInventoryEstimate,
    company: Company
  ) {
    const budget = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['*', '*', '*', '*'],
        body: [
          [
            {
              text: `Total Exc ${company.gst ? 'GST' : 'VAT'} (${
                company.currency.symbol
              })`,
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: `Total Spend (${company.currency.symbol})`,
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: `Total Profit (${company.currency.symbol})`,
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: `Total Profit %`,
              style: 'h4b',
              alignment: 'center',
            },
          ],
          [
            {
              text: `${company.currency.symbol} ${this.format(
                estimate.budget.subtotal
              )}`,
              style: 'h6',
              alignment: 'center',
            },
            {
              text: `${company.currency.symbol} ${this.format(
                estimate.budget.cost
              )}`,
              style: 'h6',
              alignment: 'center',
            },
            {
              text: `${company.currency.symbol} ${this.format(
                estimate.budget.profit
              )}`,
              style: 'h6',
              alignment: 'center',
            },
            {
              text: `${this.format(estimate.budget.margin)}%`,
              style: 'h6',
              alignment: 'center',
            },
          ],
        ],
      },
      layout: tLayout,
    };
    const spend = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['*', '*', '*'],
        body: [
          [
            {
              text: 'Name',
              style: 'h4b',
              alignment: 'left',
            },
            {
              text: `% of Spend`,
              style: 'h4b',
              alignment: 'right',
            },
            {
              text: `Total (${company.currency.symbol})`,
              style: 'h4b',
              alignment: 'right',
            },
          ],
          [
            {
              text: 'Labor',
              style: 'h6',
              alignment: 'left',
            },
            {
              text: `${this.format(estimate.budget.labourPercentage)}%`,
              style: 'h6',
              alignment: 'right',
            },
            {
              text: `${company.currency.symbol} ${this.format(
                estimate.budget.labourTotal
              )}`,
              style: 'h6',
              alignment: 'right',
            },
          ],
          [
            {
              text: 'Material',
              style: 'h6',
              alignment: 'left',
            },
            {
              text: `${this.format(estimate.budget.materialPercentage)}%`,
              style: 'h6',
              alignment: 'right',
            },
            {
              text: `${company.currency.symbol} ${this.format(
                estimate.budget.materialTotal
              )}`,
              style: 'h6',
              alignment: 'right',
            },
          ],
          [
            {
              text: 'Transport',
              style: 'h6',
              alignment: 'left',
            },
            {
              text: `${this.format(estimate.budget.transportPercentage)}%`,
              style: 'h6',
              alignment: 'right',
            },
            {
              text: `${company.currency.symbol} ${this.format(
                estimate.budget.transportTotal
              )}`,
              style: 'h6',
              alignment: 'right',
            },
          ],
        ],
      },
      layout: tLayout,
    };
    const labor = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['*', '*', '*', '*', '*'],
        body: [
          [
            {
              text: 'Rate',
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: 'No. of Operatives',
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: `Total per day (${company.currency.symbol})`,
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: 'Days',
              style: 'h4b',
              alignment: 'center',
            },
            {
              text: 'Weeks',
              style: 'h4b',
              alignment: 'center',
            },
          ],
          [
            {
              text: `${company.currency.symbol} ${this.format(
                estimate.budget.labourRate
              )}`,
              style: 'h6',
              alignment: 'center',
            },
            {
              text: estimate.budget.noOps,
              style: 'h6',
              alignment: 'center',
            },
            {
              text: `${company.currency.symbol} ${this.format(
                estimate.budget.totalPerDay
              )}`,
              style: 'h6',
              alignment: 'center',
            },
            {
              text: estimate.budget.days,
              style: 'h6',
              alignment: 'center',
            },
            {
              text: estimate.budget.weeks,
              style: 'h6',
              alignment: 'center',
            },
          ],
        ],
      },
      layout: tLayout,
    };

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Budget-${estimate.code}`),
      content: [
        await this.getHeader(
          'Budget',
          estimate.code,
          estimate.siteName,
          estimate.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/favicon.png',
          null,
          []
        ),
        hr,
        {
          text: 'Budget Breakdown',
          style: ['h4b', 'm20'],
        },
        budget,
        {
          text: 'Spend Breakdown',
          style: ['h4b', 'm20'],
        },
        spend,
        {
          text: 'Labor Breakdown',
          style: ['h4b', 'm20'],
        },
        labor,
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // MODIFICATION STANDARD PDF
  async generateModification(
    modification: Modification,
    company: Company,
    terms: Term | null
  ) {
    const oldScaffold = this.createModificatonSummary(
      {
        scaffold: modification.oldScaffold.scaffold,
        attachments: modification.oldScaffold.attachments,
        boards: modification.oldScaffold.boards,
        hire: modification.oldScaffold.hire,
        additionals: modification.oldScaffold.additionals,
        labour: modification.oldScaffold.labour,
        transport: modification.oldScaffold.transport
          ? modification.oldScaffold.transport
          : [],
      },
      company
    );
    const currentScaffold = this.createModificatonSummary(
      {
        scaffold: modification.scaffold,
        attachments: modification.attachments,
        boards: modification.boards,
        hire: modification.hire,
        additionals: modification.additionals,
        labour: modification.labour,
        transport: modification.transport ? modification.transport : [],
      },
      company
    );
    const summary = this.createScaffoldSummaryDetailed(
      {
        scaffold: modification.scaffold,
        attachments: modification.attachments,
        boards: modification.boards,
        hire: modification.hire,
        additionals: modification.additionals,
        labour: modification.labour,
        transport: modification.transport ? modification.transport : [],
      },
      company
    );

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(
        `${company.name}-Modification-${modification.code}`
      ),
      content: [
        await this.getHeader(
          'Modification',
          modification.code,
          modification.siteName,
          modification.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/favicon.png',
          `https://app.cloudscaff.com/viewModification/${company.id}-${modification.id}`,
          []
        ),
        hr,
        this.getSubHeader(modification.customer, company),
        hr,
        { text: modification.message },
        hr,
        { text: 'Before Modification', style: 'h4b' },
        oldScaffold,
        hr,
        { text: 'After Modification', style: 'h4b' },
        currentScaffold,
        hr,
        { text: 'Modification Summary', style: 'h4b' },
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
                { text: 'Bank:', style: 'h6b', alignment: 'left' },
                { text: company.bankName, alignment: 'left' },
                {
                  text: 'Subtotal:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    modification.subtotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Account Name:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount (${modification.discountPercentage}%):`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    modification.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                { text: 'Account Number:', style: 'h6b', alignment: 'left' },
                { text: company.accountNum, alignment: 'left' },
                {
                  text: `Contract Total:`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    modification.subtotal - modification.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
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
                  text:
                    company.vat > 0
                      ? `${company.gst ? 'GST' : 'VAT'} (${company.vat}%):`
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
                          modification.vat
                        )}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(
                          modification.tax
                        )}`
                      : '',

                  alignment: 'right',
                  style: ['h6b', 'mt5'],
                },
              ],
              [
                {
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
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
                    modification.total
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          text: 'Terms & Conditions',
          style: ['h4b', 'm20'],
          pageBreak: 'before',
        },
        { text: terms ? terms.terms : '' },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // INSPECTION PDF
  async generateInspection(
    inspection: Inspection,
    company: Company,
    terms: Term | null
  ) {
    const attachments = [];
    inspection.scaffold.attachments.forEach((a, i) => {
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
              text: `${company.terminology.scaffold} Level 0`,
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
    inspection.questions.categories.forEach((c) => {
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
            : 'assets/icon/favicon.png',
          `https://app.cloudscaff.com/viewInspection/${company.id}-${inspection.id}`,
          [
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
          ]
        ),
        hr,
        this.getSubHeader(inspection.customer, company),
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
  async generateHandover(
    handover: Handover,
    company: Company,
    terms: Term | null
  ) {
    const attachments = [];
    handover.scaffold.attachments.forEach((a, i) => {
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
              text: `${company.terminology.scaffold} Level 0`,
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
          image: await this.getBase64ImageFromURL(handover.signature),
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
            : 'assets/icon/favicon.png',
          `https://app.cloudscaff.com/viewHandover/${company.id}-${handover.id}`,
          [
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
          ]
        ),
        hr,
        this.getSubHeader(handover.customer, company),
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

  // INVOICE STANDARD PDF
  async generateInvoice(
    invoice: Invoice,
    company: Company,
    terms: Term | null
  ) {
    const attachments = [];
    invoice.attachments.forEach((a) => {
      attachments.push(
        this.addEstimateItem(
          company,
          `${company.terminology.scaffold} Level ${a.level} - (${a.length}${
            company.measurement.symbol
          } x ${a.width}${company.measurement.symbol} x ${a.height}${
            company.measurement.symbol
          }) ${a.lifts > 0 ? '(' + a.lifts + 'lifts)' : ''} - ${a.description}`,
          1,
          a.total
        )
      );
    });
    const platforms = [];
    invoice.boards.forEach((b) => {
      platforms.push(
        this.addEstimateItem(
          company,
          `${company.terminology.boards} - (${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol}) - Level (${b.height}${company.measurement.symbol})`,
          b.qty,
          b.total
        )
      );
    });
    const labour = [];
    invoice.labour.forEach((l) => {
      labour.push(
        this.addEstimateItem(
          company,
          `${l.type.name} - ${l.rate.name}`,
          l.qty,
          l.total
        )
      );
    });
    const transport = [];
    invoice.transport.forEach((l) => {
      transport.push(
        this.addEstimateItem(
          company,
          `${l.type.name} - ${l.type.maxLoad}${company.mass.symbol}`,
          l.qty,
          l.total
        )
      );
    });
    const additionals = [];
    invoice.additionals.forEach((a) => {
      additionals.push(this.addEstimateItem(company, a.name, a.qty, a.total));
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', 'auto', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            {
              text: invoice.scaffold.description
                ? invoice.scaffold.description
                : 'Description',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          [
            {
              text: 1,
              style: 'h4b',
            },
            {
              text: `${company.terminology.scaffold} Details`,
              style: 'h4b',
              colSpan: 3,
            },
          ],
          this.addEstimateItem(
            company,
            `${company.terminology.scaffold} Level 0 - (${
              invoice.scaffold.length
            }${company.measurement.symbol} x ${invoice.scaffold.width}${
              company.measurement.symbol
            } x ${invoice.scaffold.height}${company.measurement.symbol}) ${
              invoice.scaffold.lifts > 0
                ? '(' + invoice.scaffold.lifts + 'lifts)'
                : ''
            } - ${invoice.scaffold.description}`,
            1,
            invoice.scaffold.total
          ),
          ...attachments,
          ...platforms,
          this.addEstimateItem(
            company,
            `${company.terminology.hire} - (${invoice.hire.daysStanding} ${
              invoice.hire.isWeeks ? 'weeks' : 'days'
            })`,
            invoice.hire.daysStanding,
            invoice.hire.total
          ),
          [
            {
              text: 2,
              style: 'h4b',
            },
            {
              text: 'Labor Details',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...labour,
          [
            {
              text: 3,
              style: 'h4b',
            },
            {
              text: 'Transport Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...transport,
          [
            {
              text: 4,
              style: 'h4b',
            },
            {
              text: 'Additionals Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...additionals,
        ],
      },
      layout: tLayout,
    };

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Invoice-${invoice.code}`),
      content: [
        await this.getHeader(
          'Invoice',
          invoice.code,
          invoice.siteName,
          invoice.startDate,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/favicon.png',
          `https://app.cloudscaff.com/viewInvoice/${company.id}-${invoice.id}`,
          []
        ),
        hr,
        this.getSubHeader(invoice.customer, company),
        hr,
        { text: invoice.message },
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
                { text: 'Bank:', style: 'h6b', alignment: 'left' },
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
                { text: 'Account Name:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount (${invoice.discountPercentage}%):`,
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
                { text: 'Account Number:', style: 'h6b', alignment: 'left' },
                { text: company.accountNum, alignment: 'left' },
                {
                  text: 'Contract Total',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    invoice.subtotal - invoice.discount
                  )}`,

                  style: 'h6b',
                  alignment: 'right',
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
                  text:
                    company.vat > 0
                      ? `${company.gst ? 'GST' : 'VAT'} (${company.vat}%):`
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

                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                {
                  text: 'Reference',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: invoice.code,
                  alignment: 'left',
                },
                {
                  text: 'Grand Total:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    invoice.total
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                {
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
                  alignment: 'left',
                },
                {
                  text: 'Amount Paid:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    invoice.totalPaid
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                {
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
                  alignment: 'left',
                },
                {
                  text: 'Amount Outstanding:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    invoice.totalOutstanding
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                {
                  text: '',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: '',
                  alignment: 'left',
                },
                {
                  text: 'Amount Due:',
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    invoice.depositTotal
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          text: 'Terms & Conditions',
          style: ['h4b', 'm20'],
          pageBreak: 'before',
        },
        { text: terms ? terms.terms : '' },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // Credit STANDARD PDF
  async generateCredit(credit: Credit, company: Company, terms: Term | null) {
    const additionals = [];
    credit.additionals.forEach((a, i) => {
      additionals.push(
        this.addCreditItem(
          i + 1,
          company,
          a.code,
          a.name,
          a.qty,
          a.unit,
          a.rate,
          a.discount,
          a.total
        )
      );
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', 'auto', 150, 'auto', 'auto', '*', '*', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Code', style: 'h4b', alignment: 'left' },
            { text: 'Description', style: 'h4b', alignment: 'left' },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Unit', style: 'h4b', alignment: 'center' },
            { text: 'Rate', style: 'h4b', alignment: 'right' },
            { text: 'Discount', style: 'h4b', alignment: 'right' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          ...additionals,
        ],
      },
      layout: tLayout,
    };

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Credit-${credit.code}`),
      content: [
        await this.getHeader(
          'Credit Note',
          credit.code,
          credit.siteCode,
          credit.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/favicon.png',
          `https://app.cloudscaff.com/viewCredit/${company.id}-${credit.id}`,
          [
            [
              { text: 'Scaffold:', style: 'h6b' },
              `${credit.scaffoldCode}`,
              '',
              '',
            ],
          ]
        ),
        hr,
        this.getSubHeader(credit.customer, company),
        hr,
        { text: credit.message },
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
                { text: 'Bank:', style: 'h6b', alignment: 'left' },
                { text: company.bankName, alignment: 'left' },
                {
                  text: 'Subtotal:',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `${company.currency.symbol} ${this.format(
                    credit.subtotal
                  )}`,
                  style: 'h6b',
                  alignment: 'right',
                },
              ],
              [
                { text: 'Account Name:', style: 'h6b', alignment: 'left' },
                { text: company.name, alignment: 'left' },
                {
                  text: `Discount (${credit.discountPercentage}%):`,
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text: `- ${company.currency.symbol} ${this.format(
                    credit.discount
                  )}`,
                  alignment: 'right',
                  style: 'h6b',
                },
              ],
              [
                { text: 'Account Number:', style: 'h6b', alignment: 'left' },
                { text: company.accountNum, alignment: 'left' },
                {
                  text:
                    company.vat > 0
                      ? `${company.gst ? 'GST' : 'VAT'} (${company.vat}%):`
                      : company.salesTax > 0
                      ? `Tax (${company.salesTax}%):`
                      : '',
                  style: 'h6b',
                  alignment: 'right',
                },
                {
                  text:
                    company.vat > 0
                      ? `${company.currency.symbol} ${this.format(credit.vat)}`
                      : company.salesTax > 0
                      ? `${company.currency.symbol} ${this.format(credit.tax)}`
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
                    credit.total
                  )}`,
                  style: 'h3',
                  alignment: 'right',
                  margin: [0, 5],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
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

  // Credit STANDARD PDF
  async generateStatement(
    statement: Statement,
    company: Company,
    terms: Term | null
  ) {
    const invoices = [];
    const payments = [];
    const credits = [];
    statement.invoices.forEach((a, i) => {
      invoices.push([
        i + 1,
        {
          text: a.code,
          style: 'h6',
        },
        {
          text: this.toDate(a.date),
          style: 'h6',
          alignment: 'center',
        },
        {
          text: `${company.currency.symbol} ${this.format(a.total)}`,
          style: 'h6',
          alignment: 'right',
        },
        {
          text: `${company.currency.symbol} ${this.format(a.totalOutstanding)}`,
          style: 'h6',
          alignment: 'right',
        },
      ]);
    });
    statement.payments.forEach((a, i) => {
      payments.push([
        i + 1,
        {
          text: a.invoiceCode,
          style: 'h6',
        },
        {
          text: this.toDate(a.date),
          style: 'h6',
          alignment: 'center',
        },
        {
          text: '',
          style: 'h6',
        },
        {
          text: `${company.currency.symbol} ${this.format(a.total)}`,
          style: 'h6',
          alignment: 'right',
        },
      ]);
    });
    statement.credits.forEach((a, i) => {
      credits.push([
        i + 1,
        {
          text: a.code,
          style: 'h6',
        },
        {
          text: this.toDate(a.date),
          style: 'h6',
          alignment: 'center',
        },
        {
          text: '',
          style: 'h6',
        },
        {
          text: `${company.currency.symbol} ${this.format(a.total)}`,
          style: 'h6',
          alignment: 'right',
        },
      ]);
    });

    const invoiceTable = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', '*', '*', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Invoice Code', style: 'h4b', alignment: 'left' },
            { text: 'Invoice Date', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
            { text: 'Balance', style: 'h4b', alignment: 'right' },
          ],
          ...invoices,
        ],
      },
      layout: tLayout,
    };

    const paymentsTable = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', '*', '*', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Invoice Code', style: 'h4b', alignment: 'left' },
            { text: 'Payment Date', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          ...payments,
        ],
      },
      layout: tLayout,
    };
    const creditsTable = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', '*', '*', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            { text: 'Credit Code', style: 'h4b', alignment: 'left' },
            { text: 'Credit Date', style: 'h4b', alignment: 'center' },
            { text: '', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          ...credits,
        ],
      },
      layout: tLayout,
    };

    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(
        `${statement.customer.name}-Statement-${statement.dates.date}`
      ),
      content: [
        {
          style: 'tableExample',

          table: {
            widths: ['*', '*', '*', '*'],

            body: [
              [
                { text: 'Statement', style: 'header', colSpan: 2 },
                '',
                {
                  colSpan: 2,
                  rowSpan: 4,
                  image: await this.getBase64ImageFromURL(
                    company.logoUrl.length > 0
                      ? company.logoUrl
                      : 'assets/icon/favicon.png'
                  ),

                  width: 150,
                  alignment: 'right',
                },
                '',
              ],
              [
                { text: 'Customer:', style: 'h6b' },
                `${statement.customer.name}`,
                '',
                '',
              ],
              [
                { text: 'Start Date:', style: 'h6b' },
                `${this.toDate(statement.dates.startDate)}`,
                '',
                '',
              ],
              [
                { text: 'End Date:', style: 'h6b' },
                `${this.toDate(statement.dates.endDate)}`,
                '',
                '',
              ],

              [
                { text: 'Date Issued:', style: 'h6b' },
                `${this.toDate(statement.dates.date)}`,
                '',
                '',
              ],
              [
                { text: 'View Online:', style: 'h6b' },
                {
                  text: 'Click here to view online',
                  style: ['h6b', { color: 'blue' }],
                  link: `https://app.cloudscaff.com/viewStatement/${company.id}-${statement.customer.id}`,
                },
                '',
                '',
              ],
            ],
          },
          layout: 'noBorders',
        },
        hr,
        this.getSubHeader(statement.customer, company),
        hr,
        invoiceTable,
        paymentsTable,
        creditsTable,
        // {
        //   text: 'Terms & Conditions',
        //   style: ['h4b', 'm20'],
        //   pageBreak: 'before',
        // },
        // { text: terms ? terms.terms : '', style: { fontSize: 6 } },
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // SHIPMENT INVENTORY PDF
  async generateShipment(
    shipment: Shipment,
    company: Company,
    terms: Term | null
  ) {
    const summary = this.createShipmentTable(shipment.items);
    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Shipment-${shipment.code}`),
      content: [
        await this.getHeader(
          'Shipment',
          shipment.code,
          shipment.site.name,
          shipment.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/favicon.png',
          null,
          []
        ),
        // hr,
        // this.getSubHeader(shipment.site.customer, company),
        hr,
        summary,
        await this.addUploads(shipment.uploads),
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // SITE INVENTORY PDF
  async generateInventoryList(
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
            : 'assets/icon/favicon.png',
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

  // RETURN INVENTORY PDF
  async generateReturn(
    returnDoc: Return,
    company: Company,
    terms: Term | null
  ) {
    const summary = this.createShipmentTable(returnDoc.items);
    const data = {
      footer: await this.getFooter(),
      info: this.getMetaData(`${company.name}-Return-${returnDoc.code}`),
      content: [
        await this.getHeader(
          'Return',
          returnDoc.code,
          returnDoc.site.name,
          returnDoc.date,
          company.logoUrl.length > 0
            ? company.logoUrl
            : 'assets/icon/favicon.png',
          null,
          []
        ),
        // hr,
        // this.getSubHeader(shipment.site.customer, company),
        hr,
        summary,
        await this.addUploads(returnDoc.uploads),
      ],
      styles: stylesCS,
      defaultStyle: defaultCS,
    };
    return this.generatePdf(data);
  }

  // UTILITY FUNCTIONS

  async loadPdfMaker() {
    if (!this.pdfMake) {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      this.pdfMake = pdfMakeModule.default;
      this.pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
    }
  }
  async generatePdf(data) {
    await this.loadPdfMaker();

    return this.pdfMake.createPdf(data);
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
              image: await this.getBase64ImageFromURL(url),
              alignment: 'right',
            },
            '',
          ],
          [{ text: 'Code:', style: 'h6b' }, `${code}`, '', ''],
          [{ text: 'Site:', style: 'h6b' }, `${siteName}`, '', ''],
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
  private getSubHeader(customer: Customer, company: Company) {
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
            customer.name,
            { text: 'Representative:', style: 'h6b' },
            'N/A',
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
    const data: any[] = [
      {
        text: 'Uploads',
        style: ['h4b', 'm20'],
        pageBreak: 'before',
      },
    ];
    for (const upload of uploads) {
      if (upload.type.startsWith('image')) {
        const img = {
          image: await this.getBase64ImageFromURL(upload.downloadUrl),
          width: 400,
        };
        data.push(img);
      }
    }
    return data;
  }

  private createEstimateTable(estimate: Estimate, company: Company) {
    const attachments = [];
    estimate.attachments.forEach((a) => {
      attachments.push(
        this.addEstimateItem(
          company,
          `${company.terminology.scaffold} Level ${a.level} - (${a.length}${
            company.measurement.symbol
          } x ${a.width}${company.measurement.symbol} x ${a.height}${
            company.measurement.symbol
          }) ${a.lifts > 0 ? '(' + a.lifts + ' Lifts)' : ''} ${
            a.boardedLifts > 0 ? '(' + a.boardedLifts + ' Boarded lifts)' : ''
          } - ${a.type} ${a.description}`,
          1,
          a.total
        )
      );
      attachments.push(
        this.addEstimateItem(
          company,
          ` - ${company.terminology.hire} ${a.description} - (${
            a.daysStanding
          } ${a.isWeeks ? 'weeks' : 'days'})`,
          a.daysStanding,
          a.hireTotal
        )
      );
    });
    const platforms = [];
    estimate.boards.forEach((b) => {
      platforms.push(
        this.addEstimateItem(
          company,
          `${company.terminology.boards} - (${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol}) - Level (${b.height}${company.measurement.symbol})`,
          b.qty,
          b.total
        )
      );
    });
    const labour = [];
    estimate.labour.forEach((l) => {
      labour.push(
        this.addEstimateItem(
          company,
          `${l.type.name} - ${l.rate.name}`,
          l.qty,
          l.total
        )
      );
    });
    const transport = [];
    estimate.transport.forEach((l) => {
      transport.push(
        this.addEstimateItem(
          company,
          `${l.type.name} - ${l.type.maxLoad}${company.mass.symbol}`,
          l.qty,
          l.total
        )
      );
    });
    const additionals = [];
    estimate.additionals.forEach((a) => {
      additionals.push(this.addEstimateItem(company, a.name, a.qty, a.total));
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', 'auto', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            {
              text: estimate.scaffold.description
                ? estimate.scaffold.description
                : 'Description',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          [
            {
              text: 1,
              style: 'h4b',
            },
            {
              text: `${company.terminology.scaffold} Details`,
              style: 'h4b',
              colSpan: 3,
            },
          ],
          this.addEstimateItem(
            company,
            `${company.terminology.scaffold} Level 0 - (${
              estimate.scaffold.length
            }${company.measurement.symbol} x ${estimate.scaffold.width}${
              company.measurement.symbol
            } x ${estimate.scaffold.height}${company.measurement.symbol}) ${
              estimate.scaffold.lifts > 0
                ? '(' + estimate.scaffold.lifts + ' lifts)'
                : ''
            } ${
              estimate.scaffold.boardedLifts > 0
                ? '(' + estimate.scaffold.boardedLifts + ' Boarded lifts)'
                : ''
            } - ${estimate.scaffold.type} ${estimate.scaffold.description}`,
            1,
            estimate.scaffold.total
          ),
          this.addEstimateItem(
            company,
            ` - ${company.terminology.hire} ${
              estimate.scaffold.description
            } - (${estimate.scaffold.daysStanding} ${
              estimate.scaffold.isWeeks ? 'weeks' : 'days'
            })`,
            estimate.scaffold.daysStanding,
            estimate.scaffold.hireTotal
          ),
          ...attachments,
          ...platforms,
          this.addEstimateItem(
            company,
            `${company.terminology.hire} - (${estimate.hire.daysStanding} ${
              estimate.hire.isWeeks ? 'weeks' : 'days'
            })`,
            estimate.hire.daysStanding,
            estimate.hire.total
          ),
          [
            {
              text: 2,
              style: 'h4b',
            },
            {
              text: 'Labor Details',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...labour,
          [
            {
              text: 3,
              style: 'h4b',
            },
            {
              text: 'Transport Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...transport,
          [
            {
              text: 4,
              style: 'h4b',
            },
            {
              text: 'Additionals Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...additionals,
        ],
      },
      layout: tLayout,
    };

    return summary;
  }
  private createInventoryTable(estimate: InventoryEstimate, company: Company) {
    const items = [];
    estimate.items.forEach((i) => {
      items.push(
        this.addEstimateItem(company, `${i.name}`, i.shipmentQty, i.totalCost)
      );
    });
    const labour = [];
    estimate.labour.forEach((l) => {
      labour.push(
        this.addEstimateItem(
          company,
          `${l.type.name} - ${l.rate.name}`,
          l.qty,
          l.total
        )
      );
    });
    const transport = [];
    estimate.transport.forEach((l) => {
      transport.push(
        this.addEstimateItem(
          company,
          `${l.type.name} - ${l.type.maxLoad}${company.mass.symbol}`,
          l.qty,
          l.total
        )
      );
    });
    const additionals = [];
    estimate.additionals.forEach((a) => {
      additionals.push(this.addEstimateItem(company, a.name, a.qty, a.total));
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', 'auto', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            {
              text: `Description`,
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          [
            {
              text: 1,
              style: 'h4b',
            },
            {
              text: 'Item Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...items,
          [
            {
              text: 2,
              style: 'h4b',
            },
            {
              text: 'Labor Details',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...labour,
          [
            {
              text: 3,
              style: 'h4b',
            },
            {
              text: 'Transport Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...transport,
          [
            {
              text: 4,
              style: 'h4b',
            },
            {
              text: 'Additionals Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...additionals,
        ],
      },
      layout: tLayout,
    };

    return summary;
  }
  private createShipmentTable(shipmentItems: InventoryItem[]) {
    const items = [];
    shipmentItems.forEach((item) => {
      items.push([
        { text: item.code, style: 'h4b', alignment: 'left' },
        {
          text: item.category,
          style: 'h4b',
          alignment: 'left',
        },
        { text: item.size, style: 'h4b', alignment: 'center' },
        { text: item.name, style: 'h4b', alignment: 'left' },
        { text: item.shipmentQty, style: 'h4b', alignment: 'center' },
      ]);
    });
    const summary = {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', 'auto', '*', 'auto'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            {
              text: 'Category',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Size', style: 'h4b', alignment: 'center' },
            { text: 'Name', style: 'h4b', alignment: 'left' },
            { text: 'Shipment Qty', style: 'h4b', alignment: 'center' },
          ],
          ...items,
        ],
      },
      layout: tLayout,
    };

    return summary;
  }

  private addEstimateItem(
    company: Company,
    description: string,
    qty: string | number,
    total: number
  ) {
    return [
      '',
      {
        text: description,
        style: 'h6',
      },
      {
        text: qty,
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
  private addCreditItem(
    index,
    company: Company,
    code: string,
    description: string,
    qty: string | number,
    unit: string | number,
    rate: number,
    discount: number,
    total: number
  ) {
    return [
      index,
      {
        text: code,
        style: 'h6',
      },
      {
        text: description,
        style: 'h6',
      },
      {
        text: qty,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: unit,
        style: 'h6',
        alignment: 'center',
      },
      {
        text: `${company.currency.symbol} ${this.format(rate)}`,
        style: 'h6',
        alignment: 'right',
      },
      {
        text: `${company.currency.symbol} ${this.format(discount)}`,
        style: 'h6',
        alignment: 'right',
      },
      {
        text: `${company.currency.symbol} ${this.format(total)}`,
        style: 'h6',
        alignment: 'right',
      },
    ];
  }
  private addModificationItem(description: string, qty: string | number) {
    return [
      '',
      {
        text: description,
        style: 'h6',
      },
      {
        text: qty,
        style: 'h6',
        alignment: 'center',
      },
    ];
  }

  private addPARow(scaffold: Item, i: number, company: Company) {
    return [
      { text: i, style: 'custom', alignment: 'left' },
      {
        text: scaffold.description,
        style: 'custom',
        alignment: 'left',
      },
      // { text: '', colSpan: 2 },
      // {},
      {
        text: this.currency(scaffold.total, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: this.toDate(scaffold.hireDate),
        style: 'custom',
        alignment: 'center',
      },
      { text: scaffold.handover, style: 'custom', alignment: 'center' },
      {
        text: this.currency(scaffold.erectionValue, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: scaffold.appliedErectionPercentage,
        style: 'custom',
        alignment: 'center',
      },
      {
        text: this.currency(
          scaffold.appliedErectionValue,
          company.currency.symbol
        ),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: scaffold.isWeeks
          ? scaffold.daysStanding
          : Math.round(scaffold.daysStanding / 7),
        style: 'custom',
        alignment: 'center',
      },
      { text: scaffold.hireEndDate, style: 'custom', alignment: 'center' },
      {
        text: this.toDate(scaffold.dismantleDate),
        style: 'custom',
        alignment: 'center',
      },
      {
        text: this.currency(scaffold.dismantleValue, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: scaffold.appliedDismantlePercentage,
        style: 'custom',
        alignment: 'center',
      },
      {
        text: this.currency(
          scaffold.appliedDismantleValue,
          company.currency.symbol
        ),
        style: 'custom',
        alignment: 'right',
      },

      {
        text: scaffold.extraHirePercentage,
        style: 'custom',
        alignment: 'center',
      },
      {
        text: this.currency(scaffold.extraHire, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: scaffold.extraHireWeeks,
        style: 'custom',
        alignment: 'center',
      },
      {
        text: this.currency(scaffold.extraHireCharge, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: this.currency(scaffold.previousGross, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: this.currency(scaffold.grossTotal, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: this.currency(scaffold.currentTotal, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
    ];
  }
  private addPARowAdd(
    data: AdditionalItem | LabourItem | TransportItem | Item,
    i: number,
    company: Company,
    description: string
  ) {
    return [
      { text: i, style: 'custom', alignment: 'left' },
      {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        text: description,
        style: 'custom',
        alignment: 'left',
      },
      {
        text: this.currency(data.total, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: '',
        style: 'custom',
        alignment: 'right',
        colSpan: 15,
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        text: this.currency(data.previousGross || 0, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: this.currency(data.grossTotal || 0, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
      {
        text: this.currency(data.currentTotal || 0, company.currency.symbol),
        style: 'custom',
        alignment: 'right',
      },
    ];
  }
  private addPAScaffold(
    e: Estimate,
    scaffolds: any[],
    counter: number,
    company: Company
  ) {
    counter++;
    const code = [
      {
        text: e.code,
        style: ['h6b', { fillColor: '#fafafa' }],
        colSpan: 21,
      },
    ];
    scaffolds.push(code);
    // const description = [
    //   { text: counter, style: 'custom', alignment: 'left' },
    //   {
    //     text: e.scaffold.description,
    //     style: 'custom',
    //     alignment: 'left',
    //     colSpan: 20,
    //   },
    // ];
    // scaffolds.push(description);
    const row = this.addPARow(e.scaffold, counter, company);
    scaffolds.push(row);
    e.attachments.forEach((att) => {
      counter++;
      // const attDescription = [
      //   { text: counter, style: 'custom', alignment: 'left' },
      //   {
      //     text: att.description,
      //     style: 'custom',
      //     alignment: 'left',
      //     colSpan: 20,
      //   },
      // ];
      // scaffolds.push(attDescription);
      const attrow = this.addPARow(att, counter, company);
      scaffolds.push(attrow);
    });
    e.labour.forEach((data) => {
      counter++;
      const dataRow = this.addPARowAdd(data, counter, company, data.type.name);
      scaffolds.push(dataRow);
    });
    e.transport.forEach((data) => {
      counter++;
      const dataRow = this.addPARowAdd(data, counter, company, data.type.name);
      scaffolds.push(dataRow);
    });
    e.additionals.forEach((data) => {
      counter++;
      const dataRow = this.addPARowAdd(data, counter, company, data.name);
      scaffolds.push(dataRow);
    });
    e.boards.forEach((data) => {
      counter++;
      const dataRow = this.addPARowAdd(
        data,
        counter,
        company,
        `${data.length}x${data.width}`
      );
      scaffolds.push(dataRow);
    });
    return counter;
  }

  private async getFooter() {
    const removeBranding =
      this.store.selectSnapshot(CompanyState.company)?.removeBranding || false;
    const footerCS = [];
    if (!removeBranding) {
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
  private getMetaData(title: string) {
    const info = {
      title,
      creator: 'Cloudscaff Scaffold Management',
    };
    return info;
  }
  private async getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL('image/jpg');

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
  private toDate(date) {
    return new Date(date).toDateString();
  }
  private getAddress(data: any) {
    let address = '';
    address = data.address !== null ? `${data.address}` : '';
    address += data.suburb !== null ? `, ${data.suburb}` : '';
    address += data.city !== null ? `, ${data.city}` : '';
    address += data.zip !== null ? `, ${data.zip}` : '';
    address += data.country !== null ? `, ${data.country}` : '';

    return address;
  }

  private createModificatonSummary(data, company: Company) {
    const attachments = [];
    data.attachments.forEach((a) => {
      attachments.push(
        this.addModificationItem(
          `${company.terminology.scaffold} Level ${a.level} - (${a.length}${
            company.measurement.symbol
          } x ${a.width}${company.measurement.symbol} x ${a.height}${
            company.measurement.symbol
          }) ${a.lifts > 0 ? '(' + a.lifts + 'lifts)' : ''} - ${a.description}`,
          1
        )
      );
    });
    const platforms = [];
    data.boards.forEach((b) => {
      platforms.push(
        this.addModificationItem(
          `${company.terminology.boards} - (${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol}) - Level (${b.height}${company.measurement.symbol})`,
          b.qty
        )
      );
    });
    const labour = [];
    data.labour.forEach((l) => {
      labour.push(
        this.addModificationItem(`${l.type.name} - ${l.rate.name}`, l.qty)
      );
    });
    const transport = [];
    data.transport.forEach((l) => {
      transport.push(
        this.addModificationItem(`${l.type.name} - ${l.type.maxLoad}`, l.qty)
      );
    });
    const additionals = [];
    data.additionals.forEach((a) => {
      additionals.push(this.addModificationItem(a.name, a.qty));
    });
    return {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', 'auto'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            {
              text: data.scaffold.description
                ? data.scaffold.description
                : 'Description',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
          ],
          [
            {
              text: 1,
              style: 'h4b',
            },
            {
              text: `${company.terminology.scaffold} Details`,
              style: 'h4b',
              colSpan: 2,
            },
          ],
          this.addModificationItem(
            `${company.terminology.scaffold} Level 0 - (${
              data.scaffold.length
            }${company.measurement.symbol} x ${data.scaffold.width}${
              company.measurement.symbol
            } x ${data.scaffold.height}${company.measurement.symbol}) ${
              data.scaffold.lifts > 0
                ? '(' + data.scaffold.lifts + 'lifts)'
                : ''
            } - ${data.scaffold.description}`,
            1
          ),
          ...attachments,
          ...platforms,
          this.addModificationItem(
            `${company.terminology.hire} - (${data.hire.daysStanding} ${
              data.hire.isWeeks ? 'weeks' : 'days'
            })`,
            data.hire.daysStanding
          ),
          [
            {
              text: 2,
              style: 'h4b',
            },
            {
              text: 'Labor Details',
              style: 'h4b',
              colSpan: 2,
            },
          ],
          ...labour,
          [
            {
              text: 3,
              style: 'h4b',
            },
            {
              text: 'Transport Detail',
              style: 'h4b',
              colSpan: 2,
            },
          ],
          ...transport,
          [
            {
              text: 4,
              style: 'h4b',
            },
            {
              text: 'Additionals Detail',
              style: 'h4b',
              colSpan: 2,
            },
          ],
          ...additionals,
        ],
      },
      layout: tLayout,
    };
  }
  private createScaffoldSummaryDetailed(data, company: Company) {
    const attachments = [];
    data.attachments.forEach((a) => {
      attachments.push(
        this.addEstimateItem(
          company,
          `${company.terminology.scaffold} Level ${a.level} - (${a.length}${
            company.measurement.symbol
          } x ${a.width}${company.measurement.symbol} x ${a.height}${
            company.measurement.symbol
          }) ${a.lifts > 0 ? '(' + a.lifts + 'lifts)' : ''} - ${a.description}`,
          1,
          a.total
        )
      );
    });
    const platforms = [];
    data.boards.forEach((b) => {
      platforms.push(
        this.addEstimateItem(
          company,
          `${company.terminology.boards} - (${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol}) - Level (${b.height}${company.measurement.symbol})`,
          b.qty,
          b.total
        )
      );
    });
    const labour = [];
    data.labour.forEach((l) => {
      labour.push(
        this.addEstimateItem(
          company,
          `${l.type.name} - ${l.rate.name}`,
          l.qty,
          l.total
        )
      );
    });
    const transport = [];
    data.transport.forEach((l) => {
      transport.push(
        this.addEstimateItem(
          company,
          `${l.type.name} - ${l.type.maxLoad}${company.mass.symbol}`,
          l.qty,
          l.total
        )
      );
    });
    const additionals = [];
    data.additionals.forEach((a) => {
      additionals.push(this.addEstimateItem(company, a.name, a.qty, a.total));
    });
    return {
      table: {
        // headers are automatically repeated if the table spans over multiple pages
        // you can declare how many rows should be treated as headers
        headerRows: 1,
        widths: ['auto', '*', 'auto', '*'],

        body: [
          [
            { text: '#', style: 'h4b', alignment: 'left' },
            {
              text: data.scaffold.description
                ? data.scaffold.description
                : 'Description',
              style: 'h4b',
              alignment: 'left',
            },
            { text: 'Qty', style: 'h4b', alignment: 'center' },
            { text: 'Total', style: 'h4b', alignment: 'right' },
          ],
          [
            {
              text: 1,
              style: 'h4b',
            },
            {
              text: `${company.terminology.scaffold} Details`,
              style: 'h4b',
              colSpan: 3,
            },
          ],
          this.addEstimateItem(
            company,
            `${company.terminology.scaffold} Level 0 - (${
              data.scaffold.length
            }${company.measurement.symbol} x ${data.scaffold.width}${
              company.measurement.symbol
            } x ${data.scaffold.height}${company.measurement.symbol}) ${
              data.scaffold.lifts > 0
                ? '(' + data.scaffold.lifts + 'lifts)'
                : ''
            } - ${data.scaffold.description}`,
            1,
            data.scaffold.total
          ),
          ...attachments,
          ...platforms,
          this.addEstimateItem(
            company,
            `${company.terminology.hire} - (${data.hire.daysStanding} ${
              data.hire.isWeeks ? 'weeks' : 'days'
            })`,
            data.hire.daysStanding,
            data.hire.total
          ),
          [
            {
              text: 2,
              style: 'h4b',
            },
            {
              text: 'Labor Details',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...labour,
          [
            {
              text: 3,
              style: 'h4b',
            },
            {
              text: 'Transport Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...transport,
          [
            {
              text: 4,
              style: 'h4b',
            },
            {
              text: 'Additionals Detail',
              style: 'h4b',
              colSpan: 3,
            },
          ],
          ...additionals,
        ],
      },
      layout: tLayout,
    };
  }
}
