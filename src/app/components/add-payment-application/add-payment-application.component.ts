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
import { Item } from 'src/app/models/item.model';
import { Site } from 'src/app/models/site.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-add-payment-application',
  templateUrl: './add-payment-application.component.html',
  styles: [],
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

  change(args, scaffold: Item, category: string) {
    switch (category) {
      case 'EP': {
        const value = args.detail.value;
        scaffold.appliedErectionValue = value;
      }
    }
  }

  ngOnInit(): void {}

  close() {
    this.masterSvc.modal().dismiss();
  }
}
