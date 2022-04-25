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
import { ShareDocumentComponent } from '../share-document/share-document.component';

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
      .getDocById(`company/${this.company.id}/terms`, 'Estimate');
  }
  async download(terms: Term | null) {
    const sharedModification = {
      modification: this.modification,
      company: this.company,
      terms: terms,
    };
    await this.masterSvc
      .edit()
      .setDoc(
        'sharedModifications',
        {
          ...sharedModification,
          cc: [],
          email: [this.modification.company.email],
        },
        `${this.company.id}-${this.modification.id}`
      );
    const pdf = await this.masterSvc
      .pdf()
      .generateModification(this.modification, this.company, terms);
    this.masterSvc.handlePdf(pdf, this.modification.code);
  }
  async share(terms: Term | null) {
    const sharedModification = {
      modification: this.modification,
      company: this.company,
      terms: terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: { type: 'modification', doc: sharedModification },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
