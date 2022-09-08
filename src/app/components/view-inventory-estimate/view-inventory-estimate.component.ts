import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BulkInventoryEstimate } from 'src/app/models/bulkInventoryEstimate.model';

@Component({
  selector: 'app-view-inventory-estimate',
  templateUrl: './view-inventory-estimate.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInventoryEstimateComponent {
  @Input() bulkInventoryEstimate: BulkInventoryEstimate;
  constructor(private modalSvc: ModalController) {}
  close() {
    this.modalSvc.dismiss();
  }
}
