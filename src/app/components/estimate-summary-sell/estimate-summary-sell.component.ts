import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryEstimateSell } from 'src/app/models/inventory-estimate-sell.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';
@Component({
  selector: 'app-estimate-summary-sell',
  templateUrl: './estimate-summary-sell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimateSummarySellComponent {
  @Input() set value(val: InventoryEstimateSell) {
    if (val) {
      this.estimate = val;
    }
  }
  @Input() canDownload = false;
  @Input() showUploads = false;
  estimate: InventoryEstimateSell;
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
      estimate: this.estimate,
      company: this.company,
      terms,
    };
    // await this.masterSvc
    //   .edit()
    //   .updateDoc(
    //     'sharedEstimatesV2',
    //     `${this.company.id}-${this.estimate.id}`,
    //     {
    //       ...sharedEstimate,
    //       cc: [],
    //       email: [this.estimate.company.email],
    //     }
    //   );
    // const pdf = await this.masterSvc
    //   .pdf()
    //   .generateEstimate(this.estimate, this.company, terms);
    // this.masterSvc.pdf().handlePdf(pdf, this.estimate.code);
  }
  async share(terms: Term | null) {
    const sharedEstimate = {
      estimate: this.estimate,
      company: this.company,
      terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: {
          type: 'estimate',
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
