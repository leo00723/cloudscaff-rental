import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Company } from 'src/app/models/company.model';
import { InventoryEstimateRent } from 'src/app/models/inventory-estimate-rent.model';
import { Term } from 'src/app/models/term.model';
import { PdfService } from 'src/app/services/pdf.service';
import { CompanyState } from 'src/app/shared/company/company.state';
@Component({
  selector: 'app-job-reference-rental-summary',
  templateUrl: './job-reference-rental-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PORentalSummaryComponent {
  @Input() set value(val: InventoryEstimateRent) {
    if (val) {
      this.estimate = val;
    }
  }
  @Input() canDownload = false;
  @Input() showUploads = false;
  estimate: InventoryEstimateRent;
  company: Company;

  private store = inject(Store);
  private pdfSvc = inject(PdfService);
  constructor() {
    this.company = this.store.selectSnapshot(CompanyState.company);
  }
}
