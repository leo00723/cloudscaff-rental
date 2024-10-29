import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Company } from '../models/company.model';
import { Handover } from '../models/handover.model';
import { SharedDismantle } from '../models/sharedDismantle.model';
import { Term } from '../models/term.model';
import { EditService } from '../services/edit.service';
import { ImgService } from '../services/img.service';
import { NotificationService } from '../services/notification.service';
import { PdfService } from '../services/pdf.service';
import { Navigate } from '../shared/router.state';

@Component({
  selector: 'app-customer-dismantle',
  templateUrl: './customer-dismantle.page.html',
})
export class CustomerDismantlePage {
  dismantle$: Observable<SharedDismantle>;
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
    this.dismantle$ = this.editSvc
      .getDocById('sharedDismantles', `${this.ids[0]}-${this.ids[1]}`)
      .pipe(
        tap(async (data: SharedDismantle) => {
          if (data) {
            if (!data.viewed && !this.sent) {
              this.sent = true;
              const emailData = {
                to: data.company.email,
                template: {
                  name: 'share',
                  data: {
                    title: `Hey ${data.company.name}, ${data.dismantle.customer.name} has viewed your dismantle.`,
                    message: '',
                    btnText: 'View Dismantle',
                    link: `https://app.cloudscaff.com/viewDismantle/${this.ids[0]}-${this.ids[1]}`,
                    subject: `${data.dismantle.customer.name} viewed the dismantle`,
                  },
                },
              };
              await this.editSvc.addDocument(
                'mail',
                JSON.parse(JSON.stringify(emailData))
              );
              await this.editSvc.updateDoc('sharedDismantles', data.id, {
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

  async sign(dismantle: Handover, ev: { signature: string; name: string }) {
    this.isLoading = true;
    try {
      const blob = await (await fetch(ev.signature)).blob();
      const res = await this.imgSvc.uploadBlob(
        blob,
        `company/${dismantle.company.id}/dismantles/${dismantle.id}/signature`,
        ''
      );
      if (res) {
        dismantle.signature = res.url2;
        dismantle.signatureRef = res.ref;
        dismantle.status = 'Signed';
        dismantle.signedBy = ev.name;
        this.editSvc.setDoc(
          `company/${dismantle.company.id}/dismantles`,
          dismantle,
          dismantle.id
        );
        await this.editSvc.updateDoc(
          `company/${dismantle.company.id}/scaffolds`,
          dismantle.scaffold.id,
          {
            status: 'Dismantled',
            latestDismantle: { ...dismantle },
          }
        );
        await this.editSvc.updateDoc(
          'sharedDismantles',
          `${dismantle.company.id}-${dismantle.id}`,
          {
            dismantle,
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

  async download(terms: Term | null, dismantle: Handover, company: Company) {
    const pdf = await this.pdf.dismantle(dismantle, company, terms);
    if (!this.pdf.handlePdf(pdf, dismantle.code)) {
      this.notificationSvc.toast(
        'Documents can only be downloaded on pc or web',
        'warning',
        3000
      );
    }
  }
}
