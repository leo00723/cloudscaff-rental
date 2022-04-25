import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { Credit } from '../models/credit.model';
import { SharedCredit } from '../models/sharedCredit.model';
import { Term } from '../models/term.model';
import { EditService } from '../services/edit.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-customer-credit',
  templateUrl: './customer-credit.page.html',
})
export class CustomerCreditPage {
  credit$: Observable<SharedCredit>;
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
    this.credit$ = this.editService
      .getDocById('sharedCredits', `${this.ids[0]}-${this.ids[1]}`)
      .pipe(
        tap(async (data: SharedCredit) => {
          if (data) {
            if (!data.viewed && !this.sent) {
              this.sent = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.credit.customer.name} has viewed your credit.`,
                    message: '',
                    btnText: 'View Credit',
                    link: `https://app.cloudscaff.com/viewCredit/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.credit.customer.name} viewed the credit`,
                  },
                },
              };
              await this.editService.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              await this.editService.updateDoc('sharedCredits', data.id, {
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

  async download(terms: Term | null, credit: Credit, company: Company) {
    const pdf = await this.pdf.generateCredit(credit, company, terms);
    if (!this.pdf.handlePdf(pdf, credit.code)) {
      this.notificationSvc.toast(
        'Documents can only be downloaded on pc or web',
        'warning',
        3000
      );
    }
  }
}
