import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Credit } from 'src/app/models/credit.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

@Component({
  selector: 'app-credit-summary',
  templateUrl: './credit-summary.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditSummaryComponent {
  @Input() credit: Credit;
  @Input() canDownload = false;
  terms$: Observable<Term>;
  company: Company;
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.terms$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/terms`, 'credit');
  }
  async download(terms: Term | null) {
    const sharedCredit = {
      credit: this.credit,
      company: this.company,
      terms: terms,
    };
    await this.masterSvc
      .edit()
      .setDoc(
        'sharedCredits',
        { ...sharedCredit, cc: [], email: [this.credit.company.email] },
        `${this.company.id}-${this.credit.id}`
      );
    // const pdf = await this.masterSvc
    //   .pdf()
    //   .generateCredit(this.credit, this.company, terms);
    // this.masterSvc.handlePdf(pdf, this.credit.code);
  }
  async share(terms: Term | null) {
    const sharedCredit = {
      credit: this.credit,
      company: this.company,
      terms: terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: { type: 'credit', doc: sharedCredit },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
