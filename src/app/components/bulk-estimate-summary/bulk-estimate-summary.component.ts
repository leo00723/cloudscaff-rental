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
  @Input() enquiryId: string = '';
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
    await this.masterSvc
      .edit()
      .updateDoc(
        'sharedBulkEstimates',
        `${this.company.id}-${this.bulkEstimate.id}`,
        {
          ...sharedEstimate,
          cc: [],
          email: [this.bulkEstimate.company.email],
        }
      );
    const pdf = await this.masterSvc
      .pdf()
      .generateBulkEstimate(this.bulkEstimate, this.company, terms);
    this.masterSvc.pdf().handlePdf(pdf, this.bulkEstimate.code);
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
        data: {
          type: 'bulkEstimate',
          doc: sharedEstimate,
        },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
