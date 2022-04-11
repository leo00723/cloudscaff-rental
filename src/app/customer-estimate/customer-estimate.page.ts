import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { Estimate } from '../models/estimate.model';
import { SharedEstimate } from '../models/sharedEstimate.model';
import { Term } from '../models/term.model';
import { EditService } from '../services/edit.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-customer-estimate',
  templateUrl: './customer-estimate.page.html',
})
export class CustomerEstimatePage {
  estimate$: Observable<SharedEstimate>;
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
    this.estimate$ = this.editService
      .getDocById('sharedEstimates', `${this.ids[0]}-${this.ids[1]}`)
      .pipe(
        tap(async (data: SharedEstimate) => {
          if (data) {
            if (!data.viewed && !this.sent) {
              this.sent = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.estimate.customer.name} has viewed your estimate.`,
                    message: '',
                    btnText: 'View Estimate',
                    link: `https://app.cloudscaff.com/viewEstimate/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.estimate.customer.name} viewed the estimate`,
                  },
                },
              };
              await this.editService.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              await this.editService.updateDoc('sharedEstimates', data.id, {
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
                title: `Hey ${data.company.name}, great news! ${data.estimate.customer.name} approved the estimate ${data.estimate.code}.`,
                message: '',
                btnText: 'View Estimate',
                link: `https://app.cloudscaff.com/viewEstimate/${this.ids[0]}-${this.ids[1]}`,
                subject: `${data.estimate.customer.name} approved the estimate ${data.estimate.code}.`,
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
                title: `Hey ${data.company.name}, you have approved the estimate ${data.estimate.code} from ${data.estimate.customer.name}.`,
                message: '',
                btnText: 'View Estimate',
                link: `https://app.cloudscff.com/viewEstimate/${this.ids[0]}-${this.ids[1]}`,
                subject: `${data.estimate.customer.name} approved the estimate ${data.estimate.code}.`,
              },
            },
          };
          await this.editService.addDocument(
            'mail',
            JSON.parse(JSON.stringify(customerEmail))
          );
          await this.editService.updateDoc('sharedEstimates', data.id, {
            approved: true,
          });
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
                    title: `Hey ${data.company.name}, ${data.estimate.customer.name} requested an update on estimate ${data.estimate.code} with the following message.`,
                    message: this.message,
                    btnText: 'View Estimate',
                    link: `https://app.cloudscaff.com/viewEstimate/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.estimate.customer.name} requested an update on the estimate ${data.estimate.code}.`,
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
                    title: `Hey ${data.company.name}, ${data.estimate.customer.name} requested a negotiation on estimate ${data.estimate.code} with the following message.`,
                    message: this.message,
                    btnText: 'View Estimate',
                    link: `https://app.cloudscaff.com/viewEstimate/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.estimate.customer.name} requested a negotiation on the estimate ${data.estimate.code}.`,
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
                  title: `Hey ${data.company.name}, ${data.estimate.customer.name} rejected the estimate ${data.estimate.code} with the following message.`,
                  message: this.message,
                  btnText: 'View Estimate',
                  link: `https://app.cloudscaff.com/viewEstimate/${this.ids[0]}-${this.ids[1]}`,
                  subject: `${data.estimate.customer.name} rejected the estimate ${data.estimate.code}.`,
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

  async download(terms: Term | null, estimate: Estimate, company: Company) {
    const pdf = await this.pdf.generateEstimate(estimate, company, terms);
    if (!this.pdf.handlePdf(pdf, estimate.code)) {
      this.notificationSvc.toast(
        'Documents can only be downloaded on pc or web',
        'warning',
        3000
      );
    }
  }
}
