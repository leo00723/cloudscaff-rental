/* eslint-disable max-len */
import { DecimalPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Platform } from '@ionic/angular';
import { stat } from 'fs';
import { Observer, of } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Customer } from 'src/app/models/customer.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Term } from 'src/app/models/term.model';
import { environment } from 'src/environments/environment';
import { Credit } from '../models/credit.model';
import { Inspection } from '../models/inspection.model';
import { Invoice } from '../models/invoice.model';
import { Modification } from '../models/modification.model';
import { Statement } from '../models/statement.mode';
const footerlogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 541.86 66.07"><defs><style>.cls-1{fill:#feb508;}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Logo-Full"><path class="cls-1" d="M67.87,66.07H3.34A3.31,3.31,0,0,1,0,62.77H0a3.31,3.31,0,0,1,3.31-3.31H67.87a3.31,3.31,0,0,0,3.31-3.3V33.79a3.31,3.31,0,0,0-3.31-3.31H24.4a3.3,3.3,0,0,1-3.3-3.3h0a3.31,3.31,0,0,1,3.3-3.31H67.87a9.91,9.91,0,0,1,9.91,9.92V56.16A9.91,9.91,0,0,1,67.87,66.07Z"/><path class="cls-1" d="M53.82,42.2H9.91A9.92,9.92,0,0,1,0,32.28V9.91A9.91,9.91,0,0,1,9.91,0H74.48a3.3,3.3,0,0,1,3.3,3.3h0a3.3,3.3,0,0,1-3.3,3.31H9.91a3.3,3.3,0,0,0-3.3,3.3V32.28a3.31,3.31,0,0,0,3.3,3.31H53.82a3.3,3.3,0,0,1,3.3,3.3h0A3.31,3.31,0,0,1,53.82,42.2Z"/><path class="cls-1" d="M275.51,24.55a2.35,2.35,0,0,1,2.35,2.35V47.42a7,7,0,0,1-7.05,7H244.91a7,7,0,0,1-7-7V26.83a2.36,2.36,0,0,1,2.35-2.35h0a2.35,2.35,0,0,1,2.35,2.35V47.4a2.36,2.36,0,0,0,2.35,2.35h25.91a2.36,2.36,0,0,0,2.35-2.35V26.9a2.35,2.35,0,0,1,2.34-2.35Z"/><path class="cls-1" d="M409.83,52.14a2.35,2.35,0,0,1-2.35,2.35H376.83a7,7,0,0,1-7-7.05V31.54a7,7,0,0,1,7-7h30.72a2.35,2.35,0,0,1,2.35,2.35h0a2.35,2.35,0,0,1-2.35,2.35H376.83a2.33,2.33,0,0,0-2.34,2.33V47.44a2.36,2.36,0,0,0,2.35,2.35h30.64a2.35,2.35,0,0,1,2.35,2.35Z"/><path class="cls-1" d="M281.9,24.34h33a7,7,0,0,1,7,7.05v15.9a7,7,0,0,1-7,7.05H281.83v-4.7H314.9a2.35,2.35,0,0,0,2.34-2.35V31.39A2.35,2.35,0,0,0,314.9,29h-33Z"/><path class="cls-1" d="M462.53,52.16V31.52a2.35,2.35,0,0,1,2.34-2.35h30.65a2.34,2.34,0,0,0,2.34-2.34h0a2.33,2.33,0,0,0-2.34-2.34H464.86a7,7,0,0,0-7,7V52.16a2.33,2.33,0,0,0,2.34,2.33h0A2.33,2.33,0,0,0,462.53,52.16Z"/><path class="cls-1" d="M416.21,54.34A2.35,2.35,0,0,1,413.87,52V31.48a7,7,0,0,1,7.05-7h25.91a7,7,0,0,1,7,7V52.06a2.35,2.35,0,0,1-2.35,2.35h0a2.35,2.35,0,0,1-2.35-2.35V31.5a2.35,2.35,0,0,0-2.35-2.35H420.91a2.35,2.35,0,0,0-2.35,2.35V52a2.35,2.35,0,0,1-2.35,2.35Z"/><rect class="cls-1" x="431.53" y="23.7" width="4.66" height="31.1" transform="translate(394.61 473.12) rotate(-90)"/><path class="cls-1" d="M475.12,23.55h4.7a0,0,0,0,1,0,0v29a2.35,2.35,0,0,1-2.35,2.35h0a2.35,2.35,0,0,1-2.35-2.35v-29A0,0,0,0,1,475.12,23.55Z" transform="translate(438.23 516.71) rotate(-90)"/><path class="cls-1" d="M506.53,52.16V31.52a2.35,2.35,0,0,1,2.34-2.35h30.65a2.34,2.34,0,0,0,2.34-2.34h0a2.33,2.33,0,0,0-2.34-2.34H508.86a7,7,0,0,0-7,7V52.16a2.33,2.33,0,0,0,2.34,2.33h0A2.33,2.33,0,0,0,506.53,52.16Z"/><path class="cls-1" d="M519.12,23.55h4.7a0,0,0,0,1,0,0v29a2.35,2.35,0,0,1-2.35,2.35h0a2.35,2.35,0,0,1-2.35-2.35v-29A0,0,0,0,1,519.12,23.55Z" transform="translate(482.23 560.71) rotate(-90)"/><path class="cls-1" d="M339.61,36.89h19.26a7,7,0,0,1,7,7l0,3.5a7,7,0,0,1-7,7.05H328.18a2.35,2.35,0,0,1-2.35-2.35h0a2.35,2.35,0,0,1,2.35-2.35H358.9a2.35,2.35,0,0,0,2.34-2.35l0-3.5a2.34,2.34,0,0,0-2.33-2.35H339.61Z"/><path class="cls-1" d="M352.12,41.59H332.86a7,7,0,0,1-7-7.05l0-3a7,7,0,0,1,7-7h30.72a2.35,2.35,0,0,1,2.35,2.35h0a2.35,2.35,0,0,1-2.35,2.35H332.83a2.35,2.35,0,0,0-2.34,2.35l0,3a2.34,2.34,0,0,0,2.33,2.35h19.26Z"/><rect class="cls-1" x="281.9" y="29.04" width="4.67" height="20.6"/><path class="cls-1" d="M214,54.49H201a7,7,0,0,1-7-7.05V31.54a7,7,0,0,1,7-7h13v4.7H201a2.34,2.34,0,0,0-2.33,2.35v15.9A2.34,2.34,0,0,0,201,49.79h13Z"/><path class="cls-1" d="M213.86,24.49h13a7,7,0,0,1,7,7.05v15.9a7,7,0,0,1-7,7.05h-13v-4.7h13a2.35,2.35,0,0,0,2.34-2.35V31.54a2.35,2.35,0,0,0-2.34-2.35h-13Z"/><path class="cls-1" d="M154.64,26.82V47.46A2.35,2.35,0,0,0,157,49.8h30.42a2.35,2.35,0,0,1,2.34,2.35h0a2.34,2.34,0,0,1-2.34,2.34H157a7,7,0,0,1-7-7V26.82a2.33,2.33,0,0,1,2.33-2.33h0A2.33,2.33,0,0,1,154.64,26.82Z"/><path class="cls-1" d="M145.86,52.14a2.35,2.35,0,0,1-2.34,2.35H112.86a7,7,0,0,1-7-7.05V31.54a7,7,0,0,1,7-7h30.72a2.35,2.35,0,0,1,2.35,2.35h0a2.35,2.35,0,0,1-2.35,2.35H112.86a2.33,2.33,0,0,0-2.33,2.33V47.44a2.36,2.36,0,0,0,2.35,2.35h30.64a2.35,2.35,0,0,1,2.34,2.35Z"/></g></g></svg>`;
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
  hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 1),
  hLineColor: (i, node) => {
    if (i === 0 || i === node.table.body.length) {
      return 'white';
    } else if (i === 1) {
      return '#5a5a5a';
    } else {
      return '#f2f2F2';
    }
  },
  vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0 : 0),

  vLineColor: (i, node) =>
    i === 0 || i === node.table.widths.length ? 'black' : 'gray',
  // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
  // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
  paddingLeft: (i, node) => 6,
  paddingRight: (i, node) => 6,
  paddingTop: (i, node) => 4,
  paddingBottom: (i, node) => 1,
  fillColor: (i, node) =>
    i === 0 || i === node.table.body.length ? '#eeeeee' : 'white',
};
const tLayout2 = {
  hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 1),
  hLineColor: (i, node) => {
    if (i === 0 || i === node.table.body.length) {
      return 'white';
    } else if (i === 1) {
      return '#5a5a5a';
    } else {
      return '#f2f2F2';
    }
  },
  vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 0 : 0),

  vLineColor: (i, node) =>
    i === 0 || i === node.table.widths.length ? 'black' : 'gray',
  // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
  // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
  paddingLeft: (i, node) => 6,
  paddingRight: (i, node) => 6,
  paddingTop: (i, node) => 4,
  paddingBottom: (i, node) => 1,
  fillColor: (i, node) =>
    i === 0 || i === 1 || i === node.table.body.length ? '#eeeeee' : 'white',
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
  constructor(
    private decimalPipe: DecimalPipe,
    private platformService: Platform,
    private fileOpenerService: FileOpener
  ) {}

  handlePdf(pdf: any, filename: string) {
    if (this.platformService.is('cordova')) {
      pdf.getBase64(async (data) => {
        try {
          let path = `${filename}.pdf`;
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
          `${company.terminology.scaffold} Level ${a.level} - (${a.length}${company.measurement.symbol} x ${a.width}${company.measurement.symbol} x ${a.height}${company.measurement.symbol})`,
          1,
          a.total
        )
      );
    });
    const platforms = [];
    estimate.boards.forEach((b) => {
      platforms.push(
        this.addEstimateItem(
          company,
          `${company.terminology.boards} - (${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol}) - Height (${b.height}${company.measurement.symbol})`,
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
            { text: 'Description', style: 'h4b', alignment: 'left' },
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
            `${company.terminology.scaffold} Level 0 - (${estimate.scaffold.length}${company.measurement.symbol} x ${estimate.scaffold.width}${company.measurement.symbol} x ${estimate.scaffold.height}${company.measurement.symbol})`,
            1,
            estimate.scaffold.total
          ),
          ...attachments,
          ...platforms,
          this.addEstimateItem(
            company,
            `${company.terminology.hire} - (${estimate.hire.daysStanding} days)`,
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
                  text:
                    company.vat > 0
                      ? `VAT (${company.vat}%):`
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

  // ESTIMATE STANDARD PDF
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
                  text:
                    company.vat > 0
                      ? `VAT (${company.vat}%):`
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

  // Credit STANDARD PDF
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
          text: `${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol} - Height ${b.height}${company.measurement.symbol}`,
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
    inspection.questions.categories.forEach((c, i) => {
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
          `${company.terminology.scaffold} Level ${a.level} - (${a.length}${company.measurement.symbol} x ${a.width}${company.measurement.symbol} x ${a.height}${company.measurement.symbol})`,
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
          `${company.terminology.boards} - (${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol}) - Height (${b.height}${company.measurement.symbol})`,
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
            { text: 'Description', style: 'h4b', alignment: 'left' },
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
            `${company.terminology.scaffold} Level 0 - (${invoice.scaffold.length}${company.measurement.symbol} x ${invoice.scaffold.width}${company.measurement.symbol} x ${invoice.scaffold.height}${company.measurement.symbol})`,
            1,
            invoice.scaffold.total
          ),
          ...attachments,
          ...platforms,
          this.addEstimateItem(
            company,
            `${company.terminology.hire} - (${invoice.hire.daysStanding} days)`,
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
                  text:
                    company.vat > 0
                      ? `VAT (${company.vat}%):`
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
                  text: 'Reference',
                  style: 'h6b',
                  alignment: 'left',
                },
                {
                  text: invoice.code,
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
                      ? `VAT (${company.vat}%):`
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
    link: string,
    data: any
  ) {
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
              rowSpan: 4,
              image: await this.getBase64ImageFromURL(url),

              width: 150,
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

          [
            { text: 'View Online:', style: 'h6b' },
            {
              text: 'Click here to view online',
              style: ['h6b', { color: 'blue' }],
              link,
            },
            '',
            '',
          ],
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
        widths: ['*', '*', '*', '*'],
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

  private async getFooter() {
    const footerCS = [];
    footerCS.push([
      {
        svg: footerlogo,
        width: 150,
        alignment: 'right',
        margin: [0, 5, 20, 0],
      },
    ]);
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
          `${company.terminology.scaffold} Level ${a.level} - (${a.length}${company.measurement.symbol} x ${a.width}${company.measurement.symbol} x ${a.height}${company.measurement.symbol})`,
          1
        )
      );
    });
    const platforms = [];
    data.boards.forEach((b) => {
      platforms.push(
        this.addModificationItem(
          `${company.terminology.boards} - (${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol}) - Height (${b.height}${company.measurement.symbol})`,
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
            { text: 'Description', style: 'h4b', alignment: 'left' },
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
            `${company.terminology.scaffold} Level 0 - (${data.scaffold.length}${company.measurement.symbol} x ${data.scaffold.width}${company.measurement.symbol} x ${data.scaffold.height}${company.measurement.symbol})`,
            1
          ),
          ...attachments,
          ...platforms,
          this.addModificationItem(
            `${company.terminology.hire} - (${data.hire.daysStanding} days)`,
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
          `${company.terminology.scaffold} Level ${a.level} - (${a.length}${company.measurement.symbol} x ${a.width}${company.measurement.symbol} x ${a.height}${company.measurement.symbol})`,
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
          `${company.terminology.boards} - (${b.length}${company.measurement.symbol} x ${b.width}${company.measurement.symbol}) - Height (${b.height}${company.measurement.symbol})`,
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
            { text: 'Description', style: 'h4b', alignment: 'left' },
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
            `${company.terminology.scaffold} Level 0 - (${data.scaffold.length}${company.measurement.symbol} x ${data.scaffold.width}${company.measurement.symbol} x ${data.scaffold.height}${company.measurement.symbol})`,
            1,
            data.scaffold.total
          ),
          ...attachments,
          ...platforms,
          this.addEstimateItem(
            company,
            `${company.terminology.hire} - (${data.hire.daysStanding} days)`,
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
