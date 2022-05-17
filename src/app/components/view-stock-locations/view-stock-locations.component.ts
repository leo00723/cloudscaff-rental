import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { InventoryItem } from 'src/app/models/inventoryItem.model';

@Component({
  selector: 'app-view-stock-locations',
  templateUrl: './view-stock-locations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewStockLocationsComponent {
  @Input() locations$: Observable<{ site: any; item: InventoryItem }[]>;
  constructor(private modalSvc: ModalController) {}

  close() {
    this.modalSvc.dismiss();
  }
}
