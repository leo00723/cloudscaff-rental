import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
})
export class CustomersPage implements OnInit {
  company$: Observable<Company>;
  constructor(private masterSvc: MasterService) {
    this.company$ = this.masterSvc.auth().company$;
  }

  ngOnInit() {}
}
