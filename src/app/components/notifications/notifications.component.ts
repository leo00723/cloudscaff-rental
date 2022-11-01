import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Company } from 'src/app/models/company.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent implements OnInit {
  company: Company;
  date = new Date();
  constructor(private masterSvc: MasterService) {
    this.company = this.masterSvc.store().selectSnapshot(CompanyState.company);
  }

  close() {
    this.masterSvc.modal().dismiss();
  }
  ngOnInit(): void {}
}
