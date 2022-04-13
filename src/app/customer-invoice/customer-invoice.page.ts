import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { Invoice } from '../models/invoice.model';
import { SharedInvoice } from '../models/sharedInvoice.model';
import { Term } from '../models/term.model';
import { EditService } from '../services/edit.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-customer-invoice',
  templateUrl: './customer-invoice.page.html',
})
export class CustomerInvoicePage {
  invoice$: Observable<SharedInvoice>;
  ids: string[];
  loading = false;
  message = '';
  requestUpdate = false;
  sent = false;
  constructor(
    private editService: EditService,
    private activatedRoute: ActivatedRoute,
    private pdf: PdfService,
    private notificationSvc: NotificationService,
    private store: Store
  ) {
    this.ids = this.activatedRoute.snapshot.paramMap.get('id').split('-');
    if (this.ids.length !== 2) {
      this.notificationSvc.toast('Document not found!', 'warning', 3000);
      this.store.dispatch(new Navigate('/login'));
    }
    this.invoice$ = this.editService
      .getDocById('sharedInvoices', `${this.ids[0]}-${this.ids[1]}`)
      .pipe(
        tap(async (data: SharedInvoice) => {
          if (data) {
            if (!data.viewed && !this.sent) {
              this.sent = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.invoice.customer.name} has viewed your invoice.`,
                    message: '',
                    btnText: 'View Invoice',
                    link: `https://app.cloudscaff.com/viewInvoice/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.invoice.customer.name} viewed the invoice`,
                  },
                },
              };
              await this.editService.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              await this.editService.updateDoc('sharedInvoices', data.id, {
                viewed: true,
              });
            }
          } else {
            this.notificationSvc.toast('Document not found!', 'warning', 3000);
            this.store.dispatch(new Navigate('/login'));
          }
        })
      );
  }

  // async update(type: 'approve' | 'reject' | 'update' | 'negotiate', data) {
  //   switch (type) {
  //     case 'approve':
  //       {
  //         this.loading = true;
  //         const emailData = {
  //           to: data.company.email,
  //           template: {
  //             name: 'share',
  //             data: {
  //               title: `Hey ${data.company.name}, great news! ${data.invoice.customer.name} approved the invoice ${data.invoice.code}.`,
  //               message: '',
  //               btnText: 'View Invoice',
  //               link: `https://app.cloudscaff.com/viewInvoice/${this.ids[0]}-${this.ids[1]}`,
  //               subject: `${data.invoice.customer.name} approved the invoice ${data.invoice.code}.`,
  //             },
  //           },
  //         };
  //         await this.editService.addDocument(
  //           'mail',
  //           JSON.parse(JSON.stringify(emailData))
  //         );
  //         const customerEmail = {
  //           to: data.email,
  //           cc: data.cc,
  //           template: {
  //             name: 'share',
  //             data: {
  //               title: `Hey ${data.company.name}, you have approved the invoice ${data.invoice.code} from ${data.invoice.customer.name}.`,
  //               message: '',
  //               btnText: 'View Invoice',
  //               link: `https://app.cloudscff.com/viewInvoice/${this.ids[0]}-${this.ids[1]}`,
  //               subject: `${data.invoice.customer.name} approved the invoice ${data.invoice.code}.`,
  //             },
  //           },
  //         };
  //         await this.editService.addDocument(
  //           'mail',
  //           JSON.parse(JSON.stringify(customerEmail))
  //         );
  //         await this.editService.updateDoc('sharedInvoices', data.id, {
  //           approved: true,
  //         });
  //         this.notificationSvc.toast(
  //           'Invoice approved successfully',
  //           'success'
  //         );
  //         this.loading = false;
  //       }
  //       break;
  //     case 'update':
  //       {
  //         if (this.requestUpdate) {
  //           if (this.message.length > 0) {
  //             this.loading = true;
  //             const emailData = {
  //               to: data.company.email,
  //               template: {
  //                 name: 'share',
  //                 data: {
  //                   title: `Hey ${data.company.name}, ${data.invoice.customer.name} requested an update on invoice ${data.invoice.code} with the following message.`,
  //                   message: this.message,
  //                   btnText: 'View Invoice',
  //                   link: `https://app.cloudscaff.com/viewInvoice/${this.ids[0]}-${this.ids[1]}`,
  //                   subject: `${data.invoice.customer.name} requested an update on the invoice ${data.invoice.code}.`,
  //                 },
  //               },
  //             };
  //             await this.editService.addDocument(
  //               'mail',
  //               JSON.parse(JSON.stringify(emailData))
  //             );
  //             this.notificationSvc.toast(
  //               'Request sent successfully',
  //               'success'
  //             );
  //             this.requestUpdate = false;
  //             this.message = '';
  //             this.loading = false;
  //           } else {
  //             this.notificationSvc.toast(
  //               'Please enter a message',
  //               'warning',
  //               3000
  //             );
  //           }
  //         } else {
  //           this.requestUpdate = true;
  //         }
  //       }
  //       break;
  //     case 'negotiate':
  //       {
  //         if (this.requestUpdate) {
  //           if (this.message.length > 0) {
  //             this.loading = true;
  //             const emailData = {
  //               to: data.company.email,
  //               template: {
  //                 name: 'share',
  //                 data: {
  //                   title: `Hey ${data.company.name}, ${data.invoice.customer.name} requested a negotiation on invoice ${data.invoice.code} with the following message.`,
  //                   message: this.message,
  //                   btnText: 'View Invoice',
  //                   link: `https://app.cloudscaff.com/viewInvoice/${this.ids[0]}-${this.ids[1]}`,
  //                   subject: `${data.invoice.customer.name} requested a negotiation on the invoice ${data.invoice.code}.`,
  //                 },
  //               },
  //             };
  //             await this.editService.addDocument(
  //               'mail',
  //               JSON.parse(JSON.stringify(emailData))
  //             );
  //             this.notificationSvc.toast(
  //               'Request sent successfully',
  //               'success'
  //             );
  //             this.requestUpdate = false;
  //             this.message = '';
  //             this.loading = false;
  //           } else {
  //             this.notificationSvc.toast(
  //               'Please enter a message',
  //               'warning',
  //               3000
  //             );
  //           }
  //         } else {
  //           this.requestUpdate = true;
  //         }
  //       }
  //       break;
  //     case 'reject': {
  //       if (this.requestUpdate) {
  //         if (this.message.length > 0) {
  //           this.loading = true;
  //           const emailData = {
  //             to: data.company.email,
  //             template: {
  //               name: 'share',
  //               data: {
  //                 title: `Hey ${data.company.name}, ${data.invoice.customer.name} rejected the invoice ${data.invoice.code} with the following message.`,
  //                 message: this.message,
  //                 btnText: 'View Invoice',
  //                 link: `https://app.cloudscaff.com/viewInvoice/${this.ids[0]}-${this.ids[1]}`,
  //                 subject: `${data.invoice.customer.name} rejected the invoice ${data.invoice.code}.`,
  //               },
  //             },
  //           };
  //           await this.editService.addDocument(
  //             'mail',
  //             JSON.parse(JSON.stringify(emailData))
  //           );
  //           this.notificationSvc.toast('Request sent successfully', 'success');
  //           this.requestUpdate = false;
  //           this.message = '';
  //           this.loading = false;
  //         } else {
  //           this.notificationSvc.toast(
  //             'Please enter a message',
  //             'warning',
  //             3000
  //           );
  //         }
  //       } else {
  //         this.requestUpdate = true;
  //       }
  //     }
  //   }
  // }

  async download(terms: Term | null, invoice: Invoice, company: Company) {
    // const pdf = await this.pdf.generateInvoice(invoice, company, terms);
    // if (!this.pdf.handlePdf(pdf, invoice.code)) {
    //   this.notificationSvc.toast(
    //     'Documents can only be downloaded on pc or web',
    //     'warning',
    //     3000
    //   );
    // }
  }
}
