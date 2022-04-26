import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { Inspection } from '../models/inspection.model';
import { SharedInspection } from '../models/sharedInspection.model';
import { Term } from '../models/term.model';
import { EditService } from '../services/edit.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-customer-inspection',
  templateUrl: './customer-inspection.page.html',
})
export class CustomerInspectionPage {
  inspection$: Observable<SharedInspection>;
  ids: string[];
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
    this.inspection$ = this.editService
      .getDocById('sharedInspections', `${this.ids[0]}-${this.ids[1]}`)
      .pipe(
        tap(async (data: SharedInspection) => {
          if (data) {
            if (!data.viewed && !this.sent) {
              this.sent = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.inspection.customer.name} has viewed your inspection.`,
                    message: '',
                    btnText: 'View Inspection',
                    link: `https://app.cloudscaff.com/viewInspection/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.inspection.customer.name} viewed the inspection`,
                  },
                },
              };
              await this.editService.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              await this.editService.updateDoc('sharedInspections', data.id, {
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

  async download(terms: Term | null, inspection: Inspection, company: Company) {
    const pdf = await this.pdf.generateInspection(inspection, company, terms);
    if (!this.pdf.handlePdf(pdf, inspection.code)) {
      this.notificationSvc.toast(
        'Documents can only be downloaded on pc or web',
        'warning',
        3000
      );
    }
  }
}
