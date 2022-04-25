import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { Modification } from '../models/modification.model';
import { SharedModification } from '../models/sharedModification.model';
import { Term } from '../models/term.model';
import { EditService } from '../services/edit.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-customer-modification',
  templateUrl: './customer-modification.page.html',
})
export class CustomerModificationPage {
  modification$: Observable<SharedModification>;
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
    this.modification$ = this.editService
      .getDocById('sharedModifications', `${this.ids[0]}-${this.ids[1]}`)
      .pipe(
        tap(async (data: SharedModification) => {
          if (data) {
            if (!data.viewed && !this.sent) {
              this.sent = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.modification.customer.name} has viewed your modification.`,
                    message: '',
                    btnText: 'View Modification',
                    link: `https://app.cloudscaff.com/viewModification/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.modification.customer.name} viewed the modification`,
                  },
                },
              };
              await this.editService.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              await this.editService.updateDoc('sharedModifications', data.id, {
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
                title: `Hey ${data.company.name}, great news! ${data.modification.customer.name} approved the modification ${data.modification.code}.`,
                message: '',
                btnText: 'View Modification',
                link: `https://app.cloudscaff.com/viewModification/${this.ids[0]}-${this.ids[1]}`,
                subject: `${data.modification.customer.name} approved the modification ${data.modification.code}.`,
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
                title: `Hey ${data.company.name}, you have approved the modification ${data.modification.code} from ${data.modification.customer.name}.`,
                message: '',
                btnText: 'View Modification',
                link: `https://app.cloudscff.com/viewModification/${this.ids[0]}-${this.ids[1]}`,
                subject: `${data.modification.customer.name} approved the modification ${data.modification.code}.`,
              },
            },
          };
          await this.editService.addDocument(
            'mail',
            JSON.parse(JSON.stringify(customerEmail))
          );
          await this.editService.updateDoc('sharedModifications', data.id, {
            approved: true,
          });
          this.notificationSvc.toast(
            'Modification approved successfully',
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
                    title: `Hey ${data.company.name}, ${data.modification.customer.name} requested an update on modification ${data.modification.code} with the following message.`,
                    message: this.message,
                    btnText: 'View Modification',
                    link: `https://app.cloudscaff.com/viewModification/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.modification.customer.name} requested an update on the modification ${data.modification.code}.`,
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
                    title: `Hey ${data.company.name}, ${data.modification.customer.name} requested a negotiation on modification ${data.modification.code} with the following message.`,
                    message: this.message,
                    btnText: 'View Modification',
                    link: `https://app.cloudscaff.com/viewModification/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.modification.customer.name} requested a negotiation on the modification ${data.modification.code}.`,
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
                  title: `Hey ${data.company.name}, ${data.modification.customer.name} rejected the modification ${data.modification.code} with the following message.`,
                  message: this.message,
                  btnText: 'View Modification',
                  link: `https://app.cloudscaff.com/viewModification/${this.ids[0]}-${this.ids[1]}`,
                  subject: `${data.modification.customer.name} rejected the modification ${data.modification.code}.`,
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
    modification: Modification,
    company: Company
  ) {
    const pdf = await this.pdf.generateModification(
      modification,
      company,
      terms
    );
    if (!this.pdf.handlePdf(pdf, modification.code)) {
      this.notificationSvc.toast(
        'Documents can only be downloaded on pc or web',
        'warning',
        3000
      );
    }
  }
}
