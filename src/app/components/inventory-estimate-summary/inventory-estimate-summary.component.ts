import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { BulkInventoryEstimate } from 'src/app/models/bulkInventoryEstimate.model';
import { Company } from 'src/app/models/company.model';
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

@Component({
  selector: 'app-inventory-estimate-summary',
  templateUrl: './inventory-estimate-summary.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryEstimateSummaryComponent {
  @Input() enquiryId: string = '';
  @Input() inventoryEstimate: BulkInventoryEstimate;
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
      inventoryEstimate: this.inventoryEstimate,
      company: this.company,
      terms: terms,
    };
    await this.masterSvc
      .edit()
      .updateDoc(
        'sharedInventoryEstimates',
        `${this.company.id}-${this.inventoryEstimate.id}`,
        {
          ...sharedEstimate,
          cc: [],
          email: [this.inventoryEstimate.company.email],
        }
      );
    const pdf = await this.masterSvc
      .pdf()
      .generateInventoryEstimate(this.inventoryEstimate, this.company, terms);
    this.masterSvc.pdf().handlePdf(pdf, this.inventoryEstimate.code);
  }
  async share(terms: Term | null) {
    const sharedEstimate = {
      inventoryEstimate: this.inventoryEstimate,
      company: this.company,
      terms: terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: {
          type: 'inventoryEstimate',
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
