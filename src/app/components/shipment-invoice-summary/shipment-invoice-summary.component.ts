import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

@Component({
  selector: 'app-shipment-invoice-summary',
  templateUrl: './shipment-invoice-summary.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentInvoiceSummaryComponent {
  @Input() enquiryId = '';
  @Input() invoice: InventoryEstimate;
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
    const sharedInvoice = {
      invoice: this.invoice,
      company: this.company,
      terms,
    };
    await this.masterSvc
      .edit()
      .updateDoc(
        'sharedShipmentInvoices',
        `${this.company.id}-${this.invoice.id}`,
        {
          ...sharedInvoice,
          cc: [],
          email: [this.invoice.company.email],
        }
      );
    // const pdf = await this.masterSvc
    //   .pdf()
    //   .generateInventoryEstimate(this.invoice, this.company, terms);
    // this.masterSvc.pdf().handlePdf(pdf, this.invoice.code);
  }
  async share(terms: Term | null) {
    const sharedInvoice = {
      invoice: this.invoice,
      company: this.company,
      terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: {
          type: 'shipmentInvoice',
          doc: sharedInvoice,
        },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
