import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Handover } from 'src/app/models/handover.model';
import { Term } from 'src/app/models/term.model';
import { EditService } from 'src/app/services/edit.service';
import { ImgService } from 'src/app/services/img.service';
import { MasterService } from 'src/app/services/master.service';
import { NotificationService } from 'src/app/services/notification.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

@Component({
  selector: 'app-handover-summary',
  templateUrl: './handover-summary.component.html',
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
export class HandoverSummaryComponent {
  @Input() handover: Handover;
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
      .getDocById(`company/${this.company.id}/terms`, 'Handover');
  }
  close() {
    this.masterSvc.modal().dismiss(null, 'close', 'viewHandover');
  }

  async sign(ev: { signature: string; name: string }) {
    this.isLoading = true;
    try {
      const blob = await (await fetch(ev.signature)).blob();
      const res = await this.imgService.uploadBlob(
        blob,
        `company/${this.handover.company.id}/handovers/${this.handover.id}/signature`,
        ''
      );
      if (res) {
        this.handover.signature = res.url2;
        this.handover.signatureRef = res.ref;
        this.handover.status = 'active-Signed';
        this.handover.signedBy = ev.name;
        this.masterSvc
          .edit()
          .setDoc(
            `company/${this.handover.company.id}/handovers`,
            this.handover,
            this.handover.id
          );
        await this.masterSvc
          .edit()
          .updateDoc(
            `company/${this.handover.company.id}/scaffolds`,
            this.handover.scaffold.id,
            {
              status: 'active-Handed over',
              latestHandover: { ...this.handover },
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
    const sharedHandover = {
      handover: this.handover,
      company: this.company,
      terms,
    };
    await this.masterSvc
      .edit()
      .setDoc(
        'sharedHandovers',
        { ...sharedHandover, cc: [], email: [this.handover.company.email] },
        `${this.company.id}-${this.handover.id}`
      );
    const pdf = await this.masterSvc
      .pdf()
      .generateHandover(this.handover, this.company, terms);
    this.masterSvc.pdf().handlePdf(pdf, this.handover.code);
  }

  async share(terms: Term | null) {
    const sharedHandover = {
      handover: this.handover,
      company: this.company,
      terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: { type: 'handover', doc: sharedHandover },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
