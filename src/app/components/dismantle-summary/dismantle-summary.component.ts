import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Handover } from 'src/app/models/handover.model';
import { Term } from 'src/app/models/term.model';
import { ImgService } from 'src/app/services/img.service';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

@Component({
  selector: 'app-dismantle-summary',
  templateUrl: './dismantle-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      ion-img::part(image) {
        width: 300px !important;
        height: 200px !important;
      }
    `,
  ],
})
export class DismantleSummaryComponent {
  @Input() dismantle: Handover;
  isLoading = false;
  terms$: Observable<Term>;
  company: Company;
  constructor(
    private masterSvc: MasterService,
    private imgService: ImgService,
    private change: ChangeDetectorRef
  ) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.terms$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/terms`, 'Dismantle');
  }
  close() {
    this.masterSvc.modal().dismiss(null, 'close', 'viewDismantle');
  }

  async sign(ev: { signature: string; name: string }) {
    this.isLoading = true;
    try {
      const blob = await (await fetch(ev.signature)).blob();
      const res = await this.imgService.uploadBlob(
        blob,
        `company/${this.dismantle.company.id}/dismantles/${this.dismantle.id}/signature`,
        ''
      );
      if (res) {
        this.dismantle.signature = res.url;
        this.dismantle.signatureRef = res.ref;
        this.dismantle.status = 'Signed';
        this.dismantle.signedBy = ev.name;
        this.masterSvc
          .edit()
          .setDoc(
            `company/${this.dismantle.company.id}/dismantles`,
            this.dismantle,
            this.dismantle.id
          );
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.dismantle.company.id}/scaffolds`,
            this.dismantle.scaffold.id,
            {
              status: 'Dismantled',
              latestDismantle: { ...this.dismantle },
            }
          );
        this.masterSvc
          .notification()
          .toast('Document signed successfully!', 'success');
        this.isLoading = false;
        this.change.detectChanges();
      } else {
        throw Error;
      }
    } catch (e) {
      console.error(e);
      this.masterSvc
        .notification()
        .toast(
          'Something went wrong signing your document. Please try again!',
          'danger'
        );
      this.isLoading = false;
    }
  }

  async download(terms: Term | null) {
    const sharedDismantle = {
      dismantle: this.dismantle,
      company: this.company,
      terms,
    };
    await this.masterSvc
      .edit()
      .setDoc(
        'sharedDismantles',
        { ...sharedDismantle, cc: [], email: [this.dismantle.company.email] },
        `${this.company.id}-${this.dismantle.id}`
      );
    const pdf = await this.masterSvc
      .pdf()
      .dismantle(this.dismantle, this.company, terms);
    this.masterSvc.pdf().handlePdf(pdf, this.dismantle.code);
  }

  async share(terms: Term | null) {
    const sharedDismantle = {
      dismantle: this.dismantle,
      company: this.company,
      terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: { type: 'dismantle', doc: sharedDismantle },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
