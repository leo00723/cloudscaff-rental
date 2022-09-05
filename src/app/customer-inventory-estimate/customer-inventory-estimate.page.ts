import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { ViewTermsComponent } from '../components/view-terms/view-terms.component';
import { BulkInventoryEstimate } from '../models/bulkInventoryEstimate.model';
import { Company } from '../models/company.model';
import { SharedInventoryEstimate } from '../models/sharedInventoryEstimate.model';
import { Term } from '../models/term.model';
import { EditService } from '../services/edit.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-customer-inventory-estimate',
  templateUrl: './customer-inventory-estimate.page.html',
})
export class CustomerInventoryEstimatePage {
  inventoryEstimate$: Observable<SharedInventoryEstimate>;
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
    private store: Store,
    private modalSvc: ModalController
  ) {
    this.ids = this.activatedRoute.snapshot.paramMap.get('id').split('-');
    if (this.ids.length !== 2) {
      this.notificationSvc.toast('Document not found!', 'warning', 3000);
      this.store.dispatch(new Navigate('/login'));
    }
    this.inventoryEstimate$ = this.editService
      .getDocById('sharedInventoryEstimates', `${this.ids[0]}-${this.ids[1]}`)
      .pipe(
        tap(async (data: SharedInventoryEstimate) => {
          if (data) {
            if (!data.viewed && !this.sent) {
              this.sent = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.inventoryEstimate.customer.name} has viewed your estimate.`,
                    message: '',
                    btnText: 'View Estimate',
                    link: `https://app.cloudscaff.com/viewInventoryEstimate/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.inventoryEstimate.customer.name} viewed the estimate`,
                  },
                },
              };
              await this.editService.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              await this.editService.updateDoc(
                'sharedInventoryEstimates',
                data.id,
                {
                  viewed: true,
                }
              );
            }
          } else {
            this.notificationSvc.toast('Document not found!', 'warning', 3000);
            this.store.dispatch(new Navigate('/login'));
          }
        })
      );
  }

  async update(type: 'approve' | 'reject' | 'update' | 'negotiate', data) {
    switch (type) {
      case 'approve':
        {
          this.loading = true;
          const emailData = {
            to: data.company.email,
            template: {
              name: 'share',
              data: {
                title: `Hey ${data.company.name}, great news! ${data.inventoryEstimate.customer.name} approved the estimate ${data.inventoryEstimate.code}.`,
                message: '',
                btnText: 'View Estimate',
                link: `https://app.cloudscaff.com/viewInventoryEstimate/${this.ids[0]}-${this.ids[1]}`,
                subject: `${data.inventoryEstimate.customer.name} approved the estimate ${data.inventoryEstimate.code}.`,
              },
            },
          };
          await this.editService.addDocument(
            'mail',
            JSON.parse(JSON.stringify(emailData))
          );
          const customerEmail = {
            to: data.email,
            cc: data.cc,
            template: {
              name: 'share',
              data: {
                title: `Hey ${data.company.name}, you have approved the estimate ${data.inventoryEstimate.code} from ${data.inventoryEstimate.customer.name}.`,
                message: '',
                btnText: 'View Estimate',
                link: `https://app.cloudscff.com/viewInventoryEstimate/${this.ids[0]}-${this.ids[1]}`,
                subject: `${data.inventoryEstimate.customer.name} approved the estimate ${data.inventoryEstimate.code}.`,
              },
            },
          };
          await this.editService.addDocument(
            'mail',
            JSON.parse(JSON.stringify(customerEmail))
          );
          await this.editService.updateDoc(
            'sharedInventoryEstimates',
            data.id,
            {
              ...data,
              approved: true,
            }
          );
          this.notificationSvc.toast(
            'Estimate approved successfully',
            'success'
          );
          this.loading = false;
        }
        break;
      case 'update':
        {
          if (this.requestUpdate) {
            if (this.message.length > 0) {
              this.loading = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.inventoryEstimate.customer.name} requested an update on estimate ${data.inventoryEstimate.code} with the following message.`,
                    message: this.message,
                    btnText: 'View Estimate',
                    link: `https://app.cloudscaff.com/viewInventoryEstimate/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.inventoryEstimate.customer.name} requested an update on the estimate ${data.inventoryEstimate.code}.`,
                  },
                },
              };
              await this.editService.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              this.notificationSvc.toast(
                'Request sent successfully',
                'success'
              );
              this.requestUpdate = false;
              this.message = '';
              this.loading = false;
            } else {
              this.notificationSvc.toast(
                'Please enter a message',
                'warning',
                3000
              );
            }
          } else {
            this.requestUpdate = true;
          }
        }
        break;
      case 'negotiate':
        {
          if (this.requestUpdate) {
            if (this.message.length > 0) {
              this.loading = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.inventoryEstimate.customer.name} requested a negotiation on estimate ${data.inventoryEstimate.code} with the following message.`,
                    message: this.message,
                    btnText: 'View Estimate',
                    link: `https://app.cloudscaff.com/viewInventoryEstimate/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.inventoryEstimate.customer.name} requested a negotiation on the estimate ${data.inventoryEstimate.code}.`,
                  },
                },
              };
              await this.editService.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              this.notificationSvc.toast(
                'Request sent successfully',
                'success'
              );
              this.requestUpdate = false;
              this.message = '';
              this.loading = false;
            } else {
              this.notificationSvc.toast(
                'Please enter a message',
                'warning',
                3000
              );
            }
          } else {
            this.requestUpdate = true;
          }
        }
        break;
      case 'reject': {
        if (this.requestUpdate) {
          if (this.message.length > 0) {
            this.loading = true;
            const emailData = {
              to: data.company.email,
              template: {
                name: 'share',
                data: {
                  title: `Hey ${data.company.name}, ${data.inventoryEstimate.customer.name} rejected the estimate ${data.inventoryEstimate.code} with the following message.`,
                  message: this.message,
                  btnText: 'View Estimate',
                  link: `https://app.cloudscaff.com/viewInventoryEstimate/${this.ids[0]}-${this.ids[1]}`,
                  subject: `${data.inventoryEstimate.customer.name} rejected the estimate ${data.inventoryEstimate.code}.`,
                },
              },
            };
            await this.editService.addDocument(
              'mail',
              JSON.parse(JSON.stringify(emailData))
            );
            this.notificationSvc.toast('Request sent successfully', 'success');
            this.requestUpdate = false;
            this.message = '';
            this.loading = false;
          } else {
            this.notificationSvc.toast(
              'Please enter a message',
              'warning',
              3000
            );
          }
        } else {
          this.requestUpdate = true;
        }
      }
    }
  }

  async download(
    terms: Term | null,
    estimate: BulkInventoryEstimate,
    company: Company
  ) {
    const pdf = await this.pdf.generateInventoryEstimate(
      estimate,
      company,
      terms
    );
    if (!this.pdf.handlePdf(pdf, estimate.code)) {
      this.notificationSvc.toast(
        'Documents can only be downloaded on pc or web',
        'warning',
        3000
      );
    }
  }

  async openTerms(terms: string) {
    const modal = await this.modalSvc.create({
      component: ViewTermsComponent,
      cssClass: 'accept',
      componentProps: {
        terms: terms,
      },
      showBackdrop: true,
      id: 'viewTerms',
    });
    return await modal.present();
  }
}
