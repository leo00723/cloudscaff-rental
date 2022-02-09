import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/models/company.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-labour',
  templateUrl: './labour.page.html',
})
export class LabourPage implements OnInit {
  company$: Observable<Company>;
  constructor(private masterSvc: MasterService) {
    this.company$ = this.masterSvc.auth().company$;
  }

  ngOnInit() {}
}
