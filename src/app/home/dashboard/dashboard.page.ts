import { Component, OnInit } from '@angular/core';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  active = 'week';
  constructor() {}

  ngOnInit() {}

  segmentChanged(event) {}
}
