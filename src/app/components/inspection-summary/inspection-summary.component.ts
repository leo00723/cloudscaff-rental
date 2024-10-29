import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { Inspection } from 'src/app/models/inspection.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';

@Component({
  selector: 'app-inspection-summary',
  templateUrl: './inspection-summary.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectionSummaryComponent {
  @Input() inspection: Inspection;
  @Input() canDownload = false;
  terms$: Observable<Term>;
  company: Company;
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
    this.terms$ = this.masterSvc
      .edit()
      .getDocById(`company/${this.company.id}/terms`, 'Inspection');
  }

  close() {
    this.masterSvc.modal().dismiss(null, 'close', 'viewInspection');
  }

  async download(terms: Term | null) {
    const sharedInspection = {
      inspection: this.inspection,
      company: this.company,
      terms,
    };
    await this.masterSvc
      .edit()
      .setDoc(
        'sharedInspections',
        { ...sharedInspection, cc: [], email: [this.inspection.company.email] },
        `${this.company.id}-${this.inspection.id}`
      );
    const pdf = await this.masterSvc
      .pdf()
      .inspection(this.inspection, this.company, terms);
    this.masterSvc.pdf().handlePdf(pdf, this.inspection.code);
  }

  async share(terms: Term | null) {
    const sharedInspection = {
      inspection: this.inspection,
      company: this.company,
      terms,
    };
    const modal = await this.masterSvc.modal().create({
      component: ShareDocumentComponent,
      componentProps: {
        data: { type: 'inspection', doc: sharedInspection },
      },
      showBackdrop: true,
      id: 'shareDocument',
      cssClass: 'accept',
    });
    return await modal.present();
  }
}
