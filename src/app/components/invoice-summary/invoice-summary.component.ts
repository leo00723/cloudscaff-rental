import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

@Component({
  selector: 'app-invoice-summary',
  templateUrl: './invoice-summary.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceSummaryComponent {
  @Input() invoice: Invoice;
  @Input() canDownload = false;
  terms$: Observable<Term>;
  company: Company;
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.terms$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/terms`, 'Invoice');
  }
  async download(terms: Term | null) {
    const sharedInvoice = {
      invoice: this.invoice,
      company: this.company,
      terms: terms,
    };
    await this.masterSvc
      .edit()
      .setDoc(
        'sharedInvoices',
        { ...sharedInvoice, cc: [], email: [this.invoice.company.email] },
        `${this.company.id}-${this.invoice.id}`
      );
    const pdf = await this.masterSvc
      .pdf()
      .generateInvoice(this.invoice, this.company, terms);
    this.masterSvc.pdf().handlePdf(pdf, this.invoice.code);
  }
  async share(terms: Term | null) {
    const sharedInvoice = {
      invoice: this.invoice,
      company: this.company,
      terms: terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: { type: 'invoice', doc: sharedInvoice },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
