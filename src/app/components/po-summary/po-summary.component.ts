import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { Term } from 'src/app/models/term.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';
import { ShareDocumentComponent } from '../share-document/share-document.component';
@Component({
  selector: 'app-po-summary',
  templateUrl: './po-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class POSummaryComponent {
  @Input() set value(val: EstimateV2) {
    if (val) {
      this.estimate = val;
    }
  }
  @Input() canDownload = false;
  @Input() showUploads = false;
  estimate: EstimateV2;
  company: Company;
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }
}
