import { Component, Input, OnInit } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { LabourBroker } from 'src/app/models/labour-broker.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-add-broker',
  templateUrl: './add-broker.component.html',
})
export class AddBrokerComponent {
  @Input() company: Company;
  @Input() broker: LabourBroker;
  @Input() isEdit: boolean;
  @Input() isCreate: boolean;
  @Input() isDelete: boolean;
  constructor(private masterSvc: MasterService) {}
  close() {
    this.masterSvc.modal().dismiss();
  }
}
