import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Customer } from 'src/app/models/customer.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
})
export class AddCustomerComponent {
  @Input() companyId: string;
  @Input() customer: Customer;
  @Input() isEdit: boolean;
  @Input() isCreate: boolean;
  constructor(private masterSvc: MasterService) {}
  close() {
    this.masterSvc.modal().dismiss();
  }
}
