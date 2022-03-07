import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-estimate-summary',
  templateUrl: './estimate-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimateSummaryComponent {
  @Input() estimate: Estimate;
  company: Company;
  constructor(private store: Store) {
    this.company = this.store.selectSnapshot(CompanyState.company);
  }
}
