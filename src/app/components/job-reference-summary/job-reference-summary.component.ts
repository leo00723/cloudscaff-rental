import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Company } from 'src/app/models/company.model';
import { EstimateV2 } from 'src/app/models/estimate-v2.model';
import { CompanyState } from 'src/app/shared/company/company.state';
import cloneDeep from 'lodash/cloneDeep';
@Component({
  selector: 'app-job-reference-summary',
  templateUrl: './job-reference-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class POSummaryComponent {
  @Input() set value(val: EstimateV2) {
    if (val) {
      this.estimate = cloneDeep(val);
    }
  }
  @Input() canDownload = false;
  @Input() showUploads = false;
  @Input() customInvoice = false;
  @Input() isInvoice = false;
  @Output() update = new EventEmitter<EstimateV2>();
  estimate: EstimateV2;
  company: Company;
  private store = inject(Store);
  constructor() {
    this.company = this.store.selectSnapshot(CompanyState.company);
  }

  get filteredItems() {
    return this.isInvoice
      ? this.estimate.items.filter((item) => item.forInvoice)
      : this.estimate.items;
  }

  addToInvoice(args, index: number) {
    this.estimate.items[index].forInvoice = args.detail.checked;
    this.update.emit(this.estimate);
  }
}
