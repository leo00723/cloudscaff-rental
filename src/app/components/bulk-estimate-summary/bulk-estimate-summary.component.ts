import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

@Component({
  selector: 'app-bulk-estimate-summary',
  templateUrl: './bulk-estimate-summary.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkEstimateSummaryComponent {
  @Input() bulkEstimate: BulkEstimate;
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
      bulkEstimate: this.bulkEstimate,
      company: this.company,
      terms: terms,
    };
    await this.masterSvc.edit().setDoc(
      'sharedBulkEstimates',
      {
        ...sharedEstimate,
        cc: [],
        email: [this.bulkEstimate.company.email],
      },
      `${this.company.id}-${this.bulkEstimate.id}`
    );
    // const pdf = await this.masterSvc
    //   .pdf()
    //   .generateEstimate(this.bulkEstimatestimate, this.company, terms);
    // this.masterSvc.pdf().handlePdf(pdf, this.bulkEstimatestimate.code);
  }
  async share(terms: Term | null) {
    const sharedEstimate = {
      bulkEstimate: this.bulkEstimate,
      company: this.company,
      terms: terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: { type: 'bulkEstimate', doc: sharedEstimate },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
