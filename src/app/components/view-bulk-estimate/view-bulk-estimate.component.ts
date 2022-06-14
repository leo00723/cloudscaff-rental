import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BulkEstimate } from 'src/app/models/bulkEstimate.model';

@Component({
  selector: 'app-view-bulk-estimate',
  templateUrl: './view-bulk-estimate.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewBulkEstimateComponent {
  @Input() bulkEstimate: BulkEstimate;
  constructor(private modalSvc: ModalController) {}
  close() {
    this.modalSvc.dismiss();
  }
}
