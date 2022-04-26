import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { Handover } from '../models/handover.model';
import { SharedHandover } from '../models/sharedHandover.model';
import { Term } from '../models/term.model';
import { EditService } from '../services/edit.service';
import { ImgService } from '../services/img.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-customer-handover',
  templateUrl: './customer-handover.page.html',
})
export class CustomerHandoverPage {
  handover$: Observable<SharedHandover>;
  ids: string[];
  sent = false;
  isLoading = false;
  constructor(
    private editSvc: EditService,
    private imgSvc: ImgService,
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
    this.handover$ = this.editSvc
      .getDocById('sharedHandovers', `${this.ids[0]}-${this.ids[1]}`)
      .pipe(
        tap(async (data: SharedHandover) => {
          if (data) {
            if (!data.viewed && !this.sent) {
              this.sent = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.handover.customer.name} has viewed your handover.`,
                    message: '',
                    btnText: 'View Handover',
                    link: `https://app.cloudscaff.com/viewHandover/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.handover.customer.name} viewed the handover`,
                  },
                },
              };
              await this.editSvc.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              await this.editSvc.updateDoc('sharedHandovers', data.id, {
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

  async sign(handover: Handover, ev) {
    this.isLoading = true;
    try {
      const blob = await (await fetch(ev)).blob();
      const res = await this.imgSvc.uploadBlob(
        blob,
        `company/${handover.company.id}/handovers/${handover.id}/signature`,
        ''
      );
      if (res) {
        handover.signature = res.url2;
        handover.signatureRef = res.ref;
        handover.status = 'active-Signed';
        this.editSvc.setDoc(
          `company/${handover.company.id}/handovers`,
          handover,
          handover.id
        );
        await this.editSvc.updateDoc(
          `company/${handover.company.id}/scaffolds`,
          handover.scaffold.id,
          {
            status: 'active-Handed over',
          }
        );
        await this.editSvc.updateDoc(
          'sharedHandovers',
          `${handover.company.id}-${handover.id}`,
          {
            handover,
          }
        );
        this.notificationSvc.toast('Document signed successfully!', 'success');
        this.isLoading = false;
      } else {
        throw Error;
      }
    } catch (e) {
      console.error(e);
      this.notificationSvc.toast(
        'Something went wrong signing your document. Please try again!',
        'danger'
      );
      this.isLoading = false;
    }
  }

  async download(terms: Term | null, handover: Handover, company: Company) {
    const pdf = await this.pdf.generateHandover(handover, company, terms);
    if (!this.pdf.handlePdf(pdf, handover.code)) {
      this.notificationSvc.toast(
        'Documents can only be downloaded on pc or web',
        'warning',
        3000
      );
    }
  }
}
