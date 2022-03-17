import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Estimate } from 'src/app/models/estimate.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-view-estimate',
  templateUrl: './view-estimate.component.html',
})
export class ViewEstimateComponent {
  @Input() estimate: Estimate;
  constructor(private masterSvc: MasterService) {}
  close() {
    this.masterSvc.modal().dismiss();
  }
}
