import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Observable } from 'rxjs';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';
import { Company } from 'src/app/models/company.model';
import { Estimate } from 'src/app/models/estimate.model';
import { Site } from 'src/app/models/site.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-add-payment-application',
  templateUrl: './add-payment-application.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPaymentApplicationComponent implements OnInit {
  @Input() isEdit = false;
  @Input() site$: Observable<Site>;
  @Input() estimates$: Observable<Estimate[]>;
  @Input() bulkEstimates: BulkEstimate[];

  loading = false;
  company: Company;
  date = new Date();

  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  ngOnInit(): void {}

  close() {
    this.masterSvc.modal().dismiss();
  }
}
