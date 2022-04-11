import { Component, Input } from '@angular/core';
import { Modification } from 'src/app/models/modification.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-view-modification',
  templateUrl: './view-modification.component.html',
})
export class ViewModificationComponent {
  @Input() modification: Modification;
  constructor(private masterSvc: MasterService) {}
  close() {
    this.masterSvc.modal().dismiss();
  }
}
