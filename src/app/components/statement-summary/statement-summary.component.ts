import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

@Component({
  selector: 'app-statement-summary',
  templateUrl: './statement-summary.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementSummaryComponent {
  @Input() statement;
  @Input() canDownload = false;
  terms$: Observable<Term>;
  company: Company;

  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.terms$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/terms`, 'Statement');
  }

  async download(terms: Term | null) {
    // const sharedStatement = {
    //   statement: this.statement,
    //   company: this.company,
    //   terms: terms,
    // };
    // await this.masterSvc
    //   .edit()
    //   .setDoc(
    //     'sharedStatements',
    //     { ...sharedStatement, cc: [], email: [this.company.email] },
    //     `${this.company.id}-${this.statement.id}`
    //   );
    const pdf = await this.masterSvc
      .pdf()
      .generateStatement(this.statement, this.company, terms);
    this.masterSvc
      .pdf()
      .handlePdf(
        pdf,
        `${this.statement.customer.name}-Statement-${this.statement.dates.date}`
      );
  }
  async share(terms: Term | null) {
    const sharedStatement = {
      statement: this.statement,
      company: this.company,
      terms: terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: { type: 'statement', doc: sharedStatement },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
