import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

@Component({
  selector: 'app-estimate-summary',
  templateUrl: './estimate-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimateSummaryComponent {
  @Input() estimate: Estimate;
  @Input() canDownload = false;
  terms$: Observable<Term>;
  company: Company;
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.terms$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/terms`, 'Estimate');
  }
  async download(terms: Term | null) {
    const sharedEstimate = {
      quotation: this.estimate,
      company: this.company,
      terms: terms,
    };
    await this.masterSvc
      .edit()
      .setDoc(
        'sharedEstimates',
        { ...sharedEstimate, cc: [], email: [this.estimate.company.email] },
        `${this.company.id}-${this.estimate.id}`
      );
    const pdf = await this.masterSvc
      .pdf()
      .generateEstimate(this.estimate, this.company, terms);
    this.masterSvc.handlePdf(pdf, this.estimate.code);
  }
  async share(terms: Term | null) {
    const sharedEstimate = {
      estimate: this.estimate,
      company: this.company,
      terms: terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: { type: 'estimate', doc: sharedEstimate },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
