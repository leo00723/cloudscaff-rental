import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InventoryEstimate } from 'src/app/models/inventoryEstimate.model';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-view-shipment-invoice',
  templateUrl: './view-shipment-invoice.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewShipmentInvoiceComponent {
  @Input() invoice: InventoryEstimate;
  constructor(private masterSvc: MasterService) {}
  close() {
    this.masterSvc.modal().dismiss();
  }
}
