import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Modification } from 'src/app/models/modification.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-modification-summary',
  templateUrl: './modification-summary.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificationSummaryComponent {
  @Input() modification: Modification;
  @Input() canDownload = false;
  terms$: Observable<Term>;
  company: Company;
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.terms$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/terms`, 'modification');
  }
  async download(terms: Term | null) {
    const pdf = await this.masterSvc
      .pdf()
      .generateEstimate(this.modification, this.company, terms);
    this.masterSvc.handlePdf(pdf, this.modification.code);
  }
}
