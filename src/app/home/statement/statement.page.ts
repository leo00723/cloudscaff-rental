import { Component, OnInit } from '@angular/core';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-statement',
  templateUrl: './statement.page.html',
})
export class StatementPage implements OnInit {
  isLoading = true;
  constructor(private masterSvc: MasterService) {}

  ngOnInit() {
    this.init();
  }

  init() {
    let id = this.masterSvc.store().selectSnapshot(CompanyState.company)?.id;

    setTimeout(() => {
      if (id) {
        this.isLoading = false;
      } else {
        this.masterSvc.log(
          '-----------------------try statements----------------------'
        );
        this.init();
      }
    }, 200);
  }
}
